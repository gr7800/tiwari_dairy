import { createClient } from "@/lib/supabase/server";
import { SupplyForm } from "@/components/forms/SupplyForm";
import { DeleteSupplyButton } from "@/components/supplies/DeleteSupplyButton";
import { EditSupplyButton } from "@/components/supplies/EditSupplyButton";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 20;

export default async function SuppliesPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; page?: string };
}) {
  const supabase = createClient();
  const { from, to } = searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const rangeStart = (page - 1) * PAGE_SIZE;

  const [{ data: milkTypes }, { data: shifts }, { data: supplies, count: totalCount }] = await Promise.all([
    supabase.from("milk_types").select("id, name").eq("status", "ACTIVE").order("name"),
    supabase.from("shift_configs").select("id, name, start_time, end_time, sort_order").order("sort_order"),
    supabase
      .from("milk_supplies")
      .select(
        "id, supply_date, shift_id, milk_type_id, customer_name, quantity, rate, fat_percentage, snf_percentage, total_amount, is_amount_overridden, notes, milk_types(name), shift_configs(name)",
        { count: "exact" }
      )
      .gte("supply_date", from || "1970-01-01")
      .lte("supply_date", to || "2999-12-31")
      .order("supply_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(rangeStart, rangeStart + PAGE_SIZE - 1),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Milk Supply</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Record milk sold/supplied. Date and shift default automatically.</p>
      </div>

      <SupplyForm milkTypes={milkTypes ?? []} shifts={shifts ?? []} />

      <form className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">From</label>
          <Input type="date" name="from" defaultValue={from} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">To</label>
          <Input type="date" name="to" defaultValue={to} />
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
              <th className="px-4 py-2.5">Milk Type</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5 text-right">Qty (L)</th>
              <th className="px-4 py-2.5 text-right">Rate</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {(supplies ?? []).map((s) => {
              const row = s as unknown as {
                id: string;
                supply_date: string;
                shift_id: string;
                milk_type_id: string;
                customer_name: string | null;
                quantity: number;
                rate: number;
                fat_percentage: number | null;
                snf_percentage: number | null;
                total_amount: number;
                is_amount_overridden: boolean;
                notes: string | null;
                milk_types: { name: string } | null;
                shift_configs: { name: string } | null;
              };
              return (
                <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-2.5">{row.supply_date}</td>
                  <td className="px-4 py-2.5">{row.shift_configs?.name}</td>
                  <td className="px-4 py-2.5">{row.milk_types?.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{row.customer_name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.quantity}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{row.rate}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    ₹{row.total_amount}
                    {row.is_amount_overridden && <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">(overridden)</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <EditSupplyButton supply={row} milkTypes={milkTypes ?? []} shifts={shifts ?? []} />
                      <DeleteSupplyButton id={row.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(supplies ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No supply entries recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {(supplies ?? []).map((s) => {
          const row = s as unknown as {
            id: string;
            supply_date: string;
            shift_id: string;
            milk_type_id: string;
            customer_name: string | null;
            quantity: number;
            rate: number;
            fat_percentage: number | null;
            snf_percentage: number | null;
            total_amount: number;
            is_amount_overridden: boolean;
            notes: string | null;
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
                  <p className="font-medium text-slate-900 dark:text-slate-100">{row.customer_name ?? "No customer"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {row.supply_date} · {row.shift_configs?.name}
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
                <div className="flex items-center gap-3">
                  <EditSupplyButton supply={row} milkTypes={milkTypes ?? []} shifts={shifts ?? []} />
                  <DeleteSupplyButton id={row.id} />
                </div>
              </div>
            </div>
          );
        })}
        {(supplies ?? []).length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No supply entries recorded yet.
          </p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount ?? 0} searchParams={searchParams} />
    </div>
  );
}
