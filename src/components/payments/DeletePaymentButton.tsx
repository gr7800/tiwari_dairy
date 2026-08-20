"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deletePayment } from "@/lib/actions/payments";
import { Button } from "@/components/ui/Button";

export function DeletePaymentButton({ id, farmerId }: { id: string; farmerId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this payment entry?")) {
          startTransition(() => {
            deletePayment(id, farmerId).then((result) => {
              if (result?.error) toast.error(result.error);
              else toast.success("Payment deleted");
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
