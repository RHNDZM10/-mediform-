import { ArrowLeft, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { User } from "../lib/types";

export function AdminLogin() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const data = await api<{ token: string; user: User }>("/auth/admin", { method: "POST", body: JSON.stringify(form) });
      setSession(data.token, data.user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ingresar.");
    }
  }

  return (
    <main className="app-shell min-h-screen p-6">
      <Link to="/" className="secondary-button">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>
      <section className="mx-auto mt-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo compact />
        </div>
        <form onSubmit={submit} className="glass rounded-2xl p-6">
          <div className="mb-6 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-med-700 dark:text-med-300" />
            <h1 className="mt-4 text-3xl font-black">Acceso Administrador</h1>
          </div>
          <div className="grid gap-4">
            <input className="field" placeholder="Usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input className="field" placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
            <button className="primary-button">Ingresar</button>
          </div>
          <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-300">Prueba: admin · Mediform2026</p>
        </form>
      </section>
    </main>
  );
}
