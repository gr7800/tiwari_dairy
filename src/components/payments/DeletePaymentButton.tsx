"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deletePayment } from "@/lib/actions/payments";

export function DeletePaymentButton({ id, farmerId }: { id: string; farmerId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
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
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
