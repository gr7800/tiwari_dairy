import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { resolveCurrentShift } from "@/lib/shift";

/** Rule #3: which shift the current time resolves to (still overridable client-side). */
export async function GET() {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { data: shifts, error } = await supabase.from("shift_configs").select("*").order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const current = resolveCurrentShift(shifts ?? [], new Date());
  return NextResponse.json(current);
}
