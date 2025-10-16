import { Die } from "../types/dice";

export const computeStartingHeat = (dice: Die[]) =>
  1 + 0.1 * dice.reduce((a, d) => a + Math.max(0, d.sides - 2), 0);

export const payoutFromDiceCount = (n: number) => 1 + 0.1 * Math.max(0, n - 1);
