import { PaidStatusBadge } from "@/components/ui/Badge";
import type { FarmerAccountSummary } from "@/lib/ledger";

export function SettlementSummaryCard({ title, summary }: { title: string; summary: FarmerAccountSummary }) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      data-testid={title === "Overall Account Balance" ? "overall-summary" : "period-summary"}
    >
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Total Milk Value</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">₹{summary.totalMilkValue.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500 dark:text-slate-400">Total Paid</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">₹{summary.totalPaid.toFixed(2)}</dd>
        </div>
        {summary.advance > 0 ? (
          <>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Milk Due</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">₹0.00</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Advance</dt>
              <dd className="font-medium text-advance">₹{summary.advance.toFixed(2)}</dd>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Remaining</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">₹{summary.remaining.toFixed(2)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
        <PaidStatusBadge status={summary.status} />
      </div>
    </div>
  );
}
