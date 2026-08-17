import { describe, expect, it } from "vitest";
import { buildAccountSummary } from "./ledger";

describe("buildAccountSummary", () => {
  it("is UNPAID when nothing has been paid", () => {
    const summary = buildAccountSummary(10000, 0);
    expect(summary.status).toBe("UNPAID");
    expect(summary.remaining).toBe(10000);
    expect(summary.advance).toBe(0);
  });

  it("is PARTIALLY_PAID when paid is between 0 and the milk value", () => {
    const summary = buildAccountSummary(10000, 6000);
    expect(summary.status).toBe("PARTIALLY_PAID");
    expect(summary.remaining).toBe(4000);
  });

  it("is PAID with zero remaining when paid exactly equals the milk value", () => {
    const summary = buildAccountSummary(10000, 10000);
    expect(summary.status).toBe("PAID");
    expect(summary.remaining).toBe(0);
    expect(summary.advance).toBe(0);
  });

  it("is PAID with an advance when paid exceeds the milk value", () => {
    const summary = buildAccountSummary(18500, 20000);
    expect(summary.status).toBe("PAID");
    expect(summary.remaining).toBe(0);
    expect(summary.advance).toBe(1500);
  });
});
