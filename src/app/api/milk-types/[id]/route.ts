import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { updateMilkTypeStatusCore } from "@/lib/actions/milkTypes";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
  const result = await updateMilkTypeStatusCore(params.id, status);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data);
}
