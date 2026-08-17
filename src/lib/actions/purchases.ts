"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateAmount } from "@/lib/amount";
import { toFriendlyMessage } from "@/lib/apiError";

export interface PurchaseActionState {
  error?: string;
}

export interface PurchaseInput {
  farmerId: string;
  purchaseDate: string;
  shiftId: string;
  milkTypeId: string;
  quantity: number;
  rate: number;
  fatPercentage?: number | null;
  snfPercentage?: number | null;
  totalAmount: number;
  isAmountOverridden: boolean;
  notes?: string | null;
}

export interface PurchaseResult {
  data?: Record<string, unknown>;
  error?: string;
  /** REST status code to use for this error; ignored by the form Server Action. */
  status?: number;
}

function validatePurchaseInput(input: PurchaseInput): string | null {
  if (!input.farmerId) return "Please select a farmer";
  if (!input.purchaseDate || !input.shiftId || !input.milkTypeId) {
    return "Date, shift and milk type are required";
  }
  if (!input.quantity || input.quantity <= 0) return "Quantity must be greater than 0";
  if (!input.rate || input.rate <= 0) return "Rate must be greater than 0";
  return null;
}

/**
 * The actual purchase-creation logic (validation, rule #20 duplicate check,
 * amount calculation, insert). Shared by the form Server Action below and by
 * the REST route handler (app/api/purchases/route.ts) so the business rules
 * live in exactly one place regardless of which transport calls it.
 */
export async function createPurchaseCore(input: PurchaseInput): Promise<PurchaseResult> {
  const validationError = validatePurchaseInput(input);
  if (validationError) return { error: validationError, status: 400 };

  const supabase = createClient();

  // Pre-flight duplicate check (rule #20): gives a specific, friendly message
  // naming the farmer/milk type/shift/date, rather than surfacing the raw
  // unique-constraint violation the DB would otherwise throw.
  const { data: existing } = await supabase
    .from("milk_purchases")
    .select("id, farmers(name), milk_types(name), shift_configs(name)")
    .eq("farmer_id", input.farmerId)
    .eq("purchase_date", input.purchaseDate)
    .eq("shift_id", input.shiftId)
    .eq("milk_type_id", input.milkTypeId)
    .maybeSingle();

  if (existing) {
    const row = existing as unknown as {
      farmers: { name: string } | null;
      milk_types: { name: string } | null;
      shift_configs: { name: string } | null;
    };
    return {
      status: 409,
      error:
        `A ${row.milk_types?.name ?? "milk"} purchase already exists for ${row.farmers?.name ?? "this farmer"} ` +
        `during the ${row.shift_configs?.name ?? "selected"} shift on ${input.purchaseDate}. Please edit the existing entry instead.`,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const calculatedAmount = calculateAmount(input.quantity, input.rate);

  const { data, error } = await supabase
    .from("milk_purchases")
    .insert({
      farmer_id: input.farmerId,
      purchase_date: input.purchaseDate,
      shift_id: input.shiftId,
      milk_type_id: input.milkTypeId,
      quantity: input.quantity,
      fat_percentage: input.fatPercentage ?? null,
      snf_percentage: input.snfPercentage ?? null,
      rate: input.rate,
      calculated_amount: calculatedAmount,
      total_amount: input.isAmountOverridden ? input.totalAmount : calculatedAmount,
      is_amount_overridden: input.isAmountOverridden,
      notes: input.notes || null,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { status: 500, error: toFriendlyMessage(error, "Could not save the purchase. Please try again.") };
  }

  revalidatePath("/purchases");
  revalidatePath(`/farmers/${input.farmerId}/ledger`);
  return { data };
}

/**
 * Shared by the edit form's Server Action and app/api/purchases/[id]/route.ts
 * (PUT). Re-runs the same rule #20 duplicate check as create, excluding the
 * row being edited itself so saving a purchase without changing its
 * farmer/date/shift/milk-type doesn't false-positive against its own row.
 */
export async function updatePurchaseCore(id: string, input: PurchaseInput): Promise<PurchaseResult> {
  const validationError = validatePurchaseInput(input);
  if (validationError) return { error: validationError, status: 400 };

  const supabase = createClient();

  const { data: existing } = await supabase
    .from("milk_purchases")
    .select("id, farmers(name), milk_types(name), shift_configs(name)")
    .eq("farmer_id", input.farmerId)
    .eq("purchase_date", input.purchaseDate)
    .eq("shift_id", input.shiftId)
    .eq("milk_type_id", input.milkTypeId)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    const row = existing as unknown as {
      farmers: { name: string } | null;
      milk_types: { name: string } | null;
      shift_configs: { name: string } | null;
    };
    return {
      status: 409,
      error:
        `A ${row.milk_types?.name ?? "milk"} purchase already exists for ${row.farmers?.name ?? "this farmer"} ` +
        `during the ${row.shift_configs?.name ?? "selected"} shift on ${input.purchaseDate}. Please edit that entry instead.`,
    };
  }

  const calculatedAmount = calculateAmount(input.quantity, input.rate);

  const { data, error } = await supabase
    .from("milk_purchases")
    .update({
      farmer_id: input.farmerId,
      purchase_date: input.purchaseDate,
      shift_id: input.shiftId,
      milk_type_id: input.milkTypeId,
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
    return { status: 500, error: toFriendlyMessage(error, "Could not update the purchase. Please try again.") };
  }

  revalidatePath("/purchases");
  revalidatePath(`/farmers/${input.farmerId}/ledger`);
  return { data };
}

export async function deletePurchaseCore(id: string, farmerId: string): Promise<PurchaseResult> {
  const supabase = createClient();
  const { error } = await supabase.from("milk_purchases").delete().eq("id", id);
  if (error) return { status: 500, error: toFriendlyMessage(error, "Could not delete the purchase.") };

  revalidatePath("/purchases");
  revalidatePath(`/farmers/${farmerId}/ledger`);
  return {};
}

function parsePurchaseFormData(formData: FormData): PurchaseInput {
  const fatRaw = formData.get("fatPercentage");
  const snfRaw = formData.get("snfPercentage");
  return {
    farmerId: String(formData.get("farmerId") ?? ""),
    purchaseDate: String(formData.get("purchaseDate") ?? ""),
    shiftId: String(formData.get("shiftId") ?? ""),
    milkTypeId: String(formData.get("milkTypeId") ?? ""),
    quantity: Number(formData.get("quantity")),
    rate: Number(formData.get("rate")),
    fatPercentage: fatRaw ? Number(fatRaw) : null,
    snfPercentage: snfRaw ? Number(snfRaw) : null,
    totalAmount: Number(formData.get("totalAmount")),
    isAmountOverridden: formData.get("isAmountOverridden") === "true",
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createPurchase(
  _prev: PurchaseActionState,
  formData: FormData
): Promise<PurchaseActionState> {
  const result = await createPurchaseCore(parsePurchaseFormData(formData));
  return result.error ? { error: result.error } : {};
}

export async function updatePurchase(
  id: string,
  _prev: PurchaseActionState,
  formData: FormData
): Promise<PurchaseActionState> {
  const result = await updatePurchaseCore(id, parsePurchaseFormData(formData));
  return result.error ? { error: result.error } : {};
}

export async function deletePurchase(id: string, farmerId: string): Promise<{ error?: string }> {
  const result = await deletePurchaseCore(id, farmerId);
  return result.error ? { error: result.error } : {};
}
