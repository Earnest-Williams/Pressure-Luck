import { describe, expect, it } from "vitest";
import { costAddDie, costAddSideFor, costAddWinningFaceFor, costAutoBanker, costAutoRoller } from "../lib/econ";

describe("economics helpers", () => {
  it("scales add-die cost exponentially", () => {
    expect(costAddDie(1)).toBe(20);
    expect(costAddDie(2)).toBe(40);
    expect(costAddDie(3)).toBe(80);
  });

  it("increases side cost with sides", () => {
    expect(costAddSideFor(2)).toBeLessThan(costAddSideFor(3));
  });

  it("increases winning face cost with wins", () => {
    expect(costAddWinningFaceFor(0)).toBe(20);
    expect(costAddWinningFaceFor(2)).toBeGreaterThan(costAddWinningFaceFor(1));
  });

  it("computes automation costs", () => {
    expect(costAutoRoller(0)).toBe(50);
    expect(costAutoRoller(2)).toBeGreaterThan(costAutoRoller(1));
    expect(costAutoBanker()).toBe(60);
  });
});
