import { createClient } from "@/lib/supabase/server";
import { buildAccountSummary } from "@/lib/ledger";
import type { LedgerTransaction } from "@/components/ledger/FarmerLedgerTable";

export interface FarmerLedgerData {
  farmer: { id: string; farmer_code: string; name: string; phone: string | null };
  transactions: LedgerTransaction[];
  overall: ReturnType<typeof buildAccountSummary>;
  period: ReturnType<typeof buildAccountSummary> | null;
}

/**
 * Fetches a farmer's ledger — transactions plus period vs. overall account
 * summaries (rule #10). Shared by the ledger page and
 * app/api/farmers/[id]/ledger/route.ts so both read from the exact same logic.
 */
export async function getFarmerLedgerData(
  farmerId: string,
  range: { from?: string; to?: string }
): Promise<FarmerLedgerData | null> {
  const supabase = createClient();
  const { from, to } = range;

  const { data: farmer } = await supabase
    .from("farmers")
    .select("id, farmer_code, name, phone")
    .eq("id", farmerId)
    .single();
  if (!farmer) return null;

  const hasRange = Boolean(from || to);

  const [{ data: overallTotals }, periodTotalsResult, purchasesResult, paymentsResult] = await Promise.all([
    supabase.rpc("get_farmer_account_totals", { p_farmer_id: farmer.id, p_from: null, p_to: null }),
    hasRange
      ? supabase.rpc("get_farmer_account_totals", { p_farmer_id: farmer.id, p_from: from ?? null, p_to: to ?? null })
      : Promise.resolve({ data: null }),
    supabase
      .from("milk_purchases")
      .select("id, purchase_date, quantity, total_amount, milk_types(name), shift_configs(name)")
      .eq("farmer_id", farmer.id)
      .gte("purchase_date", from || "1970-01-01")
      .lte("purchase_date", to || "2999-12-31"),
    supabase
      .from("farmer_payments")
      .select("id, payment_date, amount, payment_method, reference_number")
      .eq("farmer_id", farmer.id)
      .gte("payment_date", from || "1970-01-01")
      .lte("payment_date", to || "2999-12-31"),
  ]);

  const overall = buildAccountSummary(
    Number(overallTotals?.[0]?.total_milk_value ?? 0),
    Number(overallTotals?.[0]?.total_paid ?? 0)
  );
  const periodTotalsRow = (periodTotalsResult.data as { total_milk_value: number; total_paid: number }[] | null)?.[0];
  const period = hasRange
    ? buildAccountSummary(Number(periodTotalsRow?.total_milk_value ?? 0), Number(periodTotalsRow?.total_paid ?? 0))
    : null;

  const purchaseTx: LedgerTransaction[] = (purchasesResult.data ?? []).map((p) => {
    const row = p as unknown as {
      id: string;
      purchase_date: string;
      quantity: number;
      total_amount: number;
      milk_types: { name: string } | null;
      shift_configs: { name: string } | null;
    };
    return {
      type: "PURCHASE",
      id: row.id,
      date: row.purchase_date,
      amount: Number(row.total_amount),
      shift: row.shift_configs?.name,
      milkType: row.milk_types?.name,
      quantity: Number(row.quantity),
    };
  });

  const paymentTx: LedgerTransaction[] = (paymentsResult.data ?? []).map((pay) => ({
    type: "PAYMENT",
    id: pay.id,
    date: pay.payment_date,
    amount: Number(pay.amount),
    paymentMethod: pay.payment_method,
    referenceNumber: pay.reference_number,
  }));

  const transactions = [...purchaseTx, ...paymentTx].sort((a, b) => (a.date < b.date ? 1 : -1));

  return { farmer, transactions, overall, period };
}
