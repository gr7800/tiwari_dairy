import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { deleteSupplyCore, updateSupplyCore } from "@/lib/actions/supplies";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await updateSupplyCore(params.id, body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const result = await deleteSupplyCore(params.id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });

  return new NextResponse(null, { status: 204 });
}
