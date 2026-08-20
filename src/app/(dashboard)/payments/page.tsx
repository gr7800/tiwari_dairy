import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { DeletePaymentButton } from "@/components/payments/DeletePaymentButton";
import { EditPaymentButton } from "@/components/payments/EditPaymentButton";
import { Pagination } from "@/components/ui/Pagination";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const methodLabels: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

const PAGE_SIZE = 20;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; farmerId?: string; page?: string };
}) {
  const supabase = createClient();
  const { from, to, farmerId } = searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const rangeStart = (page - 1) * PAGE_SIZE;

  let paymentsQuery = supabase
    .from("farmer_payments")
    .select("id, payment_date, amount, payment_method, reference_number, notes, farmers(id, name)", { count: "exact" })
    .gte("payment_date", from || "1970-01-01")
    .lte("payment_date", to || "2999-12-31");
  if (farmerId) paymentsQuery = paymentsQuery.eq("farmer_id", farmerId);
  paymentsQuery = paymentsQuery
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeStart + PAGE_SIZE - 1);

  const [{ data: farmers }, { data: payments, count: totalCount }] = await Promise.all([
    supabase.from("farmers").select("id, farmer_code, name").eq("status", "ACTIVE").order("farmer_code"),
    paymentsQuery,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Farmer Payments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Record payments made to farmers. Date defaults to today, method defaults to Cash.</p>
      </div>

      <PaymentForm farmers={farmers ?? []} />

      <form className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">From</label>
          <Input type="date" name="from" defaultValue={from} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">To</label>
          <Input type="date" name="to" defaultValue={to} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Farmer</label>
          <Select name="farmerId" defaultValue={farmerId ?? ""} className="min-w-[12rem]">
            <option value="">All farmers</option>
            {(farmers ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.farmer_code} — {f.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          Apply filter
        </Button>
      </form>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Farmer</th>
              <th className="px-4 py-2.5">Method</th>
              <th className="px-4 py-2.5">Reference</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {(payments ?? []).map((p) => {
              const row = p as unknown as {
                id: string;
                payment_date: string;
                amount: number;
                payment_method: string;
                reference_number: string | null;
                notes: string | null;
                farmers: { id: string; name: string } | null;
              };
              return (
                <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-2.5">{row.payment_date}</td>
                  <td className="px-4 py-2.5">
                    {row.farmers && (
                      <Link href={`/farmers/${row.farmers.id}/ledger`} className="text-accent hover:underline">
                        {row.farmers.name}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-2.5">{methodLabels[row.payment_method] ?? row.payment_method}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{row.reference_number ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{row.amount}</td>
                  <td className="px-4 py-2.5 text-right">
                    {row.farmers && (
                      <div className="flex items-center justify-end gap-3">
                        <EditPaymentButton payment={{ ...row, farmer_id: row.farmers.id }} farmers={farmers ?? []} />
                        <DeletePaymentButton id={row.id} farmerId={row.farmers.id} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {(payments ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {(payments ?? []).map((p) => {
          const row = p as unknown as {
            id: string;
            payment_date: string;
            amount: number;
            payment_method: string;
            reference_number: string | null;
            notes: string | null;
            farmers: { id: string; name: string } | null;
          };
          return (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {row.farmers && (
                    <Link href={`/farmers/${row.farmers.id}/ledger`} className="font-medium text-accent hover:underline">
                      {row.farmers.name}
                    </Link>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">{row.payment_date}</p>
                </div>
                <p className="font-heading text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">₹{row.amount}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-sm dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">
                  {methodLabels[row.payment_method] ?? row.payment_method}
                  {row.reference_number ? ` · Ref: ${row.reference_number}` : ""}
                </span>
                {row.farmers && (
                  <div className="flex items-center gap-3">
                    <EditPaymentButton payment={{ ...row, farmer_id: row.farmers.id }} farmers={farmers ?? []} />
                    <DeletePaymentButton id={row.id} farmerId={row.farmers.id} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {(payments ?? []).length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No payments recorded yet.
          </p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount ?? 0} searchParams={searchParams} />
    </div>
  );
}
