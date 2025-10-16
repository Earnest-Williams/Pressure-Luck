export interface Die {
  id: number;
  sides: number;
  winningFaces: number;
}

export interface RollResult {
  id: number;
  value: number;
  win: boolean;
}
