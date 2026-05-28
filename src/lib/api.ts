const API_URL = import.meta.env.VITE_API_URL || "/api";

type RequestOptions = RequestInit & { token?: string | null };

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la solicitud");
  }

  return data as T;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Number.isFinite(age) ? age : 0;
}
