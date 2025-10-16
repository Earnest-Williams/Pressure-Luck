import { describe, expect, it } from "vitest";
import { computeStartingHeat, payoutFromDiceCount } from "../lib/heat";
import { Die } from "../types/dice";

describe("heat calculations", () => {
  it("computes base heat based on sides", () => {
    const d2: Die[] = [{ id: 1, sides: 2, winningFaces: 1 }];
    const twoD3: Die[] = [
      { id: 1, sides: 3, winningFaces: 1 },
      { id: 2, sides: 3, winningFaces: 1 }
    ];
    const d4: Die[] = [{ id: 1, sides: 4, winningFaces: 1 }];
    expect(computeStartingHeat(d2)).toBeCloseTo(1.0);
    expect(computeStartingHeat(twoD3)).toBeCloseTo(1.2);
    expect(computeStartingHeat(d4)).toBeCloseTo(1.2);
  });

  it("computes payout scaling with dice count", () => {
    expect(payoutFromDiceCount(1)).toBeCloseTo(1.0);
    expect(payoutFromDiceCount(3)).toBeCloseTo(1.2);
  });
});
