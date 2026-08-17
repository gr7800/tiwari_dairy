"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createExpense, type ExpenseActionState } from "@/lib/actions/expenses";
import { useActionToast } from "@/hooks/useActionToast";
import { useDefaultDate } from "@/hooks/useDefaultDate";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Field";

const initialState: ExpenseActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save Expense"}
    </Button>
  );
}

export function ExpenseForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createExpense, initialState);
  useActionToast(state, "Expense saved");
  const [date, setDate] = useDefaultDate();

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Add Expense</h2>

      <FieldGroup label="Date">
        <Input type="date" name="expenseDate" value={date} onChange={(e) => setDate(e.target.value)} required />
      </FieldGroup>

      <FieldGroup label="Category">
        <Select name="categoryId" required defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Amount">
        <Input type="number" step="0.01" min="0.01" name="amount" required />
      </FieldGroup>

      <FieldGroup label="Notes">
        <Input name="notes" placeholder="Optional" />
      </FieldGroup>

      <SubmitButton />
    </form>
  );
}
