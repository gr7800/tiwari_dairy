"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updatePayment, type PaymentActionState } from "@/lib/actions/payments";
import { useActionToast, useActionSuccess } from "@/hooks/useActionToast";
import { FarmerCombobox, type FarmerOption } from "@/components/ui/FarmerCombobox";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export interface EditablePayment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  farmer_id: string;
}

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

function EditPaymentForm({
  payment,
  farmers,
  onSaved,
}: {
  payment: EditablePayment;
  farmers: FarmerOption[];
  onSaved: () => void;
}) {
  const initialState: PaymentActionState = {};
  const [state, formAction] = useFormState(updatePayment.bind(null, payment.id), initialState);
  useActionToast(state, "Payment updated");
  useActionSuccess(state, onSaved);

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Farmer">
        <FarmerCombobox farmers={farmers} name="farmerId" defaultValue={payment.farmer_id} required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Date">
          <Input type="date" name="paymentDate" defaultValue={payment.payment_date} required />
        </FieldGroup>
        <FieldGroup label="Amount">
          <Input type="number" step="0.01" min="0.01" name="amount" defaultValue={payment.amount} required />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Payment Method">
          <Select name="paymentMethod" defaultValue={payment.payment_method}>
            {paymentMethods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Reference Number">
          <Input name="referenceNumber" defaultValue={payment.reference_number ?? ""} placeholder="Optional" />
        </FieldGroup>
      </div>

      <FieldGroup label="Notes">
        <Input name="notes" defaultValue={payment.notes ?? ""} placeholder="Optional" />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onSaved}>
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

export function EditPaymentButton({ payment, farmers }: { payment: EditablePayment; farmers: FarmerOption[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setIsOpen(true)} className="!px-2 !py-1 text-xs">
        Edit
      </Button>
      {isOpen && (
        <Modal title="Edit Payment" onClose={() => setIsOpen(false)}>
          <EditPaymentForm payment={payment} farmers={farmers} onSaved={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}
