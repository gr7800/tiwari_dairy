"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteSupply } from "@/lib/actions/supplies";

export function DeleteSupplyButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this supply entry?")) {
          startTransition(() => {
            deleteSupply(id).then((result) => {
              if (result?.error) toast.error(result.error);
              else toast.success("Supply entry deleted");
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
