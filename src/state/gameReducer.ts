import { computeStartingHeat, payoutFromDiceCount } from "../lib/heat";
import { Die, RollResult } from "../types/dice";

export interface GameState {
  bank: number;
  pot: number;
  streak: number;
  dice: Die[];
  selectedDieId: number | null;
  lastRoll: RollResult[];
  log: string[];
  addDieInflation: number;
  globalPriceScale: number;
  destroyedSides: number;
  autoRollerLevel: number;
  autoRollerActive: boolean;
  autoBankerOwned: boolean;
  autoBankerActive: boolean;
  autoBankTarget: number;
}

export const MAX_LOG_ENTRIES = 8;

const createInitialDice = (): Die[] => [{ id: 1, sides: 2, winningFaces: 1 }];

export const initialGameState = (): GameState => ({
  bank: 0,
  pot: 0,
  streak: 0,
  dice: createInitialDice(),
  selectedDieId: 1,
  lastRoll: [],
  log: ["Ready. Press R to roll, B to bank."],
  addDieInflation: 1,
  globalPriceScale: 1,
  destroyedSides: 0,
  autoRollerLevel: 0,
  autoRollerActive: false,
  autoBankerOwned: false,
  autoBankerActive: false,
  autoBankTarget: 20
});

const pushLog = (log: string[], entry: string) =>
  [entry, ...log].slice(0, MAX_LOG_ENTRIES);

const nextDieId = (dice: Die[]) => dice.reduce((max, d) => Math.max(max, d.id), 0) + 1;

const selectHeatMultiplierFromState = (state: GameState) => {
  const startingHeat = computeStartingHeat(state.dice);
  const raw = startingHeat + 0.05 * state.streak;
  return Math.max(1, Math.floor(raw));
};

const selectPayoutPerSuccessFromState = (state: GameState) =>
  payoutFromDiceCount(state.dice.length);

