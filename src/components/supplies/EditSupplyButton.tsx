"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateSupply, type SupplyActionState } from "@/lib/actions/supplies";
import { useActionToast, useActionSuccess } from "@/hooks/useActionToast";
import { useCalculatedAmount } from "@/hooks/useCalculatedAmount";
import { AmountField } from "@/components/ui/AmountField";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export interface EditableSupply {
  id: string;
  supply_date: string;
  customer_name: string | null;
  quantity: number;
  rate: number;
  fat_percentage: number | null;
  snf_percentage: number | null;
  total_amount: number;
  is_amount_overridden: boolean;
  notes: string | null;
  shift_id: string;
  milk_type_id: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

function EditSupplyForm({
  supply,
  milkTypes,
  shifts,
  onSaved,
}: {
  supply: EditableSupply;
  milkTypes: { id: string; name: string }[];
  shifts: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const initialState: SupplyActionState = {};
  const [state, formAction] = useFormState(updateSupply.bind(null, supply.id), initialState);
  useActionToast(state, "Supply entry updated");
  useActionSuccess(state, onSaved);

  const [shiftId, setShiftId] = useState(supply.shift_id);
  const [milkTypeId, setMilkTypeId] = useState(supply.milk_type_id);
  const [quantity, setQuantity] = useState(supply.quantity);
  const [rate, setRate] = useState(supply.rate);
  const { totalAmount, isOverridden, overrideTotal, resetToCalculated } = useCalculatedAmount(quantity, rate, {
    isOverridden: supply.is_amount_overridden,
    totalAmount: supply.total_amount,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Date">
          <Input type="date" name="supplyDate" defaultValue={supply.supply_date} required />
        </FieldGroup>
        <FieldGroup label="Shift">
          <Select name="shiftId" value={shiftId} onChange={(e) => setShiftId(e.target.value)} required>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Milk Type">
          <Select name="milkTypeId" value={milkTypeId} onChange={(e) => setMilkTypeId(e.target.value)} required>
            {milkTypes.map((mt) => (
              <option key={mt.id} value={mt.id}>
                {mt.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Customer / Buyer">
          <Input name="customerName" defaultValue={supply.customer_name ?? ""} placeholder="Optional" />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FieldGroup label="Quantity (L)">
          <Input
            type="number"
            step="0.01"
            min="0.01"
            name="quantity"
            value={quantity || ""}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </FieldGroup>
        <FieldGroup label="Fat %">
          <Input type="number" step="0.1" min="0" max="100" name="fatPercentage" defaultValue={supply.fat_percentage ?? ""} />
        </FieldGroup>
        <FieldGroup label="SNF %">
          <Input type="number" step="0.1" min="0" max="100" name="snfPercentage" defaultValue={supply.snf_percentage ?? ""} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Rate (per L)">
          <Input
            type="number"
            step="0.01"
            min="0.01"
            name="rate"
            value={rate || ""}
            onChange={(e) => setRate(Number(e.target.value))}
            required
          />
        </FieldGroup>
        <FieldGroup label="Total Amount">
          <AmountField
            amountFieldName="totalAmount"
            overriddenFieldName="isAmountOverridden"
            totalAmount={totalAmount}
            isOverridden={isOverridden}
            onChange={overrideTotal}
            onReset={resetToCalculated}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Notes">
        <Input name="notes" defaultValue={supply.notes ?? ""} placeholder="Optional" />
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

export function EditSupplyButton({
  supply,
  milkTypes,
  shifts,
}: {
  supply: EditableSupply;
  milkTypes: { id: string; name: string }[];
  shifts: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="text-sm text-accent hover:underline">
        Edit
      </button>
      {isOpen && (
        <Modal title="Edit Milk Supply" onClose={() => setIsOpen(false)}>
          <EditSupplyForm supply={supply} milkTypes={milkTypes} shifts={shifts} onSaved={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}
