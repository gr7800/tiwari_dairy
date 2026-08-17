import type { FarmerPaymentStatus } from "@/lib/ledger";

const statusClasses: Record<FarmerPaymentStatus, string> = {
  PAID: "bg-green-50 text-paid ring-1 ring-inset ring-green-200 dark:bg-green-950 dark:ring-green-800",
  PARTIALLY_PAID: "bg-amber-50 text-partial ring-1 ring-inset ring-amber-200 dark:bg-amber-950 dark:ring-amber-800",
  UNPAID: "bg-red-50 text-unpaid ring-1 ring-inset ring-red-200 dark:bg-red-950 dark:ring-red-800",
};

const statusLabels: Record<FarmerPaymentStatus, string> = {
  PAID: "Paid",
  PARTIALLY_PAID: "Partially Paid",
  UNPAID: "Unpaid",
};

export function PaidStatusBadge({ status }: { status: FarmerPaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-sm ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300 ${className}`}
    >
      {children}
    </span>
  );
}
