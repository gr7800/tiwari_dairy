export interface ShiftWindow {
  id: string;
  name: string;
  start_time: string; // "HH:MM" 24-hour
  end_time: string; // "HH:MM" 24-hour
  sort_order: number;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isWithinWindow(nowMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes <= endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  // window wraps past midnight, e.g. 22:00 -> 04:00
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

/**
 * Resolves which configured shift the current time falls into.
 * Falls back to the first shift (by sort_order) if none of the configured
 * windows cover the current time, so the form always has a sensible default.
 */
export function resolveCurrentShift(shifts: ShiftWindow[], now: Date): ShiftWindow | null {
  if (shifts.length === 0) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const sorted = [...shifts].sort((a, b) => a.sort_order - b.sort_order);

  const match = sorted.find((shift) =>
    isWithinWindow(nowMinutes, toMinutes(shift.start_time), toMinutes(shift.end_time))
  );

  return match ?? sorted[0];
}
