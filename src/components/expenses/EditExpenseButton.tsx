"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateExpense, type ExpenseActionState } from "@/lib/actions/expenses";
import { useActionToast, useActionSuccess } from "@/hooks/useActionToast";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export interface EditableExpense {
  id: string;
  expense_date: string;
  amount: number;
  notes: string | null;
  category_id: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

function EditExpenseForm({
  expense,
  categories,
  onSaved,
}: {
  expense: EditableExpense;
  categories: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const initialState: ExpenseActionState = {};
  const [state, formAction] = useFormState(updateExpense.bind(null, expense.id), initialState);
  useActionToast(state, "Expense updated");
  useActionSuccess(state, onSaved);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Date">
          <Input type="date" name="expenseDate" defaultValue={expense.expense_date} required />
        </FieldGroup>
        <FieldGroup label="Category">
          <Select name="categoryId" defaultValue={expense.category_id} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Amount">
        <Input type="number" step="0.01" min="0.01" name="amount" defaultValue={expense.amount} required />
      </FieldGroup>

      <FieldGroup label="Notes">
        <Input name="notes" defaultValue={expense.notes ?? ""} placeholder="Optional" />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onSaved}>
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

export function EditExpenseButton({
  expense,
  categories,
}: {
  expense: EditableExpense;
  categories: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setIsOpen(true)} className="!px-2 !py-1 text-xs">
        Edit
      </Button>
      {isOpen && (
        <Modal title="Edit Expense" onClose={() => setIsOpen(false)}>
          <EditExpenseForm expense={expense} categories={categories} onSaved={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}
