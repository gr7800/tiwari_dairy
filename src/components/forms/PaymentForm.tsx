"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPayment, type PaymentActionState } from "@/lib/actions/payments";
import { useActionToast } from "@/hooks/useActionToast";
import { useDefaultDate } from "@/hooks/useDefaultDate";
import { FarmerCombobox, type FarmerOption } from "@/components/ui/FarmerCombobox";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Field";

const initialState: PaymentActionState = {};

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
      {pending ? "Saving…" : "Save Payment"}
    </Button>
  );
}

export function PaymentForm({ farmers }: { farmers: FarmerOption[] }) {
  const [state, formAction] = useFormState(createPayment, initialState);
  useActionToast(state, "Payment saved");
  const [date, setDate] = useDefaultDate();

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Add Payment</h2>

      <FieldGroup label="Farmer">
        <FarmerCombobox farmers={farmers} name="farmerId" required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Date">
          <Input type="date" name="paymentDate" value={date} onChange={(e) => setDate(e.target.value)} required />
        </FieldGroup>
        <FieldGroup label="Amount">
          <Input type="number" step="0.01" min="0.01" name="amount" required />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Payment Method" hint={<span className="text-xs text-slate-400 dark:text-slate-500">defaults to Cash</span>}>
          <Select name="paymentMethod" defaultValue="CASH">
            {paymentMethods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Reference Number">
          <Input name="referenceNumber" placeholder="Optional" />
        </FieldGroup>
      </div>

      <FieldGroup label="Notes">
        <Input name="notes" placeholder="Optional" />
      </FieldGroup>

      <SubmitButton />
    </form>
  );
}
