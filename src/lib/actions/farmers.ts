"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export interface FarmerActionState {
  error?: string;
}

export interface FarmerInput {
  farmerCode: string;
  name: string;
  phone?: string | null;
  address?: string | null;
}

export interface FarmerResult {
  data?: Record<string, unknown>;
  error?: string;
  status?: number;
}

/** Shared by the form Server Action and app/api/farmers/route.ts. */
export async function createFarmerCore(input: FarmerInput): Promise<FarmerResult> {
  if (!input.farmerCode || !input.name) {
    return { error: "Farmer code and name are required", status: 400 };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("farmers")
    .insert({
      farmer_code: input.farmerCode,
      name: input.name,
      phone: input.phone || null,
      address: input.address || null,
    })
    .select()
    .single();

  if (error) {
    return {
      status: error.code === "23505" ? 409 : 500,
      error: error.code === "23505" ? `Farmer code "${input.farmerCode}" is already in use` : error.message,
    };
  }

  revalidatePath("/farmers");
  return { data };
}

export interface FarmerUpdateInput {
  farmerCode?: string;
  name?: string;
  phone?: string | null;
  address?: string | null;
  status?: "ACTIVE" | "INACTIVE";
}

/** Shared by toggleFarmerStatusCore and app/api/farmers/[id]/route.ts (PUT). */
export async function updateFarmerCore(id: string, updates: FarmerUpdateInput): Promise<FarmerResult> {
  const patch: Database["public"]["Tables"]["farmers"]["Update"] = {};
  if (updates.farmerCode !== undefined) patch.farmer_code = updates.farmerCode;
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.phone !== undefined) patch.phone = updates.phone;
  if (updates.address !== undefined) patch.address = updates.address;
  if (updates.status !== undefined) patch.status = updates.status;

  const supabase = createClient();
  const { data, error } = await supabase.from("farmers").update(patch).eq("id", id).select().single();

  if (error) {
    return {
      status: error.code === "23505" ? 409 : error.code === "PGRST116" ? 404 : 500,
      error: error.code === "23505" ? "Farmer code is already in use" : error.message,
    };
  }

  revalidatePath("/farmers");
  return { data };
}

export async function toggleFarmerStatusCore(
  id: string,
  currentStatus: "ACTIVE" | "INACTIVE"
): Promise<FarmerResult> {
  return updateFarmerCore(id, { status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
}

export async function createFarmer(_prev: FarmerActionState, formData: FormData): Promise<FarmerActionState> {
  const result = await createFarmerCore({
    farmerCode: String(formData.get("farmerCode") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function updateFarmer(
  id: string,
  _prev: FarmerActionState,
  formData: FormData
): Promise<FarmerActionState> {
  const result = await updateFarmerCore(id, {
    farmerCode: String(formData.get("farmerCode") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function toggleFarmerStatus(
  id: string,
  currentStatus: "ACTIVE" | "INACTIVE"
): Promise<{ error?: string }> {
  const result = await toggleFarmerStatusCore(id, currentStatus);
  return result.error ? { error: result.error } : {};
}
