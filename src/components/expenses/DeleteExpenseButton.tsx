"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/lib/actions/expenses";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this expense entry?")) {
          startTransition(() => {
            deleteExpense(id).then((result) => {
              if (result?.error) toast.error(result.error);
              else toast.success("Expense deleted");
            });
          });
        }
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
