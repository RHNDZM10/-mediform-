import { BarChart3, Building2, CheckCircle2, Eye, FileClock, Settings, Users } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Loading } from "../components/Loading";
import { Protected } from "../components/Protected";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api, formatDate } from "../lib/api";
import type { AccessLog, Hospital, Patient } from "../lib/types";

export function AdminDashboard() {
  return (
    <Protected role="admin">
      <AdminDashboardContent />
    </Protected>
  );
}

function AdminDashboardContent() {
  const { token } = useAuth();
  const [active, setActive] = useState("hospitales");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState({ patients: 0, critical: 0, accesses: 0, hospitals: 0 });
  const [form, setForm] = useState({ name: "", email: "", code: "", status: "approved" as Hospital["status"] });
  const [loading, setLoading] = useState(true);

  const nav = [
    { key: "hospitales", label: "Crear hospitales", icon: <Building2 className="h-4 w-4" /> },
    { key: "aprobar", label: "Aprobar hospitales", icon: <CheckCircle2 className="h-4 w-4" /> },
    { key: "pacientes", label: "Ver pacientes", icon: <Users className="h-4 w-4" /> },
    { key: "stats", label: "Estadísticas", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "accesos", label: "Ver accesos", icon: <Eye className="h-4 w-4" /> },
    { key: "global", label: "Configuración global", icon: <Settings className="h-4 w-4" /> }
  ];

  async function load() {
    setLoading(true);
    const [hospitalData, patientData, logData, statData] = await Promise.all([
      api<Hospital[]>("/hospitals", { token }),
      api<Patient[]>("/patients", { token }),
      api<AccessLog[]>("/logs", { token }),
      api<typeof stats>("/stats", { token })
    ]);
    setHospitals(hospitalData);
    setPatients(patientData);
    setLogs(logData);
    setStats(statData);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function saveHospital(event: FormEvent) {
    event.preventDefault();
    await api<Hospital>("/hospitals", { method: "POST", token, body: JSON.stringify(form) });
    setForm({ name: "", email: "", code: "", status: "approved" });
    await load();
  }

  async function approve(hospital: Hospital) {
    await api<Hospital>("/hospitals", { method: "POST", token, body: JSON.stringify({ ...hospital, status: "approved" }) });
    await load();
  }

  return (
    <DashboardLayout title="Dashboard Administrador" subtitle="Control global de hospitales, pacientes, accesos y reglas de plataforma." nav={nav} active={active} onActive={setActive}>
      {loading ? <Loading /> : null}
      {!loading && (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Hospitales" value={stats.hospitals} detail="Instituciones registradas" />
            <StatCard label="Pacientes" value={stats.patients} detail="Perfiles médicos activos" />
            <StatCard label="Críticos" value={stats.critical} detail="Nivel de prioridad mayor" />
            <StatCard label="Accesos" value={stats.accesses} detail="Eventos auditados" />
          </div>

          {active === "hospitales" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="text-xl font-black">Crear y editar hospitales</h2>
              <form onSubmit={saveHospital} className="mt-5 grid gap-4 md:grid-cols-4">
                <input className="field" required placeholder="Nombre hospital" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="field" required type="email" placeholder="Correo institucional" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="field" placeholder="Código hospitalario" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Hospital["status"] })}>
                  <option value="approved">Aprobado</option>
                  <option value="pending">Pendiente</option>
                  <option value="suspended">Suspendido</option>
                </select>
                <button className="primary-button md:col-span-4">Guardar hospital</button>
              </form>
            </section>
          )}

          {active === "aprobar" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="mb-5 text-xl font-black">Aprobar hospitales</h2>
              <div className="grid gap-3">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{hospital.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{hospital.email} · {hospital.code} · expira {new Date(hospital.codeExpiresAt).toLocaleDateString("es-CR")}</p>
                    </div>
                    <button className="secondary-button px-3 py-2" onClick={() => approve(hospital)}>{hospital.status === "approved" ? "Aprobado" : "Aprobar"}</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "pacientes" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="mb-5 text-xl font-black">Ver pacientes</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500 dark:text-slate-300"><tr><th className="py-3">Nombre</th><th>Edad</th><th>Prioridad</th><th>Perfil</th><th>Actualización</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                    {patients.map((patient) => (
                      <tr key={patient.publicId}><td className="py-4 font-semibold">{patient.fullName}</td><td>{patient.age}</td><td>{patient.priority}</td><td><a className="text-med-700 dark:text-med-300" href={`/profile/${patient.publicId}`}>{patient.publicId}</a></td><td>{formatDate(patient.updatedAt)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === "stats" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="text-xl font-black">Dashboard analítico</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {["NFC activos", "Validaciones permitidas", "Intentos denegados"].map((label, index) => (
                  <div key={label} className="rounded-xl bg-med-50 p-5 dark:bg-white/10">
                    <p className="label">{label}</p>
                    <div className="mt-4 h-2 rounded-full bg-white dark:bg-white/10">
                      <div className="h-2 rounded-full bg-med-700" style={{ width: `${80 - index * 18}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "accesos" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="mb-5 text-xl font-black">Ver accesos</h2>
              <div className="grid gap-3">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-100 p-4 dark:border-white/10">
                    <p className="font-semibold">{log.action} · {log.result}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{log.actor} · {log.patientPublicId || "Plataforma"} · {formatDate(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "global" && (
            <section className="panel rounded-2xl p-5">
              <h2 className="text-xl font-black">Configuración global</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-med-50 p-4 dark:bg-white/10"><FileClock className="mb-3 h-5 w-5 text-med-700" />Sesión JWT: 15 min</div>
                <div className="rounded-xl bg-med-50 p-4 dark:bg-white/10">NFC: solo URL + ID cifrable</div>
                <div className="rounded-xl bg-med-50 p-4 dark:bg-white/10">Supabase listo por variables de entorno</div>
              </div>
            </section>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
