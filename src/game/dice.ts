import type { Die, RollResult } from "./types";

export function computeStartingHeat(dice: Die[]) {
  const units = dice.reduce((acc, d) => acc + Math.max(0, d.sides - 2), 0);
  return 1 + 0.1 * units;
}

export function payoutFromDiceCount(nDice: number) {
  return 1 + 0.1 * Math.max(0, nDice - 1);
}

export function allowDestroy(nDice: number) {
  return nDice > 1;
}

export function rollDice(dice: Die[]) {
  const results: RollResult[] = [];
  let successes = 0;

  for (const d of dice) {
    const value = 1 + Math.floor(Math.random() * d.sides);
    const win = value <= d.winningFaces;
    if (win) successes++;
    results.push({ id: d.id, value, win });
  }

  return { results, successes };
}
