export type FarmerPaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface FarmerAccountSummary {
  totalMilkValue: number;
  totalPaid: number;
  remaining: number;
  advance: number;
  /** totalMilkValue - totalPaid. Positive = we owe the farmer, negative = farmer has an advance. */
  outstanding: number;
  status: FarmerPaymentStatus;
}

/**
 * Rules #7/#8: PAID/PARTIALLY_PAID/UNPAID/advance is always derived from the
 * two raw totals — never stored. Kept as a pure function so both the ledger
 * page and the dashboard's farmer-status counts use identical thresholds,
 * and so it can be unit tested and reused for client-side previews.
 */
export function buildAccountSummary(milkValue: number, paid: number): FarmerAccountSummary {
  const outstanding = Math.round((milkValue - paid) * 100) / 100;
  const status: FarmerPaymentStatus = paid <= 0 ? "UNPAID" : paid < milkValue ? "PARTIALLY_PAID" : "PAID";

  return {
    totalMilkValue: milkValue,
    totalPaid: paid,
    remaining: outstanding > 0 ? outstanding : 0,
    advance: outstanding < 0 ? Math.abs(outstanding) : 0,
    outstanding,
    status,
  };
}
