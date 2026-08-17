"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updatePurchase, type PurchaseActionState } from "@/lib/actions/purchases";
import { useActionToast, useActionSuccess } from "@/hooks/useActionToast";
import { useCalculatedAmount } from "@/hooks/useCalculatedAmount";
import { FarmerCombobox, type FarmerOption } from "@/components/ui/FarmerCombobox";
import { AmountField } from "@/components/ui/AmountField";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export interface EditablePurchase {
  id: string;
  purchase_date: string;
  quantity: number;
  rate: number;
  fat_percentage: number | null;
  snf_percentage: number | null;
  total_amount: number;
  is_amount_overridden: boolean;
  notes: string | null;
  farmer_id: string;
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

function EditPurchaseForm({
  purchase,
  farmers,
  milkTypes,
  shifts,
  onSaved,
}: {
  purchase: EditablePurchase;
  farmers: FarmerOption[];
  milkTypes: { id: string; name: string }[];
  shifts: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const initialState: PurchaseActionState = {};
  const [state, formAction] = useFormState(updatePurchase.bind(null, purchase.id), initialState);
  useActionToast(state, "Purchase updated");
  useActionSuccess(state, onSaved);

  const [shiftId, setShiftId] = useState(purchase.shift_id);
  const [milkTypeId, setMilkTypeId] = useState(purchase.milk_type_id);
  const [quantity, setQuantity] = useState(purchase.quantity);
  const [rate, setRate] = useState(purchase.rate);
  const { totalAmount, isOverridden, overrideTotal, resetToCalculated } = useCalculatedAmount(quantity, rate, {
    isOverridden: purchase.is_amount_overridden,
    totalAmount: purchase.total_amount,
  });

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Farmer">
        <FarmerCombobox farmers={farmers} name="farmerId" defaultValue={purchase.farmer_id} required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Date">
          <Input type="date" name="purchaseDate" defaultValue={purchase.purchase_date} required />
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

      <FieldGroup label="Milk Type">
        <Select name="milkTypeId" value={milkTypeId} onChange={(e) => setMilkTypeId(e.target.value)} required>
          {milkTypes.map((mt) => (
            <option key={mt.id} value={mt.id}>
              {mt.name}
            </option>
          ))}
        </Select>
      </FieldGroup>

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
          <Input type="number" step="0.1" min="0" max="100" name="fatPercentage" defaultValue={purchase.fat_percentage ?? ""} />
        </FieldGroup>
        <FieldGroup label="SNF %">
          <Input type="number" step="0.1" min="0" max="100" name="snfPercentage" defaultValue={purchase.snf_percentage ?? ""} />
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
        <Input name="notes" defaultValue={purchase.notes ?? ""} placeholder="Optional" />
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

export function EditPurchaseButton({
  purchase,
  farmers,
  milkTypes,
  shifts,
}: {
  purchase: EditablePurchase;
  farmers: FarmerOption[];
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
        <Modal title="Edit Milk Purchase" onClose={() => setIsOpen(false)}>
          <EditPurchaseForm
            purchase={purchase}
            farmers={farmers}
            milkTypes={milkTypes}
            shifts={shifts}
            onSaved={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
