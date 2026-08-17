import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { createShiftCore } from "@/lib/actions/shifts";

export async function GET() {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase.from("shift_configs").select("*").order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await createShiftCore({
    name: String(body.name ?? "").trim(),
    startTime: String(body.startTime ?? ""),
    endTime: String(body.endTime ?? ""),
    sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data, { status: 201 });
}
