import { allowDestroy, computeStartingHeat, payoutFromDiceCount } from "./dice";
import {
  costAddDie,
  costAddSideFor,
  costAddWinningFaceFor,
  costAutoBanker,
  costAutoRoller,
} from "./costs";
import { intervalMsForAutoRoll } from "./automation";
import type { Die } from "./types";

(function runSelfTests() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    console.assert(costAddDie(1) === 20, "costAddDie(1) should be 20");
    console.assert(costAddDie(2) === 40, "costAddDie(2) should be 40");
    console.assert(costAddDie(3) === 80, "costAddDie(3) should be 80");

    const d2: Die[] = [{ id: 1, sides: 2, winningFaces: 1 }];
    const twoD3: Die[] = [
      { id: 1, sides: 3, winningFaces: 1 },
      { id: 2, sides: 3, winningFaces: 1 },
    ];
    const d4: Die[] = [{ id: 1, sides: 4, winningFaces: 1 }];
    console.assert(Math.abs(computeStartingHeat(d2) - 1.0) < 1e-9, "d2 base heat should be 1.0");
    console.assert(Math.abs(computeStartingHeat(twoD3) - 1.2) < 1e-9, "two d3 base heat should be 1.2");
    console.assert(Math.abs(computeStartingHeat(d4) - 1.2) < 1e-9, "d4 base heat should be 1.2");

    console.assert(Math.abs(payoutFromDiceCount(1) - 1.0) < 1e-9, "1 die per-win should be 1.0");
    console.assert(Math.abs(payoutFromDiceCount(3) - 1.2) < 1e-9, "3 dice per-win should be 1.2");

    console.assert(allowDestroy(1) === false, "cannot destroy when only 1 die");
    console.assert(allowDestroy(2) === true, "can destroy when 2+ dice");

    console.assert(costAddWinningFaceFor(0) === 20, "win cost base should be 20");
    console.assert(costAddWinningFaceFor(2) > costAddWinningFaceFor(1), "win cost should increase with w");

    const int1 = intervalMsForAutoRoll(1)!;
    const int3 = intervalMsForAutoRoll(3)!;
    console.assert(int3 < int1, "auto interval should shrink as level grows");
    console.assert(intervalMsForAutoRoll(100)! >= 10, "auto interval should be clamped to >=10ms");

    console.assert(intervalMsForAutoRoll(0) === null, "interval should be null when level <= 0");
    console.assert(intervalMsForAutoRoll(-5) === null, "interval should be null when level <= 0");

    const mix: Die[] = [
      { id: 1, sides: 3, winningFaces: 1 },
      { id: 2, sides: 5, winningFaces: 1 },
    ];
    console.assert(Math.abs(computeStartingHeat(mix) - 1.4) < 1e-9, "d3+d5 base heat should be 1.4");

    console.assert(costAddSideFor(2) < costAddSideFor(3), "side cost should increase with sides");
    console.assert(costAutoRoller(2) > costAutoRoller(1), "auto roller cost should increase with level");
    console.assert(costAutoBanker() === 60, "auto banker cost should remain constant");
  } catch {
    // ignore in production builds
  }
})();
