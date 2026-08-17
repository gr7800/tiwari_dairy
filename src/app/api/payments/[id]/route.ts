import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { deletePaymentCore, updatePaymentCore } from "@/lib/actions/payments";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await updatePaymentCore(params.id, body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { data: existing } = await supabase
    .from("farmer_payments")
    .select("farmer_id")
    .eq("id", params.id)
    .single();
  if (!existing) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const result = await deletePaymentCore(params.id, existing.farmer_id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });

  return new NextResponse(null, { status: 204 });
}
