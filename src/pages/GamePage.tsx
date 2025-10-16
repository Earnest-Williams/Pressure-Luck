import { useEffect, useMemo } from "react";
import { Controls } from "../components/Controls";
import { DiceList } from "../components/DiceList";
import { Log } from "../components/Log";
import { AutomationPanel } from "../components/Panels/AutomationPanel";
import { StatsPanel } from "../components/Panels/StatsPanel";
import { UpgradesPanel } from "../components/Panels/UpgradesPanel";
import { useGame, useGameActions } from "../state/GameContext";
import {
  selectAddDieCost,
  selectAddSideCost,
  selectAddWinCost,
  selectAutoBankTarget,
  selectAutoBankerActive,
  selectAutoBankerCost,
  selectAutoBankerOwned,
  selectAutoRollInterval,
  selectAutoRollerActive,
  selectAutoRollerCost,
  selectBankDisplay,
  selectBustProbability,
  selectCanAddSide,
  selectCanAddWinningFace,
  selectCanDestroy,
  selectDice,
  selectDestroyedSides,
  selectExpectedSuccesses,
  selectHeatMultiplier,
  selectHeatRaw,
  selectInterestRatePerTick,
  selectLastRoll,
  selectLastRollMap,
  selectLog,
  selectPayoutPerSuccess,
  selectPot,
  selectPriceScale,
  selectSelectedDie,
  selectStartingHeat,
  selectStreak
} from "../state/selectors";

export const GamePage: React.FC = () => {
  const state = useGame();
  const actions = useGameActions();

  const dice = selectDice(state);
  const selectedDie = selectSelectedDie(state);
  const canDestroy = selectCanDestroy(state);
  const lastRoll = selectLastRoll(state);
  const lastRollMap = useMemo(() => selectLastRollMap(state), [lastRoll]);

  const addDieCost = selectAddDieCost(state);
  const addSideCost = selectAddSideCost(state);
  const addWinCost = selectAddWinCost(state);
  const autoRollerCost = selectAutoRollerCost(state);
  const autoBankerCost = selectAutoBankerCost(state);
  const autoRollInterval = selectAutoRollInterval(state);

  const bankDisplay = selectBankDisplay(state);
  const destroyedSides = selectDestroyedSides(state);
  const priceScale = selectPriceScale(state);
  const pot = selectPot(state);
  const heatRaw = selectHeatRaw(state);
  const heatMultiplier = selectHeatMultiplier(state);
  const streak = selectStreak(state);
  const startingHeat = selectStartingHeat(state);
  const payoutPerSuccess = selectPayoutPerSuccess(state);
  const bustProbability = selectBustProbability(state);
  const expectedSuccesses = selectExpectedSuccesses(state);
  const autoRollerActive = selectAutoRollerActive(state);
  const autoBankerOwned = selectAutoBankerOwned(state);
  const autoBankerActive = selectAutoBankerActive(state);
  const autoBankTarget = selectAutoBankTarget(state);
  const canAddSide = selectCanAddSide(state);
  const canAddWinningFace = selectCanAddWinningFace(state);
  const interestRate = selectInterestRatePerTick(state);
  const logEntries = selectLog(state);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        actions.roll();
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        actions.bank();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);

  useEffect(() => {
    if (!autoRollerActive || !autoRollInterval) return;
    const id = window.setInterval(() => actions.roll(true), autoRollInterval);
    return () => window.clearInterval(id);
  }, [actions, autoRollerActive, autoRollInterval]);

  useEffect(() => {
    if (destroyedSides <= 0) return;
    const id = window.setInterval(() => actions.applyInterest(), 1000);
    return () => window.clearInterval(id);
  }, [actions, destroyedSides, interestRate]);

  return (
    <div className="min-h-screen w-full text-slate-100 p-6 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Push Your Luck — Per-Die Upgrades + Automation</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={actions.reset}
              className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5"
            >
              Reset
            </button>
          </div>
        </header>

        <StatsPanel
          bank={bankDisplay}
          destroyedSides={destroyedSides}
          priceScale={priceScale}
          pot={pot}
          heatRaw={heatRaw}
          heatMultiplier={heatMultiplier}
          streak={streak}
          diceCount={dice.length}
          selectedDie={selectedDie ?? null}
          startingHeat={startingHeat}
          payoutPerSuccess={payoutPerSuccess}
          bustProbability={bustProbability}
          expectedSuccesses={expectedSuccesses}
        />

        <Controls onRoll={() => actions.roll(false)} onBank={actions.bank} />

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <h2 className="text-lg font-semibold mb-3">Dice &amp; Last Roll (click a die to select)</h2>
            <DiceList
              dice={dice}
              selectedId={selectedDie?.id ?? null}
              onSelect={actions.selectDie}
              canDestroy={canDestroy}
              lastRollById={lastRollMap}
              onDestroy={actions.destroyDie}
            />
          </div>

          <UpgradesPanel
            diceCount={dice.length}
            priceDie={addDieCost}
            bank={state.bank}
            onBuyDie={() => actions.buyDie(addDieCost)}
            selectedDie={selectedDie ?? null}
            canAddSide={canAddSide}
            priceSide={addSideCost}
            onAddSide={() => selectedDie && addSideCost != null && actions.addSide(selectedDie.id, addSideCost)}
            canAddWinningFace={canAddWinningFace}
            priceWin={addWinCost}
            onAddWinningFace={() =>
              selectedDie && addWinCost != null && actions.addWinningFace(selectedDie.id, addWinCost)
            }
          />

          <AutomationPanel
            autoRollerLevel={state.autoRollerLevel}
            autoRollInterval={autoRollInterval}
            priceAutoRoller={autoRollerCost}
            bank={state.bank}
            onBuyOrUpgradeAutoRoller={() => actions.buyOrUpgradeAutoRoller(autoRollerCost)}
            onToggleAutoRoller={actions.toggleAutoRoller}
            autoRollerActive={autoRollerActive}
            autoBankerOwned={autoBankerOwned}
            autoBankerActive={autoBankerActive}
            priceAutoBanker={autoBankerCost}
            onBuyAutoBanker={() => autoBankerCost != null && actions.buyAutoBanker(autoBankerCost)}
            onToggleAutoBanker={actions.toggleAutoBanker}
            autoBankTarget={autoBankTarget}
            onSetAutoBankTarget={actions.setAutoBankTarget}
          />
        </div>

        <Log entries={logEntries} />

        <div className="text-xs text-white/60 space-y-2">
          <p>
            Rules: Roll your set of dice. If at least one die shows a winning face, you add to the pot and may roll again or bank.
            If none win, you bust and lose the pot.
          </p>
          <p>
            You can add dice (first costs 20, each next doubles), and you can upgrade sides and winning faces per selected die (up to
            N−1 winning).
          </p>
          <p>
            Starting heat adds +0.1 per side above 2 on each die; streak adds +0.05 per success. Only whole-number heat levels affect
            payout (×2, ×3, …). Base per-win payout increases by +0.1 for each additional die.
          </p>
          <p>
            Auto Roller: buy/upgrade speed; Auto Banker: buy and set target. Destroying a die halves all current buy prices and adds
            +0.1%/tick interest per side of the destroyed die. Inflation: buying anything other than Add a Die increases future Add a
            Die prices by +25%.
          </p>
        </div>
      </div>
    </div>
  );
};
