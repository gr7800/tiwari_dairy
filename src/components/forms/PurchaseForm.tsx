"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createPurchase, type PurchaseActionState } from "@/lib/actions/purchases";
import { useActionToast } from "@/hooks/useActionToast";
import { useDefaultDate } from "@/hooks/useDefaultDate";
import { useAutoShift } from "@/hooks/useAutoShift";
import { useCalculatedAmount } from "@/hooks/useCalculatedAmount";
import { FarmerCombobox, type FarmerOption } from "@/components/ui/FarmerCombobox";
import { AmountField } from "@/components/ui/AmountField";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import type { ShiftWindow } from "@/lib/shift";

const initialState: PurchaseActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save Purchase"}
    </Button>
  );
}

export function PurchaseForm({
  farmers,
  milkTypes,
  shifts,
}: {
  farmers: FarmerOption[];
  milkTypes: { id: string; name: string }[];
  shifts: ShiftWindow[];
}) {
  const [state, formAction] = useFormState(createPurchase, initialState);
  useActionToast(state, "Purchase saved");
  const [date, setDate] = useDefaultDate();
  const [shiftId, setShiftId] = useAutoShift(shifts);
  const [milkTypeId, setMilkTypeId] = useState(milkTypes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(0);
  const [rate, setRate] = useState(0);
  const { totalAmount, isOverridden, overrideTotal, resetToCalculated } = useCalculatedAmount(quantity, rate);

  return (
    <form action={formAction} className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Add Milk Purchase</h2>

      <FieldGroup label="Farmer">
        <FarmerCombobox farmers={farmers} name="farmerId" required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup label="Date">
          <Input type="date" name="purchaseDate" value={date} onChange={(e) => setDate(e.target.value)} required />
        </FieldGroup>
        <FieldGroup label="Shift" hint={<span className="text-xs text-slate-400 dark:text-slate-500">auto-selected</span>}>
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
          <Input type="number" step="0.1" min="0" max="100" name="fatPercentage" />
        </FieldGroup>
        <FieldGroup label="SNF %">
          <Input type="number" step="0.1" min="0" max="100" name="snfPercentage" />
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
        <Input name="notes" placeholder="Optional" />
      </FieldGroup>

      <SubmitButton />
    </form>
  );
}
