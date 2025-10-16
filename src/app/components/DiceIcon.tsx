import type { FC } from "react";

export type DiceIconProps = {
  n: number;
  size?: number;
  selected?: boolean;
  lastWin?: boolean;
  label?: string | number;
};

const DiceIcon: FC<DiceIconProps> = ({ n, size = 56, selected = false, lastWin = false, label }) => {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.38;
  const stroke = selected ? "#34d399" : lastWin ? "#10b981" : "#94a3b8";
  const strokeWidth = selected ? 3 : 2;

  const makePoints = (k: number) => {
    const pts: string[] = [];
    const rot = -Math.PI / 2;
    for (let i = 0; i < k; i++) {
      const a = rot + (i * 2 * Math.PI) / k;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      pts.push(`${x},${y}`);
    }
    return pts.join(" ");
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <rect x={0} y={0} width={s} height={s} rx={12} ry={12} fill="none" stroke="rgba(255,255,255,0.08)" />
      {n <= 2 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      ) : (
        <polygon points={makePoints(n)} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      )}
      {label != null && (
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={s * 0.42}
          fontFamily="ui-sans-serif, system-ui"
          fill="currentColor"
        >
          {String(label)}
        </text>
      )}
    </svg>
  );
};

export default DiceIcon;
