import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer
} from "react";
import { clamp } from "../lib/format";
import { Die, RollResult } from "../types/dice";
import {
  GameAction,
  GameState,
  gameReducer,
  initialGameState
} from "./gameReducer";

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameDispatchContext = createContext<React.Dispatch<GameAction> | undefined>(undefined);

const rollDice = (dice: Die[]): RollResult[] =>
  dice.map((die) => {
    const value = 1 + Math.floor(Math.random() * die.sides);
    return { id: die.id, value, win: value <= die.winningFaces };
  });

export const GameProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialGameState);
  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGame must be used within GameProvider");
  }
  return ctx;
};

export const useGameDispatch = () => {
  const ctx = useContext(GameDispatchContext);
  if (!ctx) {
    throw new Error("useGameDispatch must be used within GameProvider");
  }
  return ctx;
};

export const useGameActions = () => {
  const state = useGame();
  const dispatch = useGameDispatch();

  const roll = useCallback(
    (fromAuto = false) => {
      const results = rollDice(state.dice);
      dispatch({ type: "ROLL", results, fromAuto });
    },
    [dispatch, state.dice]
  );

  const bank = useCallback(() => {
    dispatch({ type: "BANK" });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  const buyDie = useCallback(
    (cost: number) => {
      dispatch({ type: "BUY_DIE", cost });
    },
    [dispatch]
  );

  const addSide = useCallback(
    (dieId: number, cost: number) => {
      dispatch({ type: "ADD_SIDE", dieId, cost });
    },
    [dispatch]
  );

  const addWinningFace = useCallback(
    (dieId: number, cost: number) => {
      dispatch({ type: "ADD_WIN_FACE", dieId, cost });
    },
    [dispatch]
  );

  const toggleAutoRoller = useCallback(() => {
    dispatch({ type: "TOGGLE_AUTO_ROLLER" });
  }, [dispatch]);

  const buyOrUpgradeAutoRoller = useCallback(
    (cost: number) => {
      dispatch({ type: "BUY_OR_UPGRADE_AUTO_ROLLER", cost });
    },
    [dispatch]
  );

  const buyAutoBanker = useCallback(
    (cost: number) => {
      dispatch({ type: "BUY_AUTO_BANKER", cost });
    },
    [dispatch]
  );

  const toggleAutoBanker = useCallback(() => {
    dispatch({ type: "TOGGLE_AUTO_BANKER" });
  }, [dispatch]);

  const destroyDie = useCallback(
    (dieId: number) => {
      dispatch({ type: "DESTROY_DIE", dieId });
    },
    [dispatch]
  );

  const setAutoBankTarget = useCallback(
    (value: number) => {
      const clamped = clamp(value, 1, 1_000_000);
      dispatch({ type: "SET_AUTO_BANK_TARGET", target: clamped });
    },
    [dispatch]
  );

  const selectDie = useCallback(
    (dieId: number) => {
      dispatch({ type: "SELECT_DIE", dieId });
    },
    [dispatch]
  );

  const applyInterest = useCallback(() => {
    dispatch({ type: "APPLY_INTEREST" });
  }, [dispatch]);

  return useMemo(
    () => ({
      roll,
      bank,
      reset,
      buyDie,
      addSide,
      addWinningFace,
      toggleAutoRoller,
      buyOrUpgradeAutoRoller,
      buyAutoBanker,
      toggleAutoBanker,
      destroyDie,
      setAutoBankTarget,
      selectDie,
      applyInterest
    }),
    [
      roll,
      bank,
      reset,
      buyDie,
      addSide,
      addWinningFace,
      toggleAutoRoller,
      buyOrUpgradeAutoRoller,
      buyAutoBanker,
      toggleAutoBanker,
      destroyDie,
      setAutoBankTarget,
      selectDie,
      applyInterest
    ]
  );
};
