import { Building2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";

export function Home() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-6">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <section className="glass w-full max-w-3xl rounded-2xl p-8 text-center sm:p-12">
        <div className="mx-auto flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-8 text-3xl font-black tracking-normal text-slate-950 dark:text-white sm:text-5xl">
          Información médica accesible cuando más importa
        </h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link to="/hospital" className="primary-button min-h-20 text-base">
            <Building2 className="h-5 w-5" />
            Acceso Hospital
          </Link>
          <Link to="/admin" className="secondary-button min-h-20 text-base">
            <ShieldCheck className="h-5 w-5" />
            Acceso Administrador
          </Link>
        </div>
      </section>
    </main>
  );
}
