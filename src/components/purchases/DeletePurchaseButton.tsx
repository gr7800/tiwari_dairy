"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deletePurchase } from "@/lib/actions/purchases";
import { Button } from "@/components/ui/Button";

export function DeletePurchaseButton({ id, farmerId }: { id: string; farmerId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
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
      className="!px-2 !py-1 text-xs disabled:opacity-50"
    >
      Delete
    </Button>
  );
}
