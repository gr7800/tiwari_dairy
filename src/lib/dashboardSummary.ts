import { createClient } from "@/lib/supabase/server";

export interface DashboardSummary {
  milk: {
    purchasedQuantity: number;
    purchasedValue: number;
    suppliedQuantity: number;
    suppliedValue: number;
  };
  totalExpenses: number;
  grossProfit: number;
  farmerStatusCounts: { PAID: number; PARTIALLY_PAID: number; UNPAID: number };
}

function sum(rows: { amount: number }[]): number {
  return rows.reduce((total, row) => total + Number(row.amount), 0);
}

/**
 * Business-wide summary (rule #21's "Clear Business View") — purchase cost,
 * supply revenue, expenses, gross profit/loss, and farmer PAID/PARTIALLY_PAID/
 * UNPAID counts. Shared by the dashboard page and app/api/dashboard/summary/route.ts.
 */
export async function getDashboardSummary(range: { from?: string; to?: string }): Promise<DashboardSummary> {
  const supabase = createClient();
  const fromDate = range.from || "1970-01-01";
  const toDate = range.to || "2999-12-31";

  const [purchases, supplies, expenses, statusCounts] = await Promise.all([
    supabase
      .from("milk_purchases")
      .select("quantity, total_amount")
      .gte("purchase_date", fromDate)
      .lte("purchase_date", toDate),
    supabase
      .from("milk_supplies")
      .select("quantity, total_amount")
      .gte("supply_date", fromDate)
      .lte("supply_date", toDate),
    supabase.from("expenses").select("amount").gte("expense_date", fromDate).lte("expense_date", toDate),
    supabase.rpc("get_farmer_status_counts"),
  ]);

  const purchasedQuantity = (purchases.data ?? []).reduce((t, r) => t + Number(r.quantity), 0);
  const purchasedValue = sum((purchases.data ?? []).map((r) => ({ amount: r.total_amount })));
  const suppliedQuantity = (supplies.data ?? []).reduce((t, r) => t + Number(r.quantity), 0);
  const suppliedValue = sum((supplies.data ?? []).map((r) => ({ amount: r.total_amount })));
  const totalExpenses = sum(expenses.data ?? []);
  const grossProfit = suppliedValue - purchasedValue - totalExpenses;

  const farmerStatusCounts = { PAID: 0, PARTIALLY_PAID: 0, UNPAID: 0 };
  for (const row of statusCounts.data ?? []) {
    farmerStatusCounts[row.status as keyof typeof farmerStatusCounts] = Number(row.count);
  }

  return {
    milk: { purchasedQuantity, purchasedValue, suppliedQuantity, suppliedValue },
    totalExpenses,
    grossProfit,
    farmerStatusCounts,
  };
}
