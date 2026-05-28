export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={compact ? "/assets/mediform-mark.png" : "/assets/mediform-logo-wordmark.png"}
        alt="MediForm"
        className={compact ? "h-11 w-11 rounded-xl object-cover" : "h-14 w-auto rounded-xl object-cover"}
      />
      {compact ? <span className="text-xl font-black tracking-wide text-med-700 dark:text-white">MediForm</span> : null}
    </div>
  );
}
