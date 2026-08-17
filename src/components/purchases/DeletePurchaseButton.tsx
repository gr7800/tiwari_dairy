"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deletePurchase } from "@/lib/actions/purchases";

export function DeletePurchaseButton({ id, farmerId }: { id: string; farmerId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this purchase entry?")) {
          startTransition(() => {
            deletePurchase(id, farmerId).then((result) => {
              if (result?.error) toast.error(result.error);
              else toast.success("Purchase deleted");
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
