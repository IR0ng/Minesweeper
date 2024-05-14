import { BLOCK_STATUS } from "../components/type";

export interface IBlock {
  x: number;
  y: number;
  isMine: boolean;
  status: BLOCK_STATUS;
  mineAlert: string;
}

export enum GAME_STATUS {
  LOSE = "YOU LOSE",
  WIN = "YOU WIN",
}
