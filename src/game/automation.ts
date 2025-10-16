export function intervalMsForAutoRoll(level: number) {
  if (level <= 0) return null;
  const base = 2000 * Math.pow(0.75, level - 1);
  return Math.max(10, Math.round(base));
}
