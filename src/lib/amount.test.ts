import { describe, expect, it } from "vitest";
import { calculateAmount } from "./amount";

describe("calculateAmount", () => {
  it("multiplies quantity by rate", () => {
    expect(calculateAmount(12.5, 48.5)).toBe(606.25);
  });

  it("rounds to 2 decimal places", () => {
    expect(calculateAmount(3, 33.333)).toBe(100);
  });
});
