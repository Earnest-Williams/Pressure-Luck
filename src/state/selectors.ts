import { computeStartingHeat, payoutFromDiceCount } from "../lib/heat";
import { costAddDie, costAddSideFor, costAddWinningFaceFor, costAutoBanker, costAutoRoller } from "../lib/econ";
import { toFixed } from "../lib/format";
import { bustProb, expectedSuccesses, intervalMsForAutoRoll } from "../lib/prob";
import { Die } from "../types/dice";
import { GameState } from "./gameReducer";

export const selectDice = (state: GameState) => state.dice;
export const selectSelectedDie = (state: GameState) =>
  state.dice.find((d) => d.id === state.selectedDieId) ?? state.dice[0] ?? null;

export const selectStartingHeat = (state: GameState) => computeStartingHeat(state.dice);
export const selectHeatRaw = (state: GameState) => selectStartingHeat(state) + 0.05 * state.streak;
export const selectHeatMultiplier = (state: GameState) => Math.max(1, Math.floor(selectHeatRaw(state)));
export const selectPayoutPerSuccess = (state: GameState) => payoutFromDiceCount(state.dice.length);
export const selectBustProbability = (state: GameState) => bustProb(state.dice);
export const selectExpectedSuccesses = (state: GameState) => expectedSuccesses(state.dice);
export const selectCanDestroy = (state: GameState) => state.dice.length > 1;

const applyPriceScale = (state: GameState, price: number) =>
  Math.max(1, Math.round(price * state.globalPriceScale));

export const selectAddDieCost = (state: GameState) =>
  Math.max(1, Math.round(costAddDie(state.dice.length) * state.addDieInflation * state.globalPriceScale));

export const selectAddSideCost = (state: GameState) => {
  const die = selectSelectedDie(state);
  if (!die) return null;
  return applyPriceScale(state, costAddSideFor(die.sides));
};

export const selectAddWinCost = (state: GameState) => {
  const die = selectSelectedDie(state);
  if (!die) return null;
  return applyPriceScale(state, costAddWinningFaceFor(die.winningFaces));
};

export const selectAutoRollerCost = (state: GameState) => applyPriceScale(state, costAutoRoller(state.autoRollerLevel));
export const selectAutoBankerCost = (state: GameState) =>
  state.autoBankerOwned ? null : applyPriceScale(state, costAutoBanker());

export const selectAutoRollInterval = (state: GameState) => intervalMsForAutoRoll(state.autoRollerLevel);

export const selectCanAddSide = (state: GameState) => {
  const die = selectSelectedDie(state);
  if (!die) return false;
  return die.sides < 20;
};

export const selectCanAddWinningFace = (state: GameState) => {
  const die = selectSelectedDie(state);
  if (!die) return false;
  return die.winningFaces < die.sides - 1;
};

export const selectInterestRatePerTick = (state: GameState) => state.destroyedSides * 0.1;

export const formatHeat = (state: GameState) => `x${toFixed(selectHeatRaw(state), 2)}`;

export const selectLastRollMap = (state: GameState) => {
  const map = new Map<number, { value: number; win: boolean }>();
  state.lastRoll.forEach((r) => map.set(r.id, { value: r.value, win: r.win }));
  return map;
};

export const selectLog = (state: GameState) => state.log;

export const selectBankDisplay = (state: GameState) => Math.floor(state.bank);

export const selectPriceScale = (state: GameState) => state.globalPriceScale;

export const selectDestroyedSides = (state: GameState) => state.destroyedSides;

export const selectAutoRollerActive = (state: GameState) => state.autoRollerActive;
export const selectAutoBankerActive = (state: GameState) => state.autoBankerActive;
export const selectAutoBankerOwned = (state: GameState) => state.autoBankerOwned;

export const selectAutoBankTarget = (state: GameState) => state.autoBankTarget;

export const selectStreak = (state: GameState) => state.streak;
export const selectPot = (state: GameState) => state.pot;
export const selectLastRoll = (state: GameState) => state.lastRoll;

export const selectDestroyMessage = (die: Die) =>
  `Destroyed die #${die.id} (d${die.sides}). Prices halved; interest +${(die.sides * 0.1).toFixed(1)}%/tick.`;
