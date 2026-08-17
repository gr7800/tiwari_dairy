"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleFarmerStatus } from "@/lib/actions/farmers";

export function FarmerStatusToggle({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          toggleFarmerStatus(id, status).then((result) => {
            if (result?.error) toast.error(result.error);
            else toast.success(status === "ACTIVE" ? "Farmer deactivated" : "Farmer activated");
          });
        })
      }
      className="text-sm text-accent hover:underline disabled:opacity-50"
    >
      {status === "ACTIVE" ? "Deactivate" : "Activate"}
    </button>
  );
}
