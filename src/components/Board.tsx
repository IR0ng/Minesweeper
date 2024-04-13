import classnames from "classnames/dedupe";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import BoardStore from "../store/BoardStore";
import { TILE_STATUS } from "./type";

const Board = () => {
  const {
    board,
    setUp,
    setMinePositions,
    mineList,
    onClick,
    gameStatus,
    checkWin,
  } = BoardStore;
  const NUMBER_OF_MINES = 10;
  const BOARD_SIZE = 20;
  const [time, setTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timer>();
  useEffect(() => {
    setUp({ size: BOARD_SIZE, numberOfMines: NUMBER_OF_MINES });
  }, [setUp, setMinePositions]);
  useEffect(() => {
    const id = setInterval(() => {
      setTime((time) => time + 1);
    }, 1000);
    intervalRef.current = id;
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="text-center">
      <h1>{gameStatus}</h1>
      <h1>
        Mine Left:{" "}
        {NUMBER_OF_MINES -
          (board.reduce(
            (acc, cur) =>
              cur.filter((tile) => tile.status === TILE_STATUS.MARKED).length +
              acc,
            0,
          ),
          0)}
      </h1>
      <button
        onClick={() => {
          console.log("reset");
        }}
      >
        Reset
      </button>
      <table>
        <tbody>
          {board.map((row, rowIndex) => (
            <tr className="flex-row" key={`row_${rowIndex}`}>
              {row.map((tile) => (
                <td
                  key={`${tile.x}_${tile.y}`}
                  className={classnames(
                    "border border-black w-10 h-10 cursor-pointer text-center text-white text-2xl",
                    {
                      "bg-zinc-300": tile.status === TILE_STATUS.HIDDEN,
                    },
                    {
                      "bg-zinc-500":
                        !tile.isMine && tile.status === TILE_STATUS.SHOW,
                    },
                    {
                      "bg-red-600":
                        tile.isMine && tile.status === TILE_STATUS.SHOW,
                    },
                    {
                      "bg-yellow-500": tile.status === TILE_STATUS.MARKED,
                    },
                  )}
                  onDoubleClick={() => {
                    console.log("hi");
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (gameStatus) {
                      e.stopPropagation();
                      return;
                    }
                    runInAction(() => {
                      if (tile.status === TILE_STATUS.MARKED) {
                        tile.status = TILE_STATUS.HIDDEN;
                      } else {
                        if (tile.status === TILE_STATUS.HIDDEN) {
                          tile.status = TILE_STATUS.MARKED;
                        }
                      }
                      if (checkWin()) {
                        BoardStore.gameStatus = "You win";
                      }
                    });
                  }}
                  onClick={(e) => {
                    if (gameStatus) {
                      e.stopPropagation();
                      return;
                    }
                    if (mineList.length === 0) {
                      setMinePositions(BOARD_SIZE, NUMBER_OF_MINES, tile);
                    }
                    if (tile.status !== TILE_STATUS.MARKED) {
                      runInAction(() => {
                        tile.status = TILE_STATUS.SHOW;
                      });
                      onClick(tile);
                    }
                  }}
                >
                  {!tile.isMine &&
                    tile.status !== TILE_STATUS.MARKED &&
                    tile.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default observer(Board);
