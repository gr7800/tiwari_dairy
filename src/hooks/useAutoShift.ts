"use client";

import { useState } from "react";
import { resolveCurrentShift, type ShiftWindow } from "@/lib/shift";

/** Rule #3: shift defaults to whatever the current time resolves to, but stays manually changeable. */
export function useAutoShift(shifts: ShiftWindow[]) {
  return useState<string>(() => resolveCurrentShift(shifts, new Date())?.id ?? shifts[0]?.id ?? "");
}
