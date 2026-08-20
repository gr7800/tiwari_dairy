import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { DeletePurchaseButton } from "@/components/purchases/DeletePurchaseButton";
import { EditPurchaseButton } from "@/components/purchases/EditPurchaseButton";
import { Pagination } from "@/components/ui/Pagination";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 20;

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; farmerId?: string; page?: string };
}) {
  const supabase = createClient();
  const { from, to, farmerId } = searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const rangeStart = (page - 1) * PAGE_SIZE;

  let purchasesQuery = supabase
    .from("milk_purchases")
    .select(
      "id, purchase_date, shift_id, milk_type_id, quantity, rate, fat_percentage, snf_percentage, total_amount, is_amount_overridden, notes, farmers(id, name), milk_types(name), shift_configs(name)",
      { count: "exact" }
    )
    .gte("purchase_date", from || "1970-01-01")
    .lte("purchase_date", to || "2999-12-31");
  if (farmerId) purchasesQuery = purchasesQuery.eq("farmer_id", farmerId);
  purchasesQuery = purchasesQuery
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeStart + PAGE_SIZE - 1);

  const [{ data: farmers }, { data: milkTypes }, { data: shifts }, { data: purchases, count: totalCount }] =
    await Promise.all([
      supabase.from("farmers").select("id, farmer_code, name").eq("status", "ACTIVE").order("farmer_code"),
      supabase.from("milk_types").select("id, name").eq("status", "ACTIVE").order("name"),
      supabase.from("shift_configs").select("id, name, start_time, end_time, sort_order").order("sort_order"),
      purchasesQuery,
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Milk Purchases</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Record milk bought from farmers. Date and shift default automatically.</p>
      </div>

      <PurchaseForm farmers={farmers ?? []} milkTypes={milkTypes ?? []} shifts={shifts ?? []} />

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
              <th className="px-4 py-2.5">Shift</th>
              <th className="px-4 py-2.5">Farmer</th>
              <th className="px-4 py-2.5">Milk Type</th>
              <th className="px-4 py-2.5 text-right">Qty (L)</th>
              <th className="px-4 py-2.5 text-right">Rate</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {(purchases ?? []).map((p) => {
              const row = p as unknown as {
                id: string;
                purchase_date: string;
                shift_id: string;
                milk_type_id: string;
                quantity: number;
                rate: number;
                fat_percentage: number | null;
                snf_percentage: number | null;
                total_amount: number;
                is_amount_overridden: boolean;
                notes: string | null;
                farmers: { id: string; name: string } | null;
                milk_types: { name: string } | null;
                shift_configs: { name: string } | null;
              };
              return (
                <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-2.5">{row.purchase_date}</td>
                  <td className="px-4 py-2.5">{row.shift_configs?.name}</td>
                  <td className="px-4 py-2.5">
                    {row.farmers && (
                      <Link href={`/farmers/${row.farmers.id}/ledger`} className="text-accent hover:underline">
                        {row.farmers.name}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-2.5">{row.milk_types?.name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.quantity}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{row.rate}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    ₹{row.total_amount}
                    {row.is_amount_overridden && <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">(overridden)</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {row.farmers && (
                      <div className="flex items-center justify-end gap-3">
                        <EditPurchaseButton
                          purchase={{ ...row, farmer_id: row.farmers.id }}
                          farmers={farmers ?? []}
                          milkTypes={milkTypes ?? []}
                          shifts={shifts ?? []}
                        />
                        <DeletePurchaseButton id={row.id} farmerId={row.farmers.id} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {(purchases ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No purchases recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {(purchases ?? []).map((p) => {
          const row = p as unknown as {
            id: string;
            purchase_date: string;
            shift_id: string;
            milk_type_id: string;
            quantity: number;
            rate: number;
            fat_percentage: number | null;
            snf_percentage: number | null;
            total_amount: number;
            is_amount_overridden: boolean;
            notes: string | null;
            farmers: { id: string; name: string } | null;
            milk_types: { name: string } | null;
            shift_configs: { name: string } | null;
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {row.purchase_date} · {row.shift_configs?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">₹{row.total_amount}</p>
                  {row.is_amount_overridden && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">(overridden)</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-sm dark:border-slate-700">
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  {row.milk_types?.name} · {row.quantity} L @ ₹{row.rate}
                </span>
                {row.farmers && (
                  <div className="flex items-center gap-3">
                    <EditPurchaseButton
                      purchase={{ ...row, farmer_id: row.farmers.id }}
                      farmers={farmers ?? []}
                      milkTypes={milkTypes ?? []}
                      shifts={shifts ?? []}
                    />
                    <DeletePurchaseButton id={row.id} farmerId={row.farmers.id} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {(purchases ?? []).length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No purchases recorded yet.
          </p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount ?? 0} searchParams={searchParams} />
    </div>
  );
}
