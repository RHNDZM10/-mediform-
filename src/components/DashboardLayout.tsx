import { LogOut } from "lucide-react";
import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

export function DashboardLayout({
  title,
  subtitle,
  nav,
  active,
  onActive,
  children
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  active: string;
  onActive: (key: string) => void;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-200/70 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link to="/">
              <Logo compact />
            </Link>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-8 hidden rounded-xl border border-med-100 bg-med-50 p-4 text-sm text-med-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 lg:block">
            <p className="font-semibold">{user?.name}</p>
            <p className="mt-1 text-xs opacity-75">Sesión protegida de 15 min</p>
          </div>

          <nav className="mt-6 grid gap-1">
            {nav.map((item) => (
              <button
                key={item.key}
                className={`nav-button ${active === item.key ? "nav-button-active" : ""}`}
                onClick={() => onActive(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button
            className="nav-button mt-6"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </aside>

        <main className="min-w-0 p-5 sm:p-8">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label">MediForm</p>
              <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 dark:text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-300">{subtitle}</p>
            </div>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
