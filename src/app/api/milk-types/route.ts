import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { createMilkTypeCore } from "@/lib/actions/milkTypes";

export async function GET() {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase.from("milk_types").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await createMilkTypeCore(String(body.name ?? "").trim());
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data, { status: 201 });
}
