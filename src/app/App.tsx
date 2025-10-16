import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import Card from "./components/Card";
import DiceIcon from "./components/DiceIcon";
import {
  allowDestroy,
  computeStartingHeat,
  costAddDie,
  costAddSideFor,
  costAddWinningFaceFor,
  costAutoBanker,
  costAutoRoller,
  intervalMsForAutoRoll,
  payoutFromDiceCount,
  rollDice,
  type Die,
  type RollResult,
} from "../game";

function toFixed(num: number, digits = 2) {
  return Number.isFinite(num) ? num.toFixed(digits) : "—";
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

const STARTING_DIE: Die = { id: 1, sides: 2, winningFaces: 1 };
const INITIAL_LOG = "Ready. Press R to roll, B to bank.";

const App: React.FC = () => {
  const [bank, setBank] = useState(0);
  const [pot, setPot] = useState(0);
  const [streak, setStreak] = useState(0);

  const [dice, setDice] = useState<Die[]>([{ ...STARTING_DIE }]);
  const [selectedDieId, setSelectedDieId] = useState<number>(STARTING_DIE.id);
  const [lastRoll, setLastRoll] = useState<RollResult[]>([]);
  const [log, setLog] = useState<string[]>([INITIAL_LOG]);

  const payoutPerSuccess = useMemo(() => payoutFromDiceCount(dice.length), [dice.length]);
  const startingHeat = useMemo(() => computeStartingHeat(dice), [dice]);
  const heatRaw = startingHeat + 0.05 * streak;
  const heatPay = Math.floor(heatRaw);

  const bustProb = useMemo(
    () => dice.reduce((acc, d) => acc * (1 - d.winningFaces / d.sides), 1),
    [dice]
  );
  const expectedSuccesses = useMemo(
    () => dice.reduce((acc, d) => acc + d.winningFaces / d.sides, 0),
    [dice]
  );

  const [autoRollerLevel, setAutoRollerLevel] = useState(0);
  const [autoRollerActive, setAutoRollerActive] = useState(false);
  const autoRollIntervalMs = intervalMsForAutoRoll(autoRollerLevel);

  const [autoBankerOwned, setAutoBankerOwned] = useState(false);
  const [autoBankerActive, setAutoBankerActive] = useState(false);
  const [autoBankTarget, setAutoBankTarget] = useState(20);

  const [addDieInflation, setAddDieInflation] = useState(1);
  const [globalPriceScale, setGlobalPriceScale] = useState(1);
  const [destroyedSides, setDestroyedSides] = useState(0);

  const [armedDestroyId, setArmedDestroyId] = useState<number | null>(null);
  const armTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (armTimer.current) {
        window.clearTimeout(armTimer.current);
        armTimer.current = null;
      }
    };
  }, []);

  const appendLog = useCallback((message: string) => {
    setLog((prev) => [message, ...prev.slice(0, 7)]);
  }, []);

  const roll = useCallback(
    (fromAuto = false) => {
      const { results, successes } = rollDice(dice);
      setLastRoll(results);

      if (successes === 0) {
        let lostPot = 0;
        setPot((prevPot) => {
          lostPot = prevPot;
          return 0;
        });
        setStreak(0);
        if (lostPot > 0) {
          appendLog(`Bust. Lost pot of ${lostPot}.`);
        }
        return;
      }

      const payMult = Math.max(1, heatPay);
      const gain = Math.round(successes * payoutPerSuccess * payMult);

      let newPot = 0;
      let autoBanked = false;
      setPot((prevPot) => {
        const candidate = prevPot + gain;
        newPot = candidate;
        if (autoBankerOwned && autoBankerActive && candidate >= autoBankTarget) {
          autoBanked = true;
          return 0;
        }
        return candidate;
      });

      if (autoBanked) {
        setBank((b) => b + newPot);
        setStreak(0);
        appendLog(`Auto-banked ${newPot} (target ${autoBankTarget}+).${fromAuto ? " [auto-roll]" : ""}`);
      } else {
        setStreak((s) => s + 1);
        appendLog(`Success: ${successes}/${dice.length} wins. +${gain} to pot.${fromAuto ? " [auto-roll]" : ""}`);
      }
    },
    [appendLog, autoBankTarget, autoBankerActive, autoBankerOwned, dice, heatPay, payoutPerSuccess]
  );

  const bankNow = useCallback(() => {
    if (pot <= 0) {
      appendLog("Nothing to bank.");
      return;
    }
    setBank((b) => b + pot);
    appendLog(`Banked ${pot}.`);
    setPot(0);
    setStreak(0);
  }, [appendLog, pot]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "r") {
        e.preventDefault();
        roll();
      } else if (key === "b") {
        e.preventDefault();
        bankNow();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [roll, bankNow]);

  useEffect(() => {
    if (!autoRollerActive || !autoRollIntervalMs) return;
    const id = window.setInterval(() => roll(true), autoRollIntervalMs);
    return () => window.clearInterval(id);
  }, [autoRollerActive, autoRollIntervalMs, roll]);

  useEffect(() => {
    if (destroyedSides <= 0) return;
    const id = window.setInterval(() => {
      setBank((b) => b + b * destroyedSides * 0.001);
    }, 1000);
    return () => window.clearInterval(id);
  }, [destroyedSides]);

  function resetGame() {
    setBank(0);
    setPot(0);
    setStreak(0);
    setDice([{ ...STARTING_DIE }]);
    setSelectedDieId(STARTING_DIE.id);
    setLastRoll([]);
    setAutoRollerLevel(0);
    setAutoRollerActive(false);
    setAutoBankerOwned(false);
    setAutoBankerActive(false);
    setAutoBankTarget(20);
    setAddDieInflation(1);
    setGlobalPriceScale(1);
    setDestroyedSides(0);
    setLog(["Reset to one coin (d2) with one winning face per-die."]);
  }

  const priceDie = Math.max(1, Math.round(costAddDie(dice.length) * addDieInflation * globalPriceScale));

  const selected = dice.find((d) => d.id === selectedDieId) || dice[0];
  const canAddSide = selected ? selected.sides < 20 : false;
  const canAddWinningFace = selected ? selected.winningFaces < selected.sides - 1 : false;
  const priceSide = selected ? Math.max(1, Math.round(costAddSideFor(selected.sides) * globalPriceScale)) : 0;
  const priceWin = selected
    ? Math.max(1, Math.round(costAddWinningFaceFor(selected.winningFaces) * globalPriceScale))
    : 0;

  const priceAutoRoll = Math.max(1, Math.round(costAutoRoller(autoRollerLevel) * globalPriceScale));
  const priceAutoBanker = !autoBankerOwned
    ? Math.max(1, Math.round(costAutoBanker() * globalPriceScale))
    : 0;

  function bumpAddDiePrice() {
    setAddDieInflation((x) => x * 1.25);
  }

  function buyDie() {
    if (bank < priceDie) {
      appendLog("Insufficient funds for die.");
      return;
    }
    setBank((b) => b - priceDie);
    setDice((ds) => {
      const nextId = (ds.reduce((m, d) => Math.max(m, d.id), 0) + 1) || STARTING_DIE.id;
      return [...ds, { id: nextId, sides: 2, winningFaces: 1 }];
    });
    appendLog(`Bought +1 die for ${priceDie}. New die starts as d2 with 1 winning face.`);
  }

  function buySide() {
    if (!selected || !canAddSide) return;
    if (bank < priceSide) {
      appendLog("Insufficient funds for side.");
      return;
    }
    setBank((b) => b - priceSide);
    setDice((ds) =>
      ds.map((d) =>
        d.id === selected.id
          ? { ...d, sides: d.sides + 1, winningFaces: Math.min(d.winningFaces, d.sides + 1) }
          : d
      )
    );
    bumpAddDiePrice();
    appendLog(`Die #${selected.id}: added a side for ${priceSide}. Now d${selected.sides + 1}.`);
  }

  function buyWinningFace() {
    if (!selected || !canAddWinningFace) return;
    if (bank < priceWin) {
      appendLog("Insufficient funds for winning face.");
      return;
    }
    setBank((b) => b - priceWin);
    setDice((ds) =>
      ds.map((d) =>
        d.id === selected.id
          ? { ...d, winningFaces: Math.min(d.winningFaces + 1, d.sides - 1) }
          : d
      )
    );
    bumpAddDiePrice();
    appendLog(
      `Die #${selected.id}: added a winning face for ${priceWin}. Now ${Math.min(
        selected.winningFaces + 1,
        selected.sides - 1
      )}/${selected.sides} win.`
    );
  }

  function buyOrUpgradeAutoRoller() {
    if (bank < priceAutoRoll) {
      appendLog("Insufficient funds for Auto Roller.");
      return;
    }
    setBank((b) => b - priceAutoRoll);
    setAutoRollerLevel((lv) => Math.max(1, lv + 1));
    bumpAddDiePrice();
    appendLog(`${autoRollerLevel > 0 ? "Upgraded" : "Bought"} Auto Roller for ${priceAutoRoll}.`);
  }

  function toggleAutoRoller() {
    if (autoRollerLevel <= 0) {
      appendLog("Buy the Auto Roller first.");
      return;
    }
    setAutoRollerActive((active) => {
      const next = !active;
      appendLog(`Auto Roller ${next ? "started" : "stopped"}.`);
      return next;
    });
  }

  function buyAutoBanker() {
    if (autoBankerOwned) return;
    if (bank < priceAutoBanker) {
      appendLog("Insufficient funds for Auto Banker.");
      return;
    }
    setBank((b) => b - priceAutoBanker);
    setAutoBankerOwned(true);
    bumpAddDiePrice();
    appendLog(`Bought Auto Banker for ${priceAutoBanker}.`);
  }

  function toggleAutoBanker() {
    if (!autoBankerOwned) {
      appendLog("Buy the Auto Banker first.");
      return;
    }
    setAutoBankerActive((active) => {
      const next = !active;
      appendLog(`Auto Banker ${next ? "enabled" : "disabled"}. Target ${autoBankTarget}.`);
      return next;
    });
  }

  function destroyDie(id: number) {
    setDice((ds) => {
      if (!allowDestroy(ds.length)) {
        appendLog("Cannot destroy your last die.");
        return ds;
      }
      const die = ds.find((d) => d.id === id);
      if (!die) return ds;
      setGlobalPriceScale((s) => Math.max(0.0001, s * 0.5));
      setDestroyedSides((s) => s + die.sides);
      const remaining = ds.filter((d) => d.id !== id);
      if (selectedDieId === id && remaining.length) {
        setSelectedDieId(remaining[0].id);
      }
      appendLog(
        `Destroyed die #${id} (d${die.sides}). Prices halved; interest +${(die.sides * 0.1).toFixed(1)}%/tick.`
      );
      return remaining;
    });
  }

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Push Your Luck — Dice Upgrades & Automation</h1>
          <button type="button" className="button button-outline" onClick={resetGame}>
            Reset
          </button>
        </header>

        <section className="stats-grid">
          <Card title="Bank">
            <div className="stat-value">{Math.floor(bank)}</div>
            <div className="stat-note">
              Interest +{toFixed(destroyedSides * 0.1, 2)}%/tick • Price scale ×{toFixed(globalPriceScale, 2)}
            </div>
          </Card>
          <Card
            title="Pot (at risk)"
            footer={
              <div>
                Press <kbd>R</kbd> to roll • <kbd>B</kbd> to bank
              </div>
            }
          >
            <div className="stat-value">{pot}</div>
            <div className="stat-note">
              Heat ×{toFixed(heatRaw, 2)} • Payout ×{Math.max(1, heatPay)} • Streak {streak}
            </div>
          </Card>
          <Card title="Current Setup">
            <div className="stat-note">Dice: {dice.length}</div>
            {selected && (
              <div className="stat-note">Selected die #{selected.id} — d{selected.sides}</div>
            )}
            <div className="stat-note">Base heat ×{toFixed(startingHeat, 2)}</div>
            <div className="stat-note">Base per-win ×{toFixed(payoutPerSuccess, 2)}</div>
            <div className="stat-note">Bust chance {toFixed(bustProb * 100, 2)}%</div>
            <div className="stat-note">Expected successes {toFixed(expectedSuccesses, 2)}</div>
          </Card>
        </section>

        <div className="actions">
          <button type="button" className="button button-primary" onClick={() => roll(false)}>
            Roll
          </button>
          <button type="button" className="button button-secondary" onClick={bankNow}>
            Bank
          </button>
        </div>

        <Card title="Dice & Last Roll (click a die to select)">
          <div className="dice-grid">
            {dice.map((d) => {
              const last = lastRoll.find((r) => r.id === d.id);
              const canDestroy = allowDestroy(dice.length);
              const confirm = armedDestroyId === d.id;
              return (
                <div
                  key={d.id}
                  role="button"
                  tabIndex={0}
                  className={`die-tile${selectedDieId === d.id ? " selected" : ""}`}
                  onClick={() => setSelectedDieId(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDieId(d.id);
                    }
                  }}
                >
                  <DiceIcon n={d.sides} selected={selectedDieId === d.id} lastWin={last?.win ?? false} label={last?.value ?? "?"} />
                  <div>
                    <div className="die-info-title">Die #{d.id} — d{d.sides}</div>
                    <div className="die-info-meta">{d.winningFaces} winning face{d.winningFaces !== 1 ? "s" : ""}</div>
                    <button
                      type="button"
                      className="button button-outline danger destroy-button"
                      disabled={!canDestroy}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canDestroy) return;
                        if (confirm) {
                          if (armTimer.current) {
                            window.clearTimeout(armTimer.current);
                            armTimer.current = null;
                          }
                          setArmedDestroyId(null);
                          destroyDie(d.id);
                        } else {
                          setArmedDestroyId(d.id);
                          appendLog(`Click Destroy again to confirm die #${d.id}.`);
                          if (armTimer.current) {
                            window.clearTimeout(armTimer.current);
                          }
                          armTimer.current = window.setTimeout(() => {
                            setArmedDestroyId((curr) => (curr === d.id ? null : curr));
                          }, 2000);
                        }
                      }}
                    >
                      {confirm ? "Confirm" : "Destroy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <section className="upgrade-grid">
          <Card title="Add a Die">
            <div className="stat-note">New die starts as d2 with 1 winning face.</div>
            <div className="app-header" style={{ gap: "8px" }}>
              <div>
                <div className="die-info-title">{dice.length} → {dice.length + 1}</div>
                <div className="die-info-meta">Cost: {priceDie}</div>
              </div>
              <button
                type="button"
                className="button button-outline"
                disabled={bank < priceDie}
                onClick={buyDie}
              >
                Buy
              </button>
            </div>
          </Card>

          <Card title="Add a Side (selected die)">
            {selected ? (
              <>
                <div className="stat-note">Increase sides on the selected die.</div>
                <div className="app-header" style={{ gap: "8px" }}>
                  <div>
                    <div className="die-info-title">d{selected.sides} → d{selected.sides + 1}</div>
                    <div className="die-info-meta">Cost: {priceSide}</div>
                  </div>
                  <button
                    type="button"
                    className="button button-outline"
                    disabled={!canAddSide || bank < priceSide}
                    onClick={buySide}
                  >
                    Buy
                  </button>
                </div>
              </>
            ) : (
              <div className="stat-note">Select a die first.</div>
            )}
          </Card>

          <Card title="Add a Winning Face (selected die)">
            {selected ? (
              <>
                <div className="stat-note">Max is N−1 for that die.</div>
                <div className="app-header" style={{ gap: "8px" }}>
                  <div>
                    <div className="die-info-title">
                      {selected.winningFaces}/{selected.sides} → {Math.min(selected.winningFaces + 1, selected.sides - 1)}/
                      {selected.sides}
                    </div>
                    <div className="die-info-meta">Cost: {priceWin}</div>
                  </div>
                  <button
                    type="button"
                    className="button button-outline"
                    disabled={!canAddWinningFace || bank < priceWin}
                    onClick={buyWinningFace}
                  >
                    Buy
                  </button>
                </div>
              </>
            ) : (
              <div className="stat-note">Select a die first.</div>
            )}
          </Card>
        </section>

        <section className="automation-grid">
          <Card title="Auto Roller">
            <div className="stat-note">
              Automatically rolls at intervals. Upgrade to reduce the interval. Speed scales indefinitely.
            </div>
            <div className="app-header" style={{ gap: "8px" }}>
              <div className="die-info-meta" style={{ display: "grid", gap: "6px" }}>
                <div>
                  Owned: <strong>{autoRollerLevel > 0 ? "Yes" : "No"}</strong>
                </div>
                <div>
                  Level: <strong>{Math.max(0, autoRollerLevel)}</strong>
                </div>
                <div>
                  Interval: <strong>{autoRollIntervalMs ? `${autoRollIntervalMs} ms` : "—"}</strong>
                </div>
              </div>
              <div className="actions" style={{ gap: "8px" }}>
                <button
                  type="button"
                  className="button button-outline"
                  disabled={bank < priceAutoRoll}
                  onClick={buyOrUpgradeAutoRoller}
                >
                  {autoRollerLevel === 0 ? "Buy" : "Upgrade"} ({priceAutoRoll})
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  disabled={autoRollerLevel <= 0}
                  onClick={toggleAutoRoller}
                >
                  {autoRollerActive ? "Stop" : "Start"}
                </button>
              </div>
            </div>
          </Card>

          <Card title="Auto Banker">
            <div className="stat-note">
              Automatically banks when the pot reaches the target. Price is fixed but respects price reductions.
            </div>
            <div className="app-header" style={{ gap: "8px" }}>
              <div className="die-info-meta" style={{ display: "grid", gap: "6px" }}>
                <div>
                  Owned: <strong>{autoBankerOwned ? "Yes" : "No"}</strong>
                </div>
                <label>
                  Target:&nbsp;
                  <input
                    className="target-input"
                    type="number"
                    min={1}
                    step={1}
                    value={autoBankTarget}
                    onChange={(e) =>
                      setAutoBankTarget(clamp(parseInt(e.target.value || "0", 10) || 0, 1, 1_000_000))
                    }
                    disabled={!autoBankerOwned}
                  />
                </label>
              </div>
              <div className="actions" style={{ gap: "8px" }}>
                {!autoBankerOwned ? (
                  <button
                    type="button"
                    className="button button-outline"
                    disabled={bank < priceAutoBanker}
                    onClick={buyAutoBanker}
                  >
                    Buy ({priceAutoBanker})
                  </button>
                ) : (
                  <button type="button" className="button button-outline" onClick={toggleAutoBanker}>
                    {autoBankerActive ? "Disable" : "Enable"}
                  </button>
                )}
              </div>
            </div>
          </Card>
        </section>

        <Card title="Log">
          <ul className="log-list">
            {log.map((entry, idx) => (
              <li key={idx}>• {entry}</li>
            ))}
          </ul>
        </Card>

        <div className="rules">
          Roll your set of dice. If at least one die shows a winning face, you add to the pot and may roll again or bank. If
          none win, you bust and lose the pot. You can add dice, upgrade sides and winning faces, buy automation, and even
          destroy dice to slash prices at the cost of permanent interest.
        </div>
      </div>
    </div>
  );
};

export default App;
