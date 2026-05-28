import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("mediform.theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("mediform.theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button className="secondary-button px-3" onClick={() => setDark((value) => !value)} title="Cambiar modo">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Modo oscuro</span>
    </button>
  );
}
