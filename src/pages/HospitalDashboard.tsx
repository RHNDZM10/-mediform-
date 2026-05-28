import { Activity, FileDown, History, Nfc, Plus, Save, Search, Settings, Stethoscope } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Loading } from "../components/Loading";
import { Protected } from "../components/Protected";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api, calculateAge, formatDate } from "../lib/api";
import type { AccessLog, Patient } from "../lib/types";

type PatientForm = {
  fullName: string;
  photo: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  emergencyContact: string;
  phone: string;
  relation: string;
  conditions: string;
  medications: string;
  allergies: string;
  doctor: string;
  observations: string;
  priority: Patient["priority"];
  status: Patient["status"];
  medicalHistory: string[];
};

const blankPatient: PatientForm = {
  fullName: "",
  photo: "",
  birthDate: "",
  gender: "Femenino",
  bloodType: "O+",
  emergencyContact: "",
  phone: "",
  relation: "",
  conditions: "",
  medications: "",
  allergies: "",
  doctor: "",
  observations: "",
  priority: "Media" as const,
  status: "Estable" as const,
  medicalHistory: [] as string[]
};

export function HospitalDashboard() {
  return (
    <Protected role="hospital">
      <HospitalDashboardContent />
    </Protected>
  );
}

function HospitalDashboardContent() {
  const { token, user } = useAuth();
  const [active, setActive] = useState("pacientes");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState({ patients: 0, critical: 0, accesses: 0, hospitals: 0 });
  const [form, setForm] = useState(blankPatient);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const nav = [
    { key: "pacientes", label: "Registrar paciente", icon: <Plus className="h-4 w-4" /> },
    { key: "buscar", label: "Buscar paciente", icon: <Search className="h-4 w-4" /> },
    { key: "historial", label: "Historial de accesos", icon: <History className="h-4 w-4" /> },
    { key: "config", label: "Configuración hospital", icon: <Settings className="h-4 w-4" /> }
  ];

  async function load() {
    setLoading(true);
    const [patientData, logData, statData] = await Promise.all([
      api<Patient[]>("/patients", { token }),
      api<AccessLog[]>("/logs", { token }),
      api<typeof stats>("/stats", { token })
    ]);
    setPatients(patientData);
    setLogs(logData);
    setStats(statData);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const filteredPatients = useMemo(() => {
    const normalized = query.toLowerCase();
    return patients.filter((patient) => `${patient.fullName} ${patient.publicId}`.toLowerCase().includes(normalized));
  }, [patients, query]);

  async function savePatient(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      id: editing?.id,
      publicId: editing?.publicId,
      age: calculateAge(form.birthDate)
    };
    const saved = await api<Patient>("/patients", { method: "POST", token, body: JSON.stringify(payload) });
    setMessage(`Paciente guardado. URL NFC: ${saved.profileUrl}`);
    setForm(blankPatient);
    setEditing(null);
    await load();
  }

  function editPatient(patient: Patient) {
    setEditing(patient);
    setForm({
      fullName: patient.fullName,
      photo: patient.photo || "",
      birthDate: patient.birthDate,
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
      medicalHistory: patient.medicalHistory
    });
    setActive("pacientes");
  }

  return (
    <DashboardLayout title="Dashboard Hospital" subtitle="Registro clínico, vínculo NFC, QR y control de accesos." nav={nav} active={active} onActive={setActive}>
      {loading ? <Loading /> : null}
      {!loading && (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Pacientes" value={stats.patients} detail="Registrados por el hospital" />
            <StatCard label="Prioridad alta" value={stats.critical} detail="Requieren atención rápida" />
            <StatCard label="Accesos" value={stats.accesses} detail="Eventos auditados" />
            <StatCard label="NFC" value={patients.filter((patient) => patient.nfcLinked).length} detail="Vinculaciones activas" />
          </div>

          {active === "pacientes" && (
            <section className="panel rounded-2xl p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">{editing ? "Editar paciente" : "Formulario paciente"}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Al guardar se genera ID, URL única, QR y vinculación NFC.</p>
                </div>
                <Nfc className="h-8 w-8 text-med-700 dark:text-med-300" />
              </div>
              <form onSubmit={savePatient} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <input className="field md:col-span-2" required placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  <input className="field" placeholder="Foto URL o base64" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
                  <input className="field" required type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
                  <input className="field" disabled value={`Edad automática: ${form.birthDate ? calculateAge(form.birthDate) : 0}`} />
                  <select className="field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option>Femenino</option>
                    <option>Masculino</option>
                    <option>Otro</option>
                  </select>
                  <select className="field" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })}>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <input className="field" required placeholder="Contacto emergencia" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
                  <input className="field" required placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <input className="field" required placeholder="Relación" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
                  <input className="field" required placeholder="Médico responsable" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} />
                  <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Patient["priority"] })}>
                    {["Baja", "Media", "Alta", "Crítica"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Patient["status"] })}>
                    {["Estable", "Observación", "Crítico"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <textarea className="field min-h-28" required placeholder="Enfermedades relevantes" value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} />
                  <textarea className="field min-h-28" required placeholder="Medicamentos actuales" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
                  <textarea className="field min-h-28" required placeholder="Alergias" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
                  <textarea className="field min-h-28" required placeholder="Observaciones" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
                </div>
                {message ? <p className="rounded-lg bg-med-50 p-3 text-sm font-semibold text-med-800 dark:bg-white/10 dark:text-med-100">{message}</p> : null}
                <button className="primary-button w-full sm:w-fit">
                  <Save className="h-4 w-4" />
                  Guardar paciente
                </button>
              </form>
            </section>
          )}

          {active === "buscar" && (
            <section className="panel rounded-2xl p-5">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-black">Tabla pacientes</h2>
                <input className="field max-w-sm" placeholder="Buscar por nombre o ID" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500 dark:text-slate-300">
                    <tr>
                      <th className="py-3">Nombre</th>
                      <th>Edad</th>
                      <th>Estado</th>
                      <th>Última actualización</th>
                      <th>URL / QR</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.publicId}>
                        <td className="py-4 font-semibold">{patient.fullName}<span className="block text-xs text-slate-500">{patient.publicId}</span></td>
                        <td>{patient.age}</td>
                        <td><span className="rounded-full bg-med-50 px-3 py-1 text-xs font-bold text-med-800 dark:bg-white/10 dark:text-med-100">{patient.status}</span></td>
                        <td>{formatDate(patient.updatedAt)}</td>
                        <td><a className="font-semibold text-med-700 dark:text-med-300" href={`/profile/${patient.publicId}`}>{patient.profileUrl}</a></td>
                        <td><button className="secondary-button px-3 py-2" onClick={() => editPatient(patient)}>Editar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === "historial" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="mb-5 text-xl font-black">Historial de accesos</h2>
              <div className="grid gap-3">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-100 p-4 dark:border-white/10">
                    <p className="font-semibold">{log.action} · {log.result === "allowed" ? "Autorizado" : "Denegado"}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{log.actor} · {log.patientPublicId || "Sistema"} · {formatDate(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "config" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="text-xl font-black">Configuración hospital</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-med-50 p-4 text-med-900 dark:bg-white/10 dark:text-white"><Stethoscope className="mb-3 h-5 w-5" />{user?.name}</div>
                <div className="rounded-xl bg-med-50 p-4 text-med-900 dark:bg-white/10 dark:text-white"><Activity className="mb-3 h-5 w-5" />Código renovable cada 14 días</div>
                <button className="secondary-button justify-start" onClick={() => window.print()}><FileDown className="h-4 w-4" />Exportar PDF</button>
              </div>
            </section>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
