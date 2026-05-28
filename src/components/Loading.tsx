export function Loading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-med-100 dark:border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-med-600" />
      </div>
    </div>
  );
}
