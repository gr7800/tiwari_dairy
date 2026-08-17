import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { deletePurchaseCore, updatePurchaseCore } from "@/lib/actions/purchases";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabase
    .from("milk_purchases")
    .select("*, farmers(id, name, farmer_code), milk_types(name), shift_configs(name)")
    .eq("id", params.id)
    .single();
  if (error) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await updatePurchaseCore(params.id, body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { data: existing } = await supabase
    .from("milk_purchases")
    .select("farmer_id")
    .eq("id", params.id)
    .single();
  if (!existing) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

  const result = await deletePurchaseCore(params.id, existing.farmer_id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });

  return new NextResponse(null, { status: 204 });
}
