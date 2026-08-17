"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateFarmer, type FarmerActionState } from "@/lib/actions/farmers";
import { useActionToast, useActionSuccess } from "@/hooks/useActionToast";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export interface EditableFarmer {
  id: string;
  farmer_code: string;
  name: string;
  phone: string | null;
  address: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

function EditFarmerForm({ farmer, onSaved }: { farmer: EditableFarmer; onSaved: () => void }) {
  const initialState: FarmerActionState = {};
  const [state, formAction] = useFormState(updateFarmer.bind(null, farmer.id), initialState);
  useActionToast(state, "Farmer updated");
  useActionSuccess(state, onSaved);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Farmer Code">
          <Input name="farmerCode" defaultValue={farmer.farmer_code} required />
        </FieldGroup>
        <FieldGroup label="Name">
          <Input name="name" defaultValue={farmer.name} required />
        </FieldGroup>
        <FieldGroup label="Phone">
          <Input name="phone" defaultValue={farmer.phone ?? ""} placeholder="Optional" />
        </FieldGroup>
        <FieldGroup label="Address">
          <Input name="address" defaultValue={farmer.address ?? ""} placeholder="Optional" />
        </FieldGroup>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onSaved}>
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

export function EditFarmerButton({ farmer }: { farmer: EditableFarmer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="text-sm text-accent hover:underline">
        Edit
      </button>
      {isOpen && (
        <Modal title="Edit Farmer" onClose={() => setIsOpen(false)}>
          <EditFarmerForm farmer={farmer} onSaved={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}
