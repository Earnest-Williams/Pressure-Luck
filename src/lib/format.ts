export const toFixed = (num: number, digits = 2) =>
  Number.isFinite(num) ? num.toFixed(digits) : "—";

export const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
