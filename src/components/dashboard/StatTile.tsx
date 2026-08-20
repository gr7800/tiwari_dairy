export function StatTile({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
  icon?: React.ReactNode;
}) {
  const valueClasses =
    tone === "positive" ? "text-paid" : tone === "negative" ? "text-unpaid" : "text-slate-900 dark:text-slate-100";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent">
            {icon}
          </span>
        ) : null}
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className={`mt-2 font-heading text-2xl font-bold ${valueClasses}`}>{value}</p>
    </div>
  );
}
