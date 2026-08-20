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
      className="text-sm text-accent transition-transform hover:underline active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
    >
      {status === "ACTIVE" ? "Deactivate" : "Activate"}
    </button>
  );
}
