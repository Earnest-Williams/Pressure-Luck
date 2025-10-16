import { useEffect, useState } from "react";
import { DiceIcon } from "./DiceIcon";
import { Die } from "../types/dice";

interface DiceTileProps {
  die: Die;
  isSelected: boolean;
  onSelect: (id: number) => void;
  canDestroy: boolean;
  lastRollValue?: number;
  lastRollWin?: boolean;
  onDestroy: (id: number) => void;
}

export const DiceTile: React.FC<DiceTileProps> = ({
  die,
  isSelected,
  onSelect,
  canDestroy,
  lastRollValue,
  lastRollWin,
  onDestroy
}) => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = window.setTimeout(() => setArmed(false), 2000);
    return () => window.clearTimeout(id);
  }, [armed]);

  const handleDestroy = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    if (!canDestroy) return;
    if (armed) {
      onDestroy(die.id);
      setArmed(false);
    } else {
      setArmed(true);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(die.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(die.id);
        }
      }}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left pr-4 transition ${
        isSelected ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 hover:bg-white/5"
      }`}
    >
      <DiceIcon n={die.sides} selected={isSelected} lastWin={lastRollWin} label={lastRollValue ?? "?"} />
      <div>
        <div className="text-sm font-semibold">Die #{die.id} — d{die.sides}</div>
        <div className="text-xs text-white/80">
          {die.winningFaces} winning face{die.winningFaces !== 1 ? "s" : ""}
        </div>
        <div className="mt-1">
          <button
            type="button"
            onClick={handleDestroy}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDestroy(e);
              }
            }}
            disabled={!canDestroy}
            className={`inline-block text-xs px-2 py-1 rounded-lg border transition ${
              canDestroy
                ? armed
                  ? "border-rose-300 text-rose-100 bg-rose-500/20"
                  : "border-rose-400/60 text-rose-200 hover:bg-rose-400/10"
                : "opacity-40 border-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            {armed ? "Confirm" : "Destroy"}
          </button>
        </div>
      </div>
    </div>
  );
};
