import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { createPaymentCore } from "@/lib/actions/payments";

export async function GET(req: NextRequest) {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const farmerId = req.nextUrl.searchParams.get("farmerId");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let query = supabase
    .from("farmer_payments")
    .select("*, farmers(id, name, farmer_code)")
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (farmerId) query = query.eq("farmer_id", farmerId);
  if (from) query = query.gte("payment_date", from);
  if (to) query = query.lte("payment_date", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await createPaymentCore(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data, { status: 201 });
}
