"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createFarmer, type FarmerActionState } from "@/lib/actions/farmers";
import { useActionToast } from "@/hooks/useActionToast";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Field";

const initialState: FarmerActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Add Farmer"}
    </Button>
  );
}

export function AddFarmerForm() {
  const [state, formAction] = useFormState(createFarmer, initialState);
  useActionToast(state, "Farmer added");

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4 dark:border-slate-700 dark:bg-slate-800">
      <FieldGroup label="Farmer Code">
        <Input name="farmerCode" placeholder="F001" required />
      </FieldGroup>
      <FieldGroup label="Name">
        <Input name="name" placeholder="Ram Singh" required />
      </FieldGroup>
      <FieldGroup label="Phone">
        <Input name="phone" placeholder="Optional" />
      </FieldGroup>
      <FieldGroup label="Address">
        <Input name="address" placeholder="Optional" />
      </FieldGroup>
      <div className="col-span-2 flex items-end gap-3 sm:col-span-4">
        <SubmitButton />
      </div>
    </form>
  );
}
