export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClasses =
    tone === "positive" ? "text-paid" : tone === "negative" ? "text-unpaid" : "text-slate-900 dark:text-slate-100";
  const accentBar = tone === "positive" ? "bg-paid" : tone === "negative" ? "bg-unpaid" : "bg-accent";

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <span className={`absolute inset-y-0 left-0 w-1 ${accentBar}`} aria-hidden="true" />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1.5 font-heading text-2xl font-bold ${toneClasses}`}>{value}</p>
    </div>
  );
}
