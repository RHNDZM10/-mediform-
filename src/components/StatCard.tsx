export function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="stat-card">
      <p className="label">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{detail}</p>
    </div>
  );
}
