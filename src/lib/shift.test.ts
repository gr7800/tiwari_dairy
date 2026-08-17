import { describe, expect, it } from "vitest";
import { resolveCurrentShift, type ShiftWindow } from "./shift";

const shifts: ShiftWindow[] = [
  { id: "morning", name: "Morning", start_time: "04:00", end_time: "12:00", sort_order: 0 },
  { id: "evening", name: "Evening", start_time: "12:00", end_time: "22:00", sort_order: 1 },
];

describe("resolveCurrentShift", () => {
  it("picks Morning at the start of its window", () => {
    expect(resolveCurrentShift(shifts, new Date(2026, 0, 1, 4, 0))?.id).toBe("morning");
  });

  it("picks Morning just before the boundary", () => {
    expect(resolveCurrentShift(shifts, new Date(2026, 0, 1, 11, 59))?.id).toBe("morning");
  });

  it("picks Evening exactly at the boundary", () => {
    expect(resolveCurrentShift(shifts, new Date(2026, 0, 1, 12, 0))?.id).toBe("evening");
  });

  it("falls back to the first shift outside every window", () => {
    const nightGap: ShiftWindow[] = [
      { id: "morning", name: "Morning", start_time: "06:00", end_time: "10:00", sort_order: 0 },
    ];
    expect(resolveCurrentShift(nightGap, new Date(2026, 0, 1, 2, 0))?.id).toBe("morning");
  });

  it("handles a window that wraps past midnight", () => {
    const wrapping: ShiftWindow[] = [
      { id: "night", name: "Night", start_time: "22:00", end_time: "04:00", sort_order: 0 },
    ];
    expect(resolveCurrentShift(wrapping, new Date(2026, 0, 1, 23, 0))?.id).toBe("night");
    expect(resolveCurrentShift(wrapping, new Date(2026, 0, 1, 1, 0))?.id).toBe("night");
  });

  it("returns null when no shifts are configured", () => {
    expect(resolveCurrentShift([], new Date())).toBeNull();
  });
});
