import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { updateExpenseCategoryStatusCore } from "@/lib/actions/expenseCategories";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
  const result = await updateExpenseCategoryStatusCore(params.id, status);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });

  return NextResponse.json(result.data);
}
