import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { updateShiftWindowCore } from "@/lib/actions/shifts";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await updateShiftWindowCore(params.id, String(body.startTime ?? ""), String(body.endTime ?? ""));
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data);
}
