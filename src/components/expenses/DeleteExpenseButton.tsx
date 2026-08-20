"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/Button";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
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
      className="!px-2 !py-1 text-xs disabled:opacity-50"
    >
      Delete
    </Button>
  );
}
