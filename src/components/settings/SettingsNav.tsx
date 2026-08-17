import Link from "next/link";

const tabs = [
  { key: "milk-types", href: "/settings/milk-types", label: "Milk Types" },
  { key: "shifts", href: "/settings/shifts", label: "Shifts" },
  { key: "expense-categories", href: "/settings/expense-categories", label: "Expense Categories" },
  { key: "appearance", href: "/settings/appearance", label: "Appearance" },
] as const;

export function SettingsNav({ active }: { active: (typeof tabs)[number]["key"] }) {
  return (
    <nav className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            tab.key === active
              ? "border-accent text-accent"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