export type GameAction =
  | { type: "ROLL"; results: RollResult[]; fromAuto?: boolean }
  | { type: "BANK" }
  | { type: "RESET" }
  | { type: "BUY_DIE"; cost: number }
  | { type: "ADD_SIDE"; dieId: number; cost: number }
  | { type: "ADD_WIN_FACE"; dieId: number; cost: number }
  | { type: "TOGGLE_AUTO_ROLLER" }
  | { type: "BUY_OR_UPGRADE_AUTO_ROLLER"; cost: number }
  | { type: "BUY_AUTO_BANKER"; cost: number }
  | { type: "TOGGLE_AUTO_BANKER" }
  | { type: "DESTROY_DIE"; dieId: number }
  | { type: "SET_AUTO_BANK_TARGET"; target: number }
  | { type: "SELECT_DIE"; dieId: number }
  | { type: "APPLY_INTEREST" };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "ROLL": {
      const successes = action.results.filter((r) => r.win).length;
      if (successes === 0) {
        return {
          ...state,
          lastRoll: action.results,
          pot: 0,
          streak: 0,
          log: state.pot > 0 ? pushLog(state.log, `Bust. Lost pot of ${state.pot}.`) : state.log
        };
      }

      const payoutPerSuccess = selectPayoutPerSuccessFromState(state);
      const heatMultiplier = selectHeatMultiplierFromState(state);
      const gain = Math.round(successes * payoutPerSuccess * heatMultiplier);
      const newPot = state.pot + gain;

      if (state.autoBankerOwned && state.autoBankerActive && newPot >= state.autoBankTarget) {
        return {
          ...state,
          lastRoll: action.results,
          bank: state.bank + newPot,
          pot: 0,
          streak: 0,
          log: pushLog(
            state.log,
            `Auto-banked ${newPot} (target ${state.autoBankTarget}+).${action.fromAuto ? " [auto-roll]" : ""}`
          )
        };
      }

      return {
        ...state,
        lastRoll: action.results,
        pot: newPot,
        streak: state.streak + 1,
        log: pushLog(
          state.log,
          `Success: ${successes}/${state.dice.length} wins. +${gain} to pot.${action.fromAuto ? " [auto-roll]" : ""}`
        )
      };
    }
    case "BANK": {
      if (state.pot <= 0) {
        return {
          ...state,
          log: pushLog(state.log, "Nothing to bank.")
        };
      }
      return {
        ...state,
        bank: state.bank + state.pot,
        pot: 0,
        streak: 0,
        log: pushLog(state.log, `Banked ${state.pot}.`)
      };
    }
    case "RESET":
      return initialGameState();
    case "BUY_DIE": {
      if (state.bank < action.cost) {
        return {
          ...state,
          log: pushLog(state.log, "Insufficient funds for die.")
        };
      }
      const newDie: Die = { id: nextDieId(state.dice), sides: 2, winningFaces: 1 };
      const newDice = [...state.dice, newDie];
      return {
        ...state,
        bank: state.bank - action.cost,
        dice: newDice,
        selectedDieId: newDie.id,
        log: pushLog(state.log, `Bought +1 die for ${action.cost}. New die starts as d2 with 1 winning face.`)
      };
    }
    case "ADD_SIDE": {
      const die = state.dice.find((d) => d.id === action.dieId);
      if (!die) {
        return state;
      }
      if (state.bank < action.cost) {
        return {
          ...state,
          log: pushLog(state.log, "Insufficient funds for side.")
        };
      }
      const updatedDice = state.dice.map((d) =>
        d.id === die.id
          ? { ...d, sides: d.sides + 1, winningFaces: Math.min(d.winningFaces, d.sides + 1 - 1) }
          : d
      );
      return {
        ...state,
        bank: state.bank - action.cost,
        dice: updatedDice,
        addDieInflation: state.addDieInflation * 1.25,
        log: pushLog(state.log, `Die #${die.id}: added a side for ${action.cost}. Now d${die.sides + 1}.`)
      };
    }
    case "ADD_WIN_FACE": {
      const die = state.dice.find((d) => d.id === action.dieId);
      if (!die) {
        return state;
      }
      if (state.bank < action.cost) {
        return {
          ...state,
          log: pushLog(state.log, "Insufficient funds for winning face.")
        };
      }
      const updatedDice = state.dice.map((d) =>
        d.id === die.id
          ? { ...d, winningFaces: Math.min(d.winningFaces + 1, d.sides - 1) }
          : d
      );
      return {
        ...state,
        bank: state.bank - action.cost,
        dice: updatedDice,
        addDieInflation: state.addDieInflation * 1.25,
        log: pushLog(
          state.log,
          `Die #${die.id}: added a winning face for ${action.cost}. Now ${Math.min(
            die.winningFaces + 1,
            die.sides - 1
          )}/${die.sides} win.`
        )
      };
    }
    case "TOGGLE_AUTO_ROLLER": {
      if (state.autoRollerLevel <= 0) {
        return {
          ...state,
          log: pushLog(state.log, "Buy the Auto Roller first.")
        };
      }
      const nextActive = !state.autoRollerActive;
      return {
        ...state,
        autoRollerActive: nextActive,
        log: pushLog(state.log, `Auto Roller ${nextActive ? "started" : "stopped"}.`)
      };
    }
    case "BUY_OR_UPGRADE_AUTO_ROLLER": {
      if (state.bank < action.cost) {
        return {
          ...state,
          log: pushLog(state.log, "Insufficient funds for Auto Roller.")
        };
      }
      const previouslyOwned = state.autoRollerLevel > 0;
      return {
        ...state,
        bank: state.bank - action.cost,
        autoRollerLevel: Math.max(1, state.autoRollerLevel + 1),
        addDieInflation: state.addDieInflation * 1.25,
        log: pushLog(
          state.log,
          `${previouslyOwned ? "Upgraded" : "Bought"} Auto Roller for ${action.cost}.`
        )
      };
    }
    case "BUY_AUTO_BANKER": {
      if (state.autoBankerOwned) {
        return state;
      }
      if (state.bank < action.cost) {
        return {
          ...state,
          log: pushLog(state.log, "Insufficient funds for Auto Banker.")
        };
      }
      return {
        ...state,
        bank: state.bank - action.cost,
        autoBankerOwned: true,
        addDieInflation: state.addDieInflation * 1.25,
        log: pushLog(state.log, `Bought Auto Banker for ${action.cost}.`)
      };
    }
    case "TOGGLE_AUTO_BANKER": {
      if (!state.autoBankerOwned) {
        return {
          ...state,
          log: pushLog(state.log, "Buy the Auto Banker first.")
        };
      }
      const nextActive = !state.autoBankerActive;
      return {
        ...state,
        autoBankerActive: nextActive,
        log: pushLog(
          state.log,
          `Auto Banker ${nextActive ? "enabled" : "disabled"}. Target ${state.autoBankTarget}.`
        )
      };
    }
    case "DESTROY_DIE": {
      if (state.dice.length <= 1) {
        return {
          ...state,
          log: pushLog(state.log, "Cannot destroy your last die.")
        };
      }
      const die = state.dice.find((d) => d.id === action.dieId);
      if (!die) {
        return state;
      }
      const remaining = state.dice.filter((d) => d.id !== die.id);
      return {
        ...state,
        dice: remaining,
        selectedDieId: remaining.length ? remaining[0].id : null,
        globalPriceScale: Math.max(0.0001, state.globalPriceScale * 0.5),
        destroyedSides: state.destroyedSides + die.sides,
        log: pushLog(
          state.log,
          `Destroyed die #${die.id} (d${die.sides}). Prices halved; interest +${(die.sides * 0.1).toFixed(1)}%/tick.`
        )
      };
    }
    case "SET_AUTO_BANK_TARGET": {
      return {
        ...state,
        autoBankTarget: action.target
      };
    }
    case "SELECT_DIE": {
      return {
        ...state,
        selectedDieId: action.dieId
      };
    }
    case "APPLY_INTEREST": {
      if (state.destroyedSides <= 0 || state.bank <= 0) {
        return state;
      }
      const multiplier = 1 + state.destroyedSides * 0.001;
      return {
        ...state,
        bank: state.bank * multiplier
      };
    }
    default:
      return state;
  }
};
