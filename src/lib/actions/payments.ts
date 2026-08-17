"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toFriendlyMessage } from "@/lib/apiError";
import type { PaymentMethod } from "@/lib/supabase/types";

export interface PaymentActionState {
  error?: string;
}

export interface PaymentInput {
  farmerId: string;
  paymentDate: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PaymentResult {
  data?: Record<string, unknown>;
  error?: string;
  status?: number;
}

const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "UPI", "BANK_TRANSFER", "OTHER"];

function parsePaymentMethod(value: unknown): PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod) ? (value as PaymentMethod) : "CASH";
}

/** Shared by the form Server Action and app/api/payments/route.ts. */
export async function createPaymentCore(input: PaymentInput): Promise<PaymentResult> {
  if (!input.farmerId) return { error: "Please select a farmer", status: 400 };
  if (!input.paymentDate) return { error: "Date is required", status: 400 };
  if (!input.amount || input.amount <= 0) return { error: "Amount must be greater than 0", status: 400 };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("farmer_payments")
    .insert({
      farmer_id: input.farmerId,
      payment_date: input.paymentDate,
      amount: input.amount,
      payment_method: parsePaymentMethod(input.paymentMethod),
      reference_number: input.referenceNumber || null,
      notes: input.notes || null,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { status: 500, error: toFriendlyMessage(error, "Could not save the payment. Please try again.") };
  }

  revalidatePath("/payments");
  revalidatePath(`/farmers/${input.farmerId}/ledger`);
  return { data };
}

/** Shared by the edit form's Server Action and app/api/payments/[id]/route.ts (PUT). */
export async function updatePaymentCore(id: string, input: PaymentInput): Promise<PaymentResult> {
  if (!input.farmerId) return { error: "Please select a farmer", status: 400 };
  if (!input.paymentDate) return { error: "Date is required", status: 400 };
  if (!input.amount || input.amount <= 0) return { error: "Amount must be greater than 0", status: 400 };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("farmer_payments")
    .update({
      farmer_id: input.farmerId,
      payment_date: input.paymentDate,
      amount: input.amount,
      payment_method: parsePaymentMethod(input.paymentMethod),
      reference_number: input.referenceNumber || null,
      notes: input.notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { status: 500, error: toFriendlyMessage(error, "Could not update the payment. Please try again.") };
  }

  revalidatePath("/payments");
  revalidatePath(`/farmers/${input.farmerId}/ledger`);
  return { data };
}

export async function deletePaymentCore(id: string, farmerId: string): Promise<PaymentResult> {
  const supabase = createClient();
  const { error } = await supabase.from("farmer_payments").delete().eq("id", id);
  if (error) return { status: 500, error: toFriendlyMessage(error, "Could not delete the payment.") };

  revalidatePath("/payments");
  revalidatePath(`/farmers/${farmerId}/ledger`);
  return {};
}

export async function createPayment(_prev: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  const result = await createPaymentCore({
    farmerId: String(formData.get("farmerId") ?? ""),
    paymentDate: String(formData.get("paymentDate") ?? ""),
    amount: Number(formData.get("amount")),
    paymentMethod: parsePaymentMethod(formData.get("paymentMethod")),
    referenceNumber: String(formData.get("referenceNumber") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function updatePayment(
  id: string,
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const result = await updatePaymentCore(id, {
    farmerId: String(formData.get("farmerId") ?? ""),
    paymentDate: String(formData.get("paymentDate") ?? ""),
    amount: Number(formData.get("amount")),
    paymentMethod: parsePaymentMethod(formData.get("paymentMethod")),
    referenceNumber: String(formData.get("referenceNumber") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function deletePayment(id: string, farmerId: string): Promise<{ error?: string }> {
  const result = await deletePaymentCore(id, farmerId);
  return result.error ? { error: result.error } : {};
}
