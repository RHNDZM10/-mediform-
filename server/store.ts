import type { AccessLog, Hospital, Patient } from "./types";
import { createClient } from "@supabase/supabase-js";

const now = () => new Date().toISOString();
const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

const hospitals: Hospital[] = [
  {
    id: "HSP-001",
    name: "Hospital Central MediForm",
    email: "hospital@mediform.test",
    code: "MEDI-2026",
    codeExpiresAt: inDays(14),
    status: "approved",
    createdAt: now()
  },
  {
    id: "HSP-002",
    name: "Clínica Santa Elena",
    email: "santaelena@mediform.test",
    code: "PENDING-77",
    codeExpiresAt: inDays(8),
    status: "pending",
    createdAt: now()
  }
];

const patients: Patient[] = [
  {
    id: "PAT-001",
    publicId: "AB92KD",
    hospitalId: "HSP-001",
    fullName: "María Elena Vargas",
    birthDate: "1944-08-12",
    age: 81,
    gender: "Femenino",
    bloodType: "O+",
    emergencyContact: "Carlos Vargas",
    phone: "+506 8888-1212",
    relation: "Hijo",
    conditions: "Hipertensión arterial, diabetes tipo 2",
    medications: "Losartán 50 mg, Metformina 850 mg",
    allergies: "Penicilina",
    doctor: "Dra. Sofía Méndez",
    observations: "Movilidad reducida. Priorizar hidratación y monitoreo de glucosa.",
    priority: "Alta",
    status: "Observación",
    medicalHistory: ["Control cardiológico actualizado", "Última glucosa registrada: 118 mg/dL"],
    profileUrl: "/profile/AB92KD",
    nfcLinked: true,
    updatedAt: now()
  },
  {
    id: "PAT-002",
    publicId: "K7Q4LZ",
    hospitalId: "HSP-001",
    fullName: "Roberto Solís",
    birthDate: "1938-02-03",
    age: 88,
    gender: "Masculino",
    bloodType: "A-",
    emergencyContact: "Ana Solís",
    phone: "+506 8777-4040",
    relation: "Nieto",
    conditions: "EPOC leve",
    medications: "Salbutamol inhalador",
    allergies: "Ninguna registrada",
    doctor: "Dr. Andrés Rojas",
    observations: "Usa oxígeno nocturno ocasionalmente.",
    priority: "Media",
    status: "Estable",
    medicalHistory: ["Espirometría revisada", "Vacunación al día"],
    profileUrl: "/profile/K7Q4LZ",
    nfcLinked: true,
    updatedAt: now()
  }
];

const accessLogs: AccessLog[] = [
  {
    id: "LOG-001",
    patientPublicId: "AB92KD",
    hospitalId: "HSP-001",
    actor: "Hospital Central MediForm",
    action: "Consulta perfil NFC",
    result: "allowed",
    createdAt: now()
  }
];

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const toHospital = (row: any): Hospital => ({
  id: row.id,
  name: row.name,
  email: row.email,
  code: row.code,
  codeExpiresAt: row.code_expires_at,
  status: row.status,
  createdAt: row.created_at
});

const toPatient = (row: any): Patient => ({
  id: row.id,
  publicId: row.public_id,
  hospitalId: row.hospital_id,
  fullName: row.full_name,
  photo: row.photo,
  birthDate: row.birth_date,
  age: row.age,
  gender: row.gender,
  bloodType: row.blood_type,
  emergencyContact: row.emergency_contact,
  phone: row.phone,
  relation: row.relation,
  conditions: row.conditions,
  medications: row.medications,
  allergies: row.allergies,
  doctor: row.doctor,
  observations: row.observations,
  priority: row.priority,
  status: row.status,
  medicalHistory: row.medical_history || [],
  profileUrl: row.profile_url,
  qrCode: row.qr_code,
  nfcLinked: row.nfc_linked,
  updatedAt: row.updated_at
});

const fromPatient = (patient: Patient) => ({
  id: patient.id,
  public_id: patient.publicId,
  hospital_id: patient.hospitalId,
  full_name: patient.fullName,
  photo: patient.photo,
  birth_date: patient.birthDate,
  age: patient.age,
  gender: patient.gender,
  blood_type: patient.bloodType,
  emergency_contact: patient.emergencyContact,
  phone: patient.phone,
  relation: patient.relation,
  conditions: patient.conditions,
  medications: patient.medications,
  allergies: patient.allergies,
  doctor: patient.doctor,
  observations: patient.observations,
  priority: patient.priority,
  status: patient.status,
  medical_history: patient.medicalHistory,
  profile_url: patient.profileUrl,
  qr_code: patient.qrCode,
  nfc_linked: patient.nfcLinked,
  updated_at: patient.updatedAt
});

const toLog = (row: any): AccessLog => ({
  id: row.id,
  patientPublicId: row.patient_public_id,
  hospitalId: row.hospital_id,
  actor: row.actor,
  action: row.action,
  result: row.result,
  createdAt: row.created_at
});

