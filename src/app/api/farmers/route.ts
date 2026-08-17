import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { createFarmerCore } from "@/lib/actions/farmers";

export async function GET(req: NextRequest) {
  const { supabase, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const search = req.nextUrl.searchParams.get("search")?.trim();
  let query = supabase.from("farmers").select("*").order("farmer_code");
  if (search) {
    query = query.or(`farmer_code.ilike.%${search}%,name.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const result = await createFarmerCore(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data, { status: 201 });
}
