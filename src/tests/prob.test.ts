import { describe, expect, it } from "vitest";
import { bustProb, expectedSuccesses, intervalMsForAutoRoll } from "../lib/prob";
import { Die } from "../types/dice";

describe("probability helpers", () => {
  const dice: Die[] = [
    { id: 1, sides: 3, winningFaces: 1 },
    { id: 2, sides: 5, winningFaces: 1 }
  ];

  it("computes bust probability", () => {
    expect(bustProb(dice)).toBeCloseTo((1 - 1 / 3) * (1 - 1 / 5));
  });

  it("computes expected successes", () => {
    expect(expectedSuccesses(dice)).toBeCloseTo(1 / 3 + 1 / 5);
  });

  it("derives auto-roll interval", () => {
    expect(intervalMsForAutoRoll(0)).toBeNull();
    const level1 = intervalMsForAutoRoll(1);
    const level3 = intervalMsForAutoRoll(3);
    expect(level1).not.toBeNull();
    expect(level3).not.toBeNull();
    expect(level3!).toBeLessThan(level1!);
    expect(intervalMsForAutoRoll(100)).toBeGreaterThanOrEqual(10);
  });
});
