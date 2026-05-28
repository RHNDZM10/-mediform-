import { AlertTriangle, ArrowLeft, FileDown, HeartPulse, Phone, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loading } from "../components/Loading";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { api, formatDate } from "../lib/api";

type AuthorizedProfile = {
  publicId: string;
  fullName: string;
  age: number;
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
  priority: string;
  status: string;
  medicalHistory: string[];
  updatedAt: string;
};

export function ProfileAccess() {
  const { publicId = "" } = useParams();
  const [checking, setChecking] = useState(true);
  const [exists, setExists] = useState(false);
  const [form, setForm] = useState({ email: "", code: "" });
  const [profile, setProfile] = useState<AuthorizedProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ exists: boolean }>(`/profile/${publicId}`)
      .then((data) => setExists(data.exists))
      .catch(() => setExists(false))
      .finally(() => setChecking(false));
  }, [publicId]);

  async function validate(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const data = await api<AuthorizedProfile>(`/profile/${publicId}/validate`, { method: "POST", body: JSON.stringify(form) });
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acceso denegado.");
    }
  }

  return (
    <main className="app-shell min-h-screen p-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="secondary-button">
          <ArrowLeft className="h-4 w-4" />
          Inicio
        </Link>
        <ThemeToggle />
      </div>

      <section className="mx-auto mt-8 w-full max-w-5xl">
        <div className="mb-8 flex justify-center">
          <Logo compact />
        </div>

        {checking ? <Loading /> : null}

        {!checking && !exists ? (
          <div className="glass rounded-2xl p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="mt-4 text-3xl font-black">Perfil no encontrado</h1>
          </div>
        ) : null}

        {!checking && exists && !profile ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="label">Acceso NFC detectado</p>
              <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">Validación hospitalaria requerida</h1>
              <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-300">
                El NFC no contiene datos médicos. Solo abre esta URL segura y solicita permisos antes de mostrar información autorizada.
              </p>
              <div className="mt-6 rounded-xl bg-med-50 p-4 text-sm font-semibold text-med-900 dark:bg-white/10 dark:text-white">Perfil: {publicId}</div>
            </div>
            <form onSubmit={validate} className="glass rounded-2xl p-6">
              <ShieldCheck className="mb-4 h-8 w-8 text-med-700 dark:text-med-300" />
              <div className="grid gap-4">
                <input className="field" type="email" placeholder="Correo institucional" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="field" placeholder="Código hospitalario" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
                <button className="primary-button">Verificar permisos</button>
              </div>
            </form>
          </div>
        ) : null}

        {profile ? (
          <div className="grid gap-6">
            <section className="glass rounded-2xl p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="label">Datos autorizados</p>
                  <h1 className="mt-2 text-4xl font-black">{profile.fullName}</h1>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">{profile.age} años · {profile.gender} · Sangre {profile.bloodType}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a className="primary-button" href={`tel:${profile.phone}`}>
                    <Phone className="h-4 w-4" />
                    Llamada rápida
                  </a>
                  <button className="secondary-button" onClick={() => window.print()}>
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Info label="Prioridad" value={profile.priority} />
              <Info label="Estado" value={profile.status} />
              <Info label="Actualizado" value={formatDate(profile.updatedAt)} />
            </section>

            <section className="panel rounded-2xl p-5">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-black"><HeartPulse className="h-5 w-5 text-med-700" /> Información médica</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Enfermedades relevantes" value={profile.conditions} />
                <Info label="Medicamentos actuales" value={profile.medications} />
                <Info label="Alergias" value={profile.allergies} />
                <Info label="Médico responsable" value={profile.doctor} />
                <Info label="Contacto emergencia" value={`${profile.emergencyContact} · ${profile.relation} · ${profile.phone}`} />
                <Info label="Observaciones" value={profile.observations} />
              </div>
            </section>

            <section className="panel rounded-2xl p-5">
              <h2 className="mb-4 text-xl font-black">Historial médico</h2>
              <div className="grid gap-3">
                {profile.medicalHistory.map((item) => <p key={item} className="rounded-lg bg-med-50 p-3 text-sm dark:bg-white/10">{item}</p>)}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel rounded-xl p-4">
      <p className="label">{label}</p>
      <p className="mt-2 font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
