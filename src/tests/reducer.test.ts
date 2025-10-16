import { describe, expect, it } from "vitest";
import { RollResult } from "../types/dice";
import { gameReducer, initialGameState } from "../state/gameReducer";

describe("game reducer", () => {
  it("handles busting on roll", () => {
    const start = { ...initialGameState(), pot: 10, streak: 3 };
    const results: RollResult[] = start.dice.map((die) => ({ id: die.id, value: die.sides, win: false }));
    const next = gameReducer(start, { type: "ROLL", results });
    expect(next.pot).toBe(0);
    expect(next.streak).toBe(0);
    expect(next.log[0]).toContain("Bust");
  });

  it("adds pot on successful roll", () => {
    const start = initialGameState();
    const results: RollResult[] = [{ id: 1, value: 1, win: true }];
    const next = gameReducer(start, { type: "ROLL", results });
    expect(next.pot).toBeGreaterThan(0);
    expect(next.streak).toBe(1);
    expect(next.lastRoll).toHaveLength(1);
  });

  it("auto-banks when target met", () => {
    const start = {
      ...initialGameState(),
      autoBankerOwned: true,
      autoBankerActive: true,
      autoBankTarget: 1
    };
    const results: RollResult[] = [{ id: 1, value: 1, win: true }];
    const next = gameReducer(start, { type: "ROLL", results, fromAuto: true });
    expect(next.pot).toBe(0);
    expect(next.bank).toBeGreaterThan(0);
    expect(next.log[0]).toContain("Auto-banked");
  });

  it("destroys a die and halves prices", () => {
    const start = {
      ...initialGameState(),
      dice: [
        { id: 1, sides: 2, winningFaces: 1 },
        { id: 2, sides: 4, winningFaces: 1 }
      ],
      selectedDieId: 2,
      globalPriceScale: 1
    };
    const next = gameReducer(start, { type: "DESTROY_DIE", dieId: 2 });
    expect(next.dice).toHaveLength(1);
    expect(next.globalPriceScale).toBeCloseTo(0.5);
    expect(next.destroyedSides).toBe(4);
    expect(next.selectedDieId).toBe(1);
  });

  it("banks current pot", () => {
    const start = { ...initialGameState(), pot: 15 };
    const next = gameReducer(start, { type: "BANK" });
    expect(next.bank).toBe(15);
    expect(next.pot).toBe(0);
    expect(next.streak).toBe(0);
  });
});
