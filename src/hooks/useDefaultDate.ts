"use client";

import { useState } from "react";

function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** Rule #4: every date field defaults to today, but stays freely editable. */
export function useDefaultDate() {
  return useState<string>(todayIso());
}
