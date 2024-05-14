import { makeAutoObservable } from "mobx";
import { BLOCK_STATUS } from "../components/type";
import { GAME_STATUS, IBlock } from "./type";
interface IPosition {
  x: number;
  y: number;
}
class BoardStore {
  board: IBlock[][] = [];
  mineList: IPosition[] = [];
  gameStatus = "";
  constructor() {
    makeAutoObservable(this);
  }
  setUp = ({ size }: { size: number }) => {
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const tile: IBlock = {
          x: i,
          y: j,
          isMine: false,
          status: BLOCK_STATUS.HIDDEN,
          mineAlert: "",
        };
        row.push(tile);
      }
      this.board = [...this.board, row];
    }
  };

  setMinePositions = (size: number, numberOfMines: number, block: IBlock) => {
    while (this.mineList.length < numberOfMines) {
      const x = this.generateRandomNumber(size);
      const y = this.generateRandomNumber(size);
      const minePosition: IPosition = { x, y };
      if (
        !this.mineList.some((position) =>
          this.positionMatch(minePosition, position),
        ) &&
        block.x !== x &&
        block.y !== y
      ) {
        this.board[x][y].isMine = true;
        this.mineList = [...this.mineList, minePosition];
      }
    }
  };

  onClick = (block: IBlock) => {
    if (block.status === BLOCK_STATUS.FLAGGED) {
      return;
    }
    if (block.isMine) {
      this.gameStatus = GAME_STATUS.LOSE;
      this.showMinePosition();
      return;
    }
    this.reveal(block);
    if (this.checkWin()) {
      this.gameStatus = GAME_STATUS.WIN;
      this.showMinePosition();
    }
  };

  onDoubleClick = (block: IBlock) => {
    const nearByList = this.getNearBy(block);
    const flaggedAmount = nearByList.filter(
      (block) => block.status === BLOCK_STATUS.FLAGGED,
    ).length;
    if (
      block.mineAlert &&
      Number(block.mineAlert) != nearByList.length &&
      Number(block.mineAlert) == flaggedAmount
    ) {
      nearByList.forEach((block) => this.onClick(block));
    }
  };

  onRightClick = (block: IBlock) => {
    if (block.status === BLOCK_STATUS.HIDDEN) {
      block.status = BLOCK_STATUS.FLAGGED;
    } else if (block.status === BLOCK_STATUS.FLAGGED) {
      block.status = BLOCK_STATUS.HIDDEN;
    }
  };

  reveal = (block: IBlock) => {
    if (block.isMine || block.status === BLOCK_STATUS.FLAGGED) {
      return;
    }
    const nearByList = this.getNearBy(block);
    const mineAmount = nearByList.filter((block) => block.isMine).length;

    if (mineAmount === 0) {
      block.status = BLOCK_STATUS.SHOWED;

      nearByList.forEach((block) => {
        this.reveal(block);
      });
    } else {
      block.status = BLOCK_STATUS.SHOWED;
      block.mineAlert = mineAmount.toString();
    }
  };

  getNearBy = (block: IBlock): IBlock[] => {
    const { x, y } = block;
    const nearByList: IBlock[] = [];

    for (let xOffset = x - 1; xOffset <= x + 1; xOffset++) {
      for (let yOffset = y - 1; yOffset <= y + 1; yOffset++) {
        const nearByBlock = this.board[xOffset]?.[yOffset];
        if (
          nearByBlock &&
          nearByBlock.status != BLOCK_STATUS.SHOWED &&
          (nearByBlock.x != block.x || nearByBlock.y != block.y)
        ) {
          nearByList.push(nearByBlock);
        }
      }
    }
    return nearByList;
  };

  checkWin = () => {
    return this.board.every((row) =>
      row.every(
        (block) =>
          (!block.isMine && block.status === BLOCK_STATUS.SHOWED) ||
          block.isMine,
      ),
    );
  };

  showMinePosition = () => {
    this.mineList.forEach((minePosition) => {
      this.board[minePosition.x][minePosition.y].status = BLOCK_STATUS.SHOWED;
    });
  };

  positionMatch = (a: IPosition, b: IPosition) => a.x === b.x && a.y === b.y;
  generateRandomNumber = (range: number) => Math.floor(Math.random() * range);

  reset = () => {
    this.board = [];
    this.mineList = [];
    this.gameStatus = "";
  };
}
const store = new BoardStore();
export default store;
