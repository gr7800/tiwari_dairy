"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toFriendlyMessage } from "@/lib/apiError";

export interface ExpenseActionState {
  error?: string;
}

export interface ExpenseInput {
  expenseDate: string;
  categoryId: string;
  amount: number;
  notes?: string | null;
}

export interface ExpenseResult {
  data?: Record<string, unknown>;
  error?: string;
  status?: number;
}

/** Shared by the form Server Action and app/api/expenses/route.ts. */
export async function createExpenseCore(input: ExpenseInput): Promise<ExpenseResult> {
  if (!input.expenseDate) return { error: "Date is required", status: 400 };
  if (!input.categoryId) return { error: "Please select a category", status: 400 };
  if (!input.amount || input.amount <= 0) return { error: "Amount must be greater than 0", status: 400 };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      expense_date: input.expenseDate,
      category_id: input.categoryId,
      amount: input.amount,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    return { status: 500, error: toFriendlyMessage(error, "Could not save the expense. Please try again.") };
  }

  revalidatePath("/expenses");
  return { data };
}

/** Shared by the edit form's Server Action and app/api/expenses/[id]/route.ts (PUT). */
export async function updateExpenseCore(id: string, input: ExpenseInput): Promise<ExpenseResult> {
  if (!input.expenseDate) return { error: "Date is required", status: 400 };
  if (!input.categoryId) return { error: "Please select a category", status: 400 };
  if (!input.amount || input.amount <= 0) return { error: "Amount must be greater than 0", status: 400 };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .update({
      expense_date: input.expenseDate,
      category_id: input.categoryId,
      amount: input.amount,
      notes: input.notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { status: 500, error: toFriendlyMessage(error, "Could not update the expense. Please try again.") };
  }

  revalidatePath("/expenses");
  return { data };
}

export async function deleteExpenseCore(id: string): Promise<ExpenseResult> {
  const supabase = createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { status: 500, error: toFriendlyMessage(error, "Could not delete the expense.") };

  revalidatePath("/expenses");
  return {};
}

export async function createExpense(_prev: ExpenseActionState, formData: FormData): Promise<ExpenseActionState> {
  const result = await createExpenseCore({
    expenseDate: String(formData.get("expenseDate") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    amount: Number(formData.get("amount")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function updateExpense(
  id: string,
  _prev: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const result = await updateExpenseCore(id, {
    expenseDate: String(formData.get("expenseDate") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    amount: Number(formData.get("amount")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  return result.error ? { error: result.error } : {};
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const result = await deleteExpenseCore(id);
  return result.error ? { error: result.error } : {};
}
