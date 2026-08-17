"use client";

import { useEffect, useState } from "react";
import { calculateAmount } from "@/lib/amount";

/**
 * Rule #5: total = quantity * rate by default, but once the user types
 * directly into the total field it stops recalculating on every quantity/rate
 * change. Reset returns to the live calculation.
 *
 * `initial` seeds the override state from an existing record (edit forms) —
 * without it, both default as if this were a brand-new entry.
 */
export function useCalculatedAmount(
  quantity: number,
  rate: number,
  initial?: { isOverridden?: boolean; totalAmount?: number }
) {
  const [isOverridden, setIsOverridden] = useState(initial?.isOverridden ?? false);
  const [totalAmount, setTotalAmount] = useState<number>(
    () => initial?.totalAmount ?? calculateAmount(quantity, rate)
  );

  useEffect(() => {
    if (!isOverridden) {
      setTotalAmount(calculateAmount(quantity, rate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, rate, isOverridden]);

  function overrideTotal(value: number) {
    setIsOverridden(true);
    setTotalAmount(value);
  }

  function resetToCalculated() {
    setIsOverridden(false);
    setTotalAmount(calculateAmount(quantity, rate));
  }

  return {
    totalAmount,
    isOverridden,
    overrideTotal,
    resetToCalculated,
    calculatedAmount: calculateAmount(quantity, rate),
  };
}
