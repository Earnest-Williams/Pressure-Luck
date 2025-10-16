export const costAddDie = (k: number) => 20 * 2 ** Math.max(0, k - 1);
export const costAddSideFor = (sides: number) => Math.round(10 + 2 * sides);
export const costAddWinningFaceFor = (w: number) => Math.round(20 * 1.3 ** w);
export const costAutoRoller = (lvl: number) => Math.round(50 * 1.6 ** Math.max(0, lvl));
export const costAutoBanker = () => 60;
