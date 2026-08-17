import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { createSupplyCore } from "@/lib/actions/supplies";

export async function GET(req: NextRequest) {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let query = supabase
    .from("milk_supplies")
    .select("*, milk_types(name), shift_configs(name)")
    .order("supply_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (from) query = query.gte("supply_date", from);
  if (to) query = query.lte("supply_date", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await createSupplyCore(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data, { status: 201 });
}
