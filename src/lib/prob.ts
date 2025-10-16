import { Die } from "../types/dice";

export const bustProb = (dice: Die[]) =>
  dice.reduce((acc, d) => acc * (1 - d.winningFaces / d.sides), 1);

export const expectedSuccesses = (dice: Die[]) =>
  dice.reduce((acc, d) => acc + d.winningFaces / d.sides, 0);

export const intervalMsForAutoRoll = (level: number) =>
  level <= 0 ? null : Math.max(10, Math.round(2000 * 0.75 ** (level - 1)));
