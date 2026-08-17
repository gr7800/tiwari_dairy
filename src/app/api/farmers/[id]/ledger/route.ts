import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { getFarmerLedgerData } from "@/lib/farmerLedger";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const from = req.nextUrl.searchParams.get("from") ?? undefined;
  const to = req.nextUrl.searchParams.get("to") ?? undefined;

  const ledger = await getFarmerLedgerData(params.id, { from, to });
  if (!ledger) return NextResponse.json({ error: "Farmer not found" }, { status: 404 });

  return NextResponse.json(ledger);
}
