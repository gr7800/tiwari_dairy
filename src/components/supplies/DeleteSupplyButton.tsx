"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteSupply } from "@/lib/actions/supplies";
import { Button } from "@/components/ui/Button";

export function DeleteSupplyButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
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
      className="!px-2 !py-1 text-xs disabled:opacity-50"
    >
      Delete
    </Button>
  );
}
