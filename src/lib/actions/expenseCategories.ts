"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MasterDataActionState, MasterDataResult } from "./milkTypes";

export type { MasterDataResult };

/** Shared by the form Server Action and app/api/expense-categories/route.ts. */
export async function createExpenseCategoryCore(name: string): Promise<MasterDataResult> {
  if (!name) return { error: "Name is required", status: 400 };

  const supabase = createClient();
  const { data, error } = await supabase.from("expense_categories").insert({ name }).select().single();
  if (error) {
    return {
      status: error.code === "23505" ? 409 : 500,
      error: error.code === "23505" ? "A category with this name already exists" : error.message,
    };
  }

  revalidatePath("/settings/expense-categories");
  return { data };
}

export async function updateExpenseCategoryStatusCore(
  id: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<MasterDataResult> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expense_categories")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) return { status: 500, error: error.message };

  revalidatePath("/settings/expense-categories");
  return { data };
}

export async function createExpenseCategory(
  _prev: MasterDataActionState,
  formData: FormData
): Promise<MasterDataActionState> {
  const result = await createExpenseCategoryCore(String(formData.get("name") ?? "").trim());
  return result.error ? { error: result.error } : {};
}

export async function toggleExpenseCategoryStatus(
  id: string,
  currentStatus: "ACTIVE" | "INACTIVE"
): Promise<{ error?: string }> {
  const result = await updateExpenseCategoryStatusCore(id, currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE");
  return result.error ? { error: result.error } : {};
}
