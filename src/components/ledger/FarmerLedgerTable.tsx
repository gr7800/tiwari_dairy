export interface LedgerTransaction {
  type: "PURCHASE" | "PAYMENT";
  id: string;
  date: string;
  amount: number;
  shift?: string;
  milkType?: string;
  quantity?: number;
  paymentMethod?: string;
  referenceNumber?: string | null;
}

const methodLabels: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

export function FarmerLedgerTable({ transactions }: { transactions: LedgerTransaction[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Details</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {transactions.map((tx) => (
              <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-4 py-2.5">{tx.date}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tx.type === "PURCHASE"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    {tx.type === "PURCHASE" ? "Milk Purchase" : "Payment"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                  {tx.type === "PURCHASE" ? (
                    <span>
                      {tx.shift} · {tx.milkType} · {tx.quantity} L
                    </span>
                  ) : (
                    <span>
                      {methodLabels[tx.paymentMethod ?? ""] ?? tx.paymentMethod}
                      {tx.referenceNumber ? ` · Ref: ${tx.referenceNumber}` : ""}
                    </span>
                  )}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-medium ${
                    tx.type === "PURCHASE" ? "text-slate-900 dark:text-slate-100" : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {tx.type === "PURCHASE" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No transactions in this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {transactions.map((tx) => (
          <div
            key={`${tx.type}-${tx.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tx.type === "PURCHASE"
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {tx.type === "PURCHASE" ? "Milk Purchase" : "Payment"}
                </span>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{tx.date}</p>
              </div>
              <p
                className={`font-heading text-lg font-semibold ${
                  tx.type === "PURCHASE" ? "text-slate-900 dark:text-slate-100" : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {tx.type === "PURCHASE" ? "+" : "-"}₹{tx.amount.toFixed(2)}
              </p>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2.5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {tx.type === "PURCHASE" ? (
                <span>
                  {tx.shift} · {tx.milkType} · {tx.quantity} L
                </span>
              ) : (
                <span>
                  {methodLabels[tx.paymentMethod ?? ""] ?? tx.paymentMethod}
                  {tx.referenceNumber ? ` · Ref: ${tx.referenceNumber}` : ""}
                </span>
              )}
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No transactions in this period.
          </p>
        )}
      </div>
    </>
  );
}
