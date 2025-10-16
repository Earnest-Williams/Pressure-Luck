interface ControlsProps {
  onRoll: () => void;
  onBank: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ onRoll, onBank }) => (
  <div className="flex gap-3">
    <button
      onClick={onRoll}
      className="px-4 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-slate-900 font-semibold shadow"
    >
      Roll
    </button>
    <button
      onClick={onBank}
      className="px-4 py-3 rounded-2xl bg-amber-400/90 hover:bg-amber-400 text-slate-900 font-semibold shadow"
    >
      Bank
    </button>
  </div>
);
