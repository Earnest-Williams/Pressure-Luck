import { ReactNode } from "react";
import { Card } from "../Card";
import { Die } from "../../types/dice";
import { toFixed } from "../../lib/format";

interface StatsPanelProps {
  bank: number;
  destroyedSides: number;
  priceScale: number;
  pot: number;
  heatRaw: number;
  heatMultiplier: number;
  streak: number;
  diceCount: number;
  selectedDie: Die | null;
  startingHeat: number;
  payoutPerSuccess: number;
  bustProbability: number;
  expectedSuccesses: number;
}

const ShortcutFooter: ReactNode = (
  <div className="text-white/70 text-xs">
    Press <kbd className="px-1.5 py-0.5 border rounded">R</kbd> to Roll,{' '}
    <kbd className="px-1.5 py-0.5 border rounded">B</kbd> to Bank
  </div>
);

export const StatsPanel: React.FC<StatsPanelProps> = ({
  bank,
  destroyedSides,
  priceScale,
  pot,
  heatRaw,
  heatMultiplier,
  streak,
  diceCount,
  selectedDie,
  startingHeat,
  payoutPerSuccess,
  bustProbability,
  expectedSuccesses
}) => (
  <div className="grid md:grid-cols-3 gap-4">
    <Card title="Bank">
      <div className="text-3xl font-bold">{Math.floor(bank)}</div>
      <div className="text-xs mt-1 text-white/70">
        Interest +{toFixed(destroyedSides * 0.1, 2)}%/tick • Price scale ×{toFixed(priceScale, 2)}
      </div>
    </Card>
    <Card title="Pot (at risk)">
      <div className="text-3xl font-bold">{pot}</div>
      <div className="text-xs mt-1 text-white/70">
        Heat x{toFixed(heatRaw, 2)} • Payout ×{heatMultiplier} • Streak {streak}
      </div>
    </Card>
    <Card title="Current Setup" footer={ShortcutFooter}>
      <div className="text-sm text-white/80">
        <div className="mb-2">
          Dice: <span className="font-semibold">{diceCount}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Selected die</div>
          <div className="text-right font-semibold">
            {selectedDie ? `#${selectedDie.id} — d${selectedDie.sides}, ${selectedDie.winningFaces} winning` : '—'}
          </div>
          <div>Base heat</div>
          <div className="text-right font-semibold">x{toFixed(startingHeat, 2)}</div>
          <div>Base per-win</div>
          <div className="text-right font-semibold">×{toFixed(payoutPerSuccess, 2)}</div>
          <div>Bust chance (roll)</div>
          <div className="text-right font-semibold">{toFixed(bustProbability * 100, 2)}%</div>
          <div>Expected successes</div>
          <div className="text-right font-semibold">{toFixed(expectedSuccesses, 2)}</div>
        </div>
      </div>
    </Card>
  </div>
);
