import { ArrowLeft, Building2, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { User } from "../lib/types";

export function HospitalLogin() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ hospitalName: "", email: "", password: "", code: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.hospitalName || !form.email || !form.password || !form.code) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      setError("La contraseña debe tener 8 caracteres, una mayúscula y un número.");
      return;
    }
    setLoading(true);
    try {
      const data = await api<{ token: string; user: User }>("/auth/hospital", { method: "POST", body: JSON.stringify(form) });
      setSession(data.token, data.user);
      navigate("/hospital/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ingresar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell min-h-screen p-6">
      <Link to="/" className="secondary-button">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>
      <section className="mx-auto mt-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div>
          <Logo compact />
          <h1 className="mt-8 text-4xl font-black text-slate-950 dark:text-white">Acceso Hospital</h1>
          <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-300">
            Ingreso institucional para registrar pacientes, vincular NFC y consultar datos médicos autorizados.
          </p>
          <div className="mt-8 rounded-xl border border-med-100 bg-med-50 p-4 text-sm text-med-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-100">
            Credenciales de prueba: hospital@mediform.test · código MEDI-2026 · contraseña Segura2026
          </div>
        </div>
        <form onSubmit={submit} className="glass rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-med-50 p-3 text-med-700 dark:bg-white/10 dark:text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Validación hospitalaria</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Código renovable cada 14 días</p>
            </div>
          </div>
          <div className="grid gap-4">
            <input className="field" placeholder="Nombre del hospital" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} />
            <input className="field" placeholder="Correo institucional" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="field" placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <input className="field" placeholder="Código hospitalario" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
            <button className="primary-button" disabled={loading}>
              <LockKeyhole className="h-4 w-4" />
              {loading ? "Validando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
