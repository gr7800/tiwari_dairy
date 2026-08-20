import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton";
import { EditExpenseButton } from "@/components/expenses/EditExpenseButton";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 20;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; page?: string };
}) {
  const supabase = createClient();
  const { from, to } = searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const rangeStart = (page - 1) * PAGE_SIZE;

  const [{ data: categories }, { data: expenses, count: totalCount }] = await Promise.all([
    supabase.from("expense_categories").select("id, name").eq("status", "ACTIVE").order("name"),
    supabase
      .from("expenses")
      .select("id, expense_date, amount, notes, category_id, expense_categories(name)", { count: "exact" })
      .gte("expense_date", from || "1970-01-01")
      .lte("expense_date", to || "2999-12-31")
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(rangeStart, rangeStart + PAGE_SIZE - 1),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">Expenses</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Record day-to-day business expenses. Date defaults to today.</p>
      </div>

      <ExpenseForm categories={categories ?? []} />

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
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Notes</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {(expenses ?? []).map((e) => {
              const row = e as unknown as {
                id: string;
                expense_date: string;
                amount: number;
                notes: string | null;
                category_id: string;
                expense_categories: { name: string } | null;
              };
              return (
                <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-2.5">{row.expense_date}</td>
                  <td className="px-4 py-2.5">{row.expense_categories?.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{row.notes ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">₹{row.amount}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <EditExpenseButton expense={row} categories={categories ?? []} />
                      <DeleteExpenseButton id={row.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(expenses ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {(expenses ?? []).map((e) => {
          const row = e as unknown as {
            id: string;
            expense_date: string;
            amount: number;
            notes: string | null;
            category_id: string;
            expense_categories: { name: string } | null;
          };
          return (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{row.expense_categories?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{row.expense_date}</p>
                </div>
                <p className="font-heading text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">₹{row.amount}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-sm dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">{row.notes ?? "No notes"}</span>
                <div className="flex items-center gap-3">
                  <EditExpenseButton expense={row} categories={categories ?? []} />
                  <DeleteExpenseButton id={row.id} />
                </div>
              </div>
            </div>
          );
        })}
        {(expenses ?? []).length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No expenses recorded yet.
          </p>
        )}
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount ?? 0} searchParams={searchParams} />
    </div>
  );
}
