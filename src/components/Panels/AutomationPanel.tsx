import { Card } from "../Card";

interface AutomationPanelProps {
  autoRollerLevel: number;
  autoRollInterval: number | null;
  priceAutoRoller: number;
  bank: number;
  onBuyOrUpgradeAutoRoller: () => void;
  onToggleAutoRoller: () => void;
  autoRollerActive: boolean;
  autoBankerOwned: boolean;
  autoBankerActive: boolean;
  priceAutoBanker: number | null;
  onBuyAutoBanker: () => void;
  onToggleAutoBanker: () => void;
  autoBankTarget: number;
  onSetAutoBankTarget: (value: number) => void;
}

export const AutomationPanel: React.FC<AutomationPanelProps> = ({
  autoRollerLevel,
  autoRollInterval,
  priceAutoRoller,
  bank,
  onBuyOrUpgradeAutoRoller,
  onToggleAutoRoller,
  autoRollerActive,
  autoBankerOwned,
  autoBankerActive,
  priceAutoBanker,
  onBuyAutoBanker,
  onToggleAutoBanker,
  autoBankTarget,
  onSetAutoBankTarget
}) => (
  <div className="grid md:grid-cols-2 gap-4">
    <Card title="Auto Roller">
      <div className="text-sm text-white/80 mb-3">
        Automatically rolls at intervals. Upgrade to reduce the interval. Speed scales indefinitely.
      </div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm">Owned: <span className="font-semibold">{autoRollerLevel > 0 ? "Yes" : "No"}</span></div>
          <div className="text-sm">Level: <span className="font-semibold">{Math.max(0, autoRollerLevel)}</span></div>
          <div className="text-sm">Interval: <span className="font-semibold">{autoRollInterval ? `${autoRollInterval} ms` : "—"}</span></div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBuyOrUpgradeAutoRoller}
            disabled={bank < priceAutoRoller}
            className={`px-3 py-2 rounded-xl border ${
              bank >= priceAutoRoller ? "border-emerald-400 hover:bg-emerald-400/10" : "border-white/10 opacity-50 cursor-not-allowed"
            }`}
          >
            {autoRollerLevel === 0 ? "Buy" : "Upgrade"} ({priceAutoRoller})
          </button>
          <button
            onClick={onToggleAutoRoller}
            disabled={autoRollerLevel <= 0}
            className={`px-3 py-2 rounded-xl border ${
              autoRollerLevel > 0
                ? autoRollerActive
                  ? "border-rose-300 hover:bg-rose-300/10"
                  : "border-emerald-400 hover:bg-emerald-400/10"
                : "border-white/10 opacity-50 cursor-not-allowed"
            }`}
          >
            {autoRollerActive ? "Stop" : "Start"}
          </button>
        </div>
      </div>
    </Card>

    <Card title="Auto Banker">
      <div className="text-sm text-white/80 mb-3">
        Automatically banks when the pot reaches the target value. Price is fixed; affected by price reductions.
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <div className="text-sm">Owned: <span className="font-semibold">{autoBankerOwned ? "Yes" : "No"}</span></div>
          <div className="text-sm flex items-center gap-2">
            Target:
            <input
              type="number"
              min={1}
              step={1}
              value={autoBankTarget}
              onChange={(e) => onSetAutoBankTarget(Number(e.target.value) || 0)}
              disabled={!autoBankerOwned}
              className="w-28 px-2 py-1 rounded-lg bg-black/40 border border-white/10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {!autoBankerOwned ? (
            <button
              onClick={onBuyAutoBanker}
              disabled={priceAutoBanker == null || bank < priceAutoBanker}
              className={`px-3 py-2 rounded-xl border ${
                priceAutoBanker != null && bank >= priceAutoBanker
                  ? "border-emerald-400 hover:bg-emerald-400/10"
                  : "border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              Buy ({priceAutoBanker ?? "—"})
            </button>
          ) : (
            <button
              onClick={onToggleAutoBanker}
              className={`px-3 py-2 rounded-xl border ${
                autoBankerActive
                  ? "border-rose-300 hover:bg-rose-300/10"
                  : "border-emerald-400 hover:bg-emerald-400/10"
              }`}
            >
              {autoBankerActive ? "Disable" : "Enable"}
            </button>
          )}
        </div>
      </div>
    </Card>
  </div>
);
