"use client";

import { Input } from "@/components/ui/Field";

export function AmountField({
  amountFieldName,
  overriddenFieldName,
  totalAmount,
  isOverridden,
  onChange,
  onReset,
}: {
  amountFieldName: string;
  overriddenFieldName: string;
  totalAmount: number;
  isOverridden: boolean;
  onChange: (value: number) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <input type="hidden" name={overriddenFieldName} value={isOverridden ? "true" : "false"} />
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          name={amountFieldName}
          value={Number.isFinite(totalAmount) ? totalAmount : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          required
        />
        {isOverridden && (
          <span className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            Overridden
          </span>
        )}
      </div>
      {isOverridden && (
        <button type="button" onClick={onReset} className="mt-1 text-xs text-accent hover:underline">
          Reset to calculated
        </button>
      )}
    </div>
  );
}
