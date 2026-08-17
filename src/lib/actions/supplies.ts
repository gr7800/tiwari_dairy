"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateAmount } from "@/lib/amount";
import { toFriendlyMessage } from "@/lib/apiError";

export interface SupplyActionState {
  error?: string;
}

export interface SupplyInput {
  supplyDate: string;
  shiftId: string;
  milkTypeId: string;
  customerName?: string | null;
  quantity: number;
  rate: number;
  fatPercentage?: number | null;
  snfPercentage?: number | null;
  totalAmount: number;
  isAmountOverridden: boolean;
  notes?: string | null;
}

export interface SupplyResult {
  data?: Record<string, unknown>;
  error?: string;
  status?: number;
}

/** Shared by the form Server Action and app/api/supplies/route.ts. */
export async function createSupplyCore(input: SupplyInput): Promise<SupplyResult> {
  if (!input.supplyDate || !input.shiftId || !input.milkTypeId) {
    return { error: "Date, shift and milk type are required", status: 400 };
  }
  if (!input.quantity || input.quantity <= 0) return { error: "Quantity must be greater than 0", status: 400 };
  if (!input.rate || input.rate <= 0) return { error: "Rate must be greater than 0", status: 400 };

  const supabase = createClient();
  const calculatedAmount = calculateAmount(input.quantity, input.rate);

  const { data, error } = await supabase
    .from("milk_supplies")
    .insert({
      supply_date: input.supplyDate,
      shift_id: input.shiftId,
      milk_type_id: input.milkTypeId,
      customer_name: input.customerName || null,
      quantity: input.quantity,
      fat_percentage: input.fatPercentage ?? null,
      snf_percentage: input.snfPercentage ?? null,
      rate: input.rate,
      calculated_amount: calculatedAmount,
      total_amount: input.isAmountOverridden ? input.totalAmount : calculatedAmount,
      is_amount_overridden: input.isAmountOverridden,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    return { status: 500, error: toFriendlyMessage(error, "Could not save the supply entry. Please try again.") };
  }

  revalidatePath("/supplies");
  return { data };
}

/** Shared by the edit form's Server Action and app/api/supplies/[id]/route.ts (PUT). */
export async function updateSupplyCore(id: string, input: SupplyInput): Promise<SupplyResult> {
  if (!input.supplyDate || !input.shiftId || !input.milkTypeId) {
    return { error: "Date, shift and milk type are required", status: 400 };
  }
  if (!input.quantity || input.quantity <= 0) return { error: "Quantity must be greater than 0", status: 400 };
  if (!input.rate || input.rate <= 0) return { error: "Rate must be greater than 0", status: 400 };

  const supabase = createClient();
  const calculatedAmount = calculateAmount(input.quantity, input.rate);

  const { data, error } = await supabase
    .from("milk_supplies")
    .update({
      supply_date: input.supplyDate,
      shift_id: input.shiftId,
      milk_type_id: input.milkTypeId,
      customer_name: input.customerName || null,
      quantity: input.quantity,
      fat_percentage: input.fatPercentage ?? null,
      snf_percentage: input.snfPercentage ?? null,
      rate: input.rate,
      calculated_amount: calculatedAmount,
      total_amount: input.isAmountOverridden ? input.totalAmount : calculatedAmount,
      is_amount_overridden: input.isAmountOverridden,
      notes: input.notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { status: 500, error: toFriendlyMessage(error, "Could not update the supply entry. Please try again.") };
  }

  revalidatePath("/supplies");
  return { data };
}

export async function deleteSupplyCore(id: string): Promise<SupplyResult> {
  const supabase = createClient();
  const { error } = await supabase.from("milk_supplies").delete().eq("id", id);
  if (error) return { status: 500, error: toFriendlyMessage(error, "Could not delete the supply entry.") };

  revalidatePath("/supplies");
  return {};
}

export async function createSupply(_prev: SupplyActionState, formData: FormData): Promise<SupplyActionState> {
  const fatRaw = formData.get("fatPercentage");
  const snfRaw = formData.get("snfPercentage");
  const result = await createSupplyCore({
    supplyDate: String(formData.get("supplyDate") ?? ""),
    shiftId: String(formData.get("shiftId") ?? ""),
    milkTypeId: String(formData.get("milkTypeId") ?? ""),
    customerName: String(formData.get("customerName") ?? "").trim() || null,
    quantity: Number(formData.get("quantity")),
    rate: Number(formData.get("rate")),
    fatPercentage: fatRaw ? Number(fatRaw) : null,
    snfPercentage: snfRaw ? Number(snfRaw) : null,
    totalAmount: Number(formData.get("totalAmount")),
    isAmountOverridden: formData.get("isAmountOverridden") === "true",
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function updateSupply(
  id: string,
  _prev: SupplyActionState,
  formData: FormData
): Promise<SupplyActionState> {
  const fatRaw = formData.get("fatPercentage");
  const snfRaw = formData.get("snfPercentage");
  const result = await updateSupplyCore(id, {
    supplyDate: String(formData.get("supplyDate") ?? ""),
    shiftId: String(formData.get("shiftId") ?? ""),
    milkTypeId: String(formData.get("milkTypeId") ?? ""),
    customerName: String(formData.get("customerName") ?? "").trim() || null,
    quantity: Number(formData.get("quantity")),
    rate: Number(formData.get("rate")),
    fatPercentage: fatRaw ? Number(fatRaw) : null,
    snfPercentage: snfRaw ? Number(snfRaw) : null,
    totalAmount: Number(formData.get("totalAmount")),
    isAmountOverridden: formData.get("isAmountOverridden") === "true",
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function deleteSupply(id: string): Promise<{ error?: string }> {
  const result = await deleteSupplyCore(id);
  return result.error ? { error: result.error } : {};
}