export const store = {
  hospitals,
  patients,
  accessLogs,
  async findHospitalByCredentials(email: string, code: string) {
    if (supabase) {
      const { data } = await supabase.from("hospitals").select("*").eq("email", email).eq("code", code).maybeSingle();
      return data ? toHospital(data) : undefined;
    }
    return hospitals.find((hospital) => hospital.email === email && hospital.code === code);
  },
  async findHospital(id: string) {
    if (supabase) {
      const { data } = await supabase.from("hospitals").select("*").eq("id", id).maybeSingle();
      return data ? toHospital(data) : undefined;
    }
    return hospitals.find((hospital) => hospital.id === id);
  },
  async listHospitals() {
    if (supabase) {
      const { data } = await supabase.from("hospitals").select("*").order("created_at", { ascending: false });
      return (data || []).map(toHospital);
    }
    return hospitals;
  },
  async upsertHospital(input: Partial<Hospital> & Pick<Hospital, "name" | "email">) {
    if (supabase && input.id) {
      const { data } = await supabase.from("hospitals").select("*").eq("id", input.id).maybeSingle();
      const existing = data ? toHospital(data) : undefined;
      const hospital: Hospital = {
        id: input.id,
        name: input.name ?? existing?.name ?? "",
        email: input.email ?? existing?.email ?? "",
        code: input.code ?? existing?.code ?? `MF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        codeExpiresAt: input.codeExpiresAt ?? existing?.codeExpiresAt ?? inDays(14),
        status: input.status ?? existing?.status ?? "pending",
        createdAt: existing?.createdAt ?? now()
      };
      await supabase.from("hospitals").upsert({
        id: hospital.id,
        name: hospital.name,
        email: hospital.email,
        code: hospital.code,
        code_expires_at: hospital.codeExpiresAt,
        status: hospital.status,
        created_at: hospital.createdAt
      });
      return hospital;
    }
    if (input.id) {
      const index = hospitals.findIndex((hospital) => hospital.id === input.id);
      if (index >= 0) {
        hospitals[index] = { ...hospitals[index], ...input };
        if (supabase) {
          await supabase.from("hospitals").upsert({
            id: hospitals[index].id,
            name: hospitals[index].name,
            email: hospitals[index].email,
            code: hospitals[index].code,
            code_expires_at: hospitals[index].codeExpiresAt,
            status: hospitals[index].status,
            created_at: hospitals[index].createdAt
          });
        }
        return hospitals[index];
      }
    }
    const hospital: Hospital = {
      id: `HSP-${String(hospitals.length + 1).padStart(3, "0")}`,
      name: input.name,
      email: input.email,
      code: input.code ?? `MF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      codeExpiresAt: input.codeExpiresAt ?? inDays(14),
      status: input.status ?? "pending",
      createdAt: now()
    };
    if (supabase) {
      await supabase.from("hospitals").upsert({
        id: hospital.id,
        name: hospital.name,
        email: hospital.email,
        code: hospital.code,
        code_expires_at: hospital.codeExpiresAt,
        status: hospital.status,
        created_at: hospital.createdAt
      });
    }
    hospitals.unshift(hospital);
    return hospital;
  },
  async listPatients(hospitalId?: string) {
    if (supabase) {
      let query = supabase.from("patients").select("*").order("updated_at", { ascending: false });
      if (hospitalId) query = query.eq("hospital_id", hospitalId);
      const { data } = await query;
      return (data || []).map(toPatient);
    }
    return hospitalId ? patients.filter((patient) => patient.hospitalId === hospitalId) : patients;
  },
  async findPatient(publicId: string) {
    if (supabase) {
      const { data } = await supabase.from("patients").select("*").eq("public_id", publicId).maybeSingle();
      return data ? toPatient(data) : undefined;
    }
    return patients.find((patient) => patient.publicId === publicId);
  },
  async savePatient(patient: Patient) {
    if (supabase) {
      await supabase.from("patients").upsert(fromPatient(patient));
    }
    const index = patients.findIndex((item) => item.publicId === patient.publicId);
    if (index >= 0) {
      patients[index] = patient;
      return patient;
    }
    patients.unshift(patient);
    return patient;
  },
  async addLog(log: Omit<AccessLog, "id" | "createdAt">) {
    const saved = { ...log, id: `LOG-${String(accessLogs.length + 1).padStart(3, "0")}`, createdAt: now() };
    if (supabase) {
      await supabase.from("access_logs").insert({
        id: saved.id,
        patient_public_id: saved.patientPublicId,
        hospital_id: saved.hospitalId,
        actor: saved.actor,
        action: saved.action,
        result: saved.result,
        created_at: saved.createdAt
      });
    }
    accessLogs.unshift(saved);
    return saved;
  },
  async listLogs(hospitalId?: string) {
    if (supabase) {
      let query = supabase.from("access_logs").select("*").order("created_at", { ascending: false });
      if (hospitalId) query = query.eq("hospital_id", hospitalId);
      const { data } = await query;
      return (data || []).map(toLog);
    }
    return hospitalId ? accessLogs.filter((log) => log.hospitalId === hospitalId) : accessLogs;
  }
};
