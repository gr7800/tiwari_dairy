import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { createExpenseCore } from "@/lib/actions/expenses";

export async function GET(req: NextRequest) {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let query = supabase
    .from("expenses")
    .select("*, expense_categories(name)")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (from) query = query.gte("expense_date", from);
  if (to) query = query.lte("expense_date", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await createExpenseCore(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data, { status: 201 });
}
