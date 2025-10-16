export function costAddDie(k: number) {
  return 20 * Math.pow(2, Math.max(0, k - 1));
}

export function costAddSideFor(sides: number) {
  return Math.round(10 + 2 * sides);
}

export function costAddWinningFaceFor(winningFaces: number) {
  return Math.round(20 * Math.pow(1.3, winningFaces));
}

export function costAutoRoller(level: number) {
  return Math.round(50 * Math.pow(1.6, Math.max(0, level)));
}

export function costAutoBanker() {
  return 60;
}
