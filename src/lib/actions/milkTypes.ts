"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface MasterDataActionState {
  error?: string;
}

export interface MasterDataResult {
  data?: Record<string, unknown>;
  error?: string;
  status?: number;
}

/** Shared by the form Server Action and app/api/milk-types/route.ts. */
export async function createMilkTypeCore(name: string): Promise<MasterDataResult> {
  if (!name) return { error: "Name is required", status: 400 };

  const supabase = createClient();
  const { data, error } = await supabase.from("milk_types").insert({ name }).select().single();
  if (error) {
    return {
      status: error.code === "23505" ? 409 : 500,
      error: error.code === "23505" ? "A milk type with this name already exists" : error.message,
    };
  }

  revalidatePath("/settings/milk-types");
  return { data };
}

export async function updateMilkTypeStatusCore(
  id: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<MasterDataResult> {
  const supabase = createClient();
  const { data, error } = await supabase.from("milk_types").update({ status }).eq("id", id).select().single();
  if (error) return { status: 500, error: error.message };

  revalidatePath("/settings/milk-types");
  return { data };
}

export async function createMilkType(
  _prev: MasterDataActionState,
  formData: FormData
): Promise<MasterDataActionState> {
  const result = await createMilkTypeCore(String(formData.get("name") ?? "").trim());
  return result.error ? { error: result.error } : {};
}

export async function toggleMilkTypeStatus(
  id: string,
  currentStatus: "ACTIVE" | "INACTIVE"
): Promise<{ error?: string }> {
  const result = await updateMilkTypeStatusCore(id, currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE");
  return result.error ? { error: result.error } : {};
}
