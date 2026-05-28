import cors from "cors";
import express from "express";
import helmet from "helmet";
import QRCode from "qrcode";
import { signSession, requireAuth } from "./auth";
import { store } from "./store";
import { adminLoginSchema, hospitalLoginSchema, patientSchema } from "./validators";
import type { Patient } from "./types";

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: "6mb" }));

const publicBaseUrl = () => process.env.PUBLIC_URL || "https://mediform.com";
const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
};
const newPublicId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "MediForm API" });
});

app.post("/api/auth/hospital", async (req, res) => {
  const parsed = hospitalLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Revise los campos obligatorios y la contraseña segura" });

  const hospital = await store.findHospitalByCredentials(parsed.data.email, parsed.data.code);
  if (!hospital || hospital.status !== "approved" || new Date(hospital.codeExpiresAt) < new Date()) {
    await store.addLog({ actor: parsed.data.email, action: "Login hospitalario", result: "denied" });
    return res.status(401).json({ message: "Código hospitalario inválido, expirado o no aprobado" });
  }

  const token = signSession({ id: hospital.id, role: "hospital", name: hospital.name, email: hospital.email });
  await store.addLog({ hospitalId: hospital.id, actor: hospital.name, action: "Login hospitalario", result: "allowed" });
  res.json({ token, user: { id: hospital.id, role: "hospital", name: hospital.name, email: hospital.email }, hospital });
});

app.post("/api/auth/admin", async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Usuario y contraseña obligatorios" });

  if (parsed.data.username !== "admin" || parsed.data.password !== "Mediform2026") {
    await store.addLog({ actor: parsed.data.username, action: "Login administrador", result: "denied" });
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  const token = signSession({ id: "ADMIN-001", role: "admin", name: "Administrador MediForm" });
  await store.addLog({ actor: "Administrador MediForm", action: "Login administrador", result: "allowed" });
  res.json({ token, user: { id: "ADMIN-001", role: "admin", name: "Administrador MediForm" } });
});

app.get("/api/hospitals", requireAuth(["admin"]), async (_req, res) => {
  res.json(await store.listHospitals());
});

app.post("/api/hospitals", requireAuth(["admin"]), async (req, res) => {
  const hospital = await store.upsertHospital({
    id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    status: req.body.status,
    code: req.body.code
  });
  res.json(hospital);
});

app.get("/api/patients", requireAuth(["hospital", "admin"]), async (req, res) => {
  const hospitalId = req.user?.role === "hospital" ? req.user.id : undefined;
  res.json(await store.listPatients(hospitalId));
});

app.post("/api/patients", requireAuth(["hospital"]), async (req, res) => {
  const parsed = patientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Complete todos los datos médicos obligatorios" });

  const publicId = req.body.publicId || newPublicId();
  const profileUrl = `${publicBaseUrl()}/profile/${publicId}`;
  const qrCode = await QRCode.toDataURL(profileUrl);
  const patient: Patient = {
    ...parsed.data,
    id: req.body.id || `PAT-${Date.now()}`,
    publicId,
    hospitalId: req.user!.id,
    age: calculateAge(parsed.data.birthDate),
    profileUrl,
    qrCode,
    nfcLinked: true,
    updatedAt: new Date().toISOString()
  };

  await store.savePatient(patient);
  await store.addLog({ hospitalId: req.user!.id, patientPublicId: patient.publicId, actor: req.user!.name, action: "Guardar paciente", result: "allowed" });
  res.json(patient);
});

app.patch("/api/patients/:publicId/history", requireAuth(["hospital"]), async (req, res) => {
  const patient = await store.findPatient(req.params.publicId);
  if (!patient || patient.hospitalId !== req.user!.id) return res.status(404).json({ message: "Paciente no encontrado" });
  patient.medicalHistory = [String(req.body.note || "Actualización médica"), ...patient.medicalHistory];
  patient.updatedAt = new Date().toISOString();
  await store.savePatient(patient);
  res.json(patient);
});

app.get("/api/profile/:publicId", async (req, res) => {
  const patient = await store.findPatient(req.params.publicId);
  if (!patient) return res.status(404).json({ message: "Perfil no encontrado" });
  res.json({ publicId: patient.publicId, exists: true, requiresHospitalValidation: true });
});

app.post("/api/profile/:publicId/validate", async (req, res) => {
  const patient = await store.findPatient(req.params.publicId);
  const hospital = await store.findHospitalByCredentials(req.body.email, req.body.code);

  if (!patient || !hospital || hospital.status !== "approved" || new Date(hospital.codeExpiresAt) < new Date()) {
    await store.addLog({ patientPublicId: req.params.publicId, actor: req.body.email || "Acceso NFC", action: "Validación perfil NFC", result: "denied" });
    return res.status(403).json({ message: "Validación hospitalaria denegada" });
  }

  const authorized = {
    publicId: patient.publicId,
    fullName: patient.fullName,
    age: patient.age,
    gender: patient.gender,
    bloodType: patient.bloodType,
    emergencyContact: patient.emergencyContact,
    phone: patient.phone,
    relation: patient.relation,
    conditions: patient.conditions,
    medications: patient.medications,
    allergies: patient.allergies,
    doctor: patient.doctor,
    observations: patient.observations,
    priority: patient.priority,
    status: patient.status,
    medicalHistory: patient.medicalHistory,
    updatedAt: patient.updatedAt
  };

  await store.addLog({ hospitalId: hospital.id, patientPublicId: patient.publicId, actor: hospital.name, action: "Consulta perfil NFC", result: "allowed" });
  res.json(authorized);
});

app.get("/api/logs", requireAuth(["hospital", "admin"]), async (req, res) => {
  const hospitalId = req.user?.role === "hospital" ? req.user.id : undefined;
  res.json(await store.listLogs(hospitalId));
});

app.get("/api/stats", requireAuth(["hospital", "admin"]), async (req, res) => {
  const scopedPatients = req.user?.role === "hospital" ? await store.listPatients(req.user.id) : await store.listPatients();
  const logs = await store.listLogs();
  const hospitals = await store.listHospitals();
  res.json({
    patients: scopedPatients.length,
    critical: scopedPatients.filter((patient) => patient.priority === "Crítica" || patient.status === "Crítico").length,
    accesses: logs.length,
    hospitals: hospitals.length
  });
});

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`MediForm API ready on http://localhost:${port}`);
  });
}

export default app;
