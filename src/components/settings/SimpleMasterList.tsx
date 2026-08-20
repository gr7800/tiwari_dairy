"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTransition } from "react";
import { toast } from "sonner";
import { useActionToast } from "@/hooks/useActionToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

interface Item {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
}

interface ActionState {
  error?: string;
}

interface ToggleResult {
  error?: string;
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding…" : "Add"}
    </Button>
  );
}

export function SimpleMasterList({
  items,
  createAction,
  toggleAction,
  placeholder,
}: {
  items: Item[];
  createAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  toggleAction: (id: string, currentStatus: "ACTIVE" | "INACTIVE") => Promise<ToggleResult | void>;
  placeholder: string;
}) {
  const [state, formAction] = useFormState(createAction, {});
  useActionToast(state, "Added");
  const [isPending, startTransition] = useTransition();

  function handleToggle(item: Item) {
    startTransition(() => {
      toggleAction(item.id, item.status).then((result) => {
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(item.status === "ACTIVE" ? "Deactivated" : "Activated");
        }
      });
    });
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex gap-2">
        <Input name="name" placeholder={placeholder} required className="max-w-xs" />
        <AddButton />
      </form>

      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-900 dark:text-slate-100">{item.name}</span>
              {item.status === "INACTIVE" && <Badge>Inactive</Badge>}
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(item)}
              className="text-sm text-accent hover:underline disabled:opacity-50"
            >
              {item.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">Nothing added yet.</li>}
      </ul>
    </div>
  );
}
