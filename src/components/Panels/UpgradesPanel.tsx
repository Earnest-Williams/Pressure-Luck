import { Card } from "../Card";
import { Die } from "../../types/dice";

interface UpgradesPanelProps {
  diceCount: number;
  priceDie: number;
  bank: number;
  onBuyDie: () => void;
  selectedDie: Die | null;
  canAddSide: boolean;
  priceSide: number | null;
  onAddSide: () => void;
  canAddWinningFace: boolean;
  priceWin: number | null;
  onAddWinningFace: () => void;
}

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({
  diceCount,
  priceDie,
  bank,
  onBuyDie,
  selectedDie,
  canAddSide,
  priceSide,
  onAddSide,
  canAddWinningFace,
  priceWin,
  onAddWinningFace
}) => (
  <div className="grid md:grid-cols-3 gap-4">
    <Card title="Add a Die">
      <div className="text-sm text-white/80 mb-2">New die starts as d2 with 1 winning face.</div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xl font-semibold">{diceCount} → {diceCount + 1}</div>
          <div className="text-white/70 text-sm">Cost: {priceDie}</div>
        </div>
        <button
          onClick={onBuyDie}
          disabled={bank < priceDie}
          className={`px-3 py-2 rounded-xl border ${
            bank >= priceDie ? "border-emerald-400 hover:bg-emerald-400/10" : "border-white/10 opacity-50 cursor-not-allowed"
          }`}
        >
          Buy
        </button>
      </div>
    </Card>

    <Card title="Add a Side (selected die)">
      {selectedDie ? (
        <div>
          <div className="text-sm text-white/80 mb-2">Increase sides on the selected die.</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xl font-semibold">d{selectedDie.sides} → d{selectedDie.sides + 1}</div>
              <div className="text-white/70 text-sm">Cost: {priceSide ?? "—"}</div>
            </div>
            <button
              onClick={onAddSide}
              disabled={!canAddSide || priceSide == null || bank < priceSide}
              className={`px-3 py-2 rounded-xl border ${
                priceSide != null && bank >= priceSide && canAddSide
                  ? "border-emerald-400 hover:bg-emerald-400/10"
                  : "border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              Buy
            </button>
          </div>
        </div>
      ) : (
        <div className="text-white/70">Select a die first.</div>
      )}
    </Card>

    <Card title="Add a Winning Face (selected die)">
      {selectedDie ? (
        <div>
          <div className="text-sm text-white/80 mb-2">Max is N−1 for that die.</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xl font-semibold">
                {selectedDie.winningFaces}/{selectedDie.sides} → {Math.min(selectedDie.winningFaces + 1, selectedDie.sides - 1)}
                /{selectedDie.sides}
              </div>
              <div className="text-white/70 text-sm">Cost: {priceWin ?? "—"}</div>
            </div>
            <button
              onClick={onAddWinningFace}
              disabled={!canAddWinningFace || priceWin == null || bank < priceWin}
              className={`px-3 py-2 rounded-xl border ${
                priceWin != null && bank >= priceWin && canAddWinningFace
                  ? "border-emerald-400 hover:bg-emerald-400/10"
                  : "border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              Buy
            </button>
          </div>
        </div>
      ) : (
        <div className="text-white/70">Select a die first.</div>
      )}
    </Card>
  </div>
);
