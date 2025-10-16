import { DiceTile } from "./DiceTile";
import { Die } from "../types/dice";

interface DiceListProps {
  dice: Die[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  canDestroy: boolean;
  lastRollById: Map<number, { value: number; win: boolean }>;
  onDestroy: (id: number) => void;
}

export const DiceList: React.FC<DiceListProps> = ({
  dice,
  selectedId,
  onSelect,
  canDestroy,
  lastRollById,
  onDestroy
}) => (
  <div className="flex flex-wrap gap-3">
    {dice.map((die) => {
      const last = lastRollById.get(die.id);
      return (
        <DiceTile
          key={die.id}
          die={die}
          isSelected={die.id === selectedId}
          onSelect={onSelect}
          canDestroy={canDestroy}
          lastRollValue={last?.value}
          lastRollWin={last?.win}
          onDestroy={onDestroy}
        />
      );
    })}
  </div>
);
