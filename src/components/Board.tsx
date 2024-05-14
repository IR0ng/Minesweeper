import classnames from "classnames/dedupe";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import BoardStore from "../store/BoardStore";
import { BLOCK_STATUS } from "./type";
import { IoIosFlag } from "react-icons/io";
import { FaBomb } from "react-icons/fa";
import { GAME_STATUS } from "../store/type";
const Board = () => {
  const {
    board,
    setUp,
    gameStatus,
    setMinePositions,
    mineList,
    onClick,
    onDoubleClick,
    onRightClick,
    reset,
  } = BoardStore;
  const NUMBER_OF_MINES = 30;
  const BOARD_SIZE = 20;
  const [flagLeft, setFlagLeft] = useState(NUMBER_OF_MINES);
  const [time, setTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timer>();

  const resetBoard = () => {
    runInAction(() => {
      reset();
    });
    setUp({ size: BOARD_SIZE });
    clearInterval(intervalRef.current);
    setTime(0);
  };

  useEffect(() => {
    setUp({ size: BOARD_SIZE });
  }, [setUp]);

  useEffect(() => {
    if (mineList.length != 0) {
      const id = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);

      intervalRef.current = id;
    }

    if (gameStatus) {
      clearInterval(intervalRef.current);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [mineList, gameStatus]);

  return (
    <div className="text-center">
      <div className="border rounded-lg mb-2 py-2 px-6">
        <text
          className={`${gameStatus === GAME_STATUS.LOSE ? "text-red-400" : "text-green-400"} text-xl font-bold`}
        >
          {gameStatus}
        </text>
        <div className="flex justify-center items-center">
          <div className="flex-1 flex justify-center items-center gap-5">
            <div
              className={`flex items-center text-lg ${flagLeft >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              <IoIosFlag size={35} color="gray" />
              {flagLeft}
            </div>

            <button
              className="border rounded-lg bg-red-300 border-red-300 p-1"
              onClick={() => {
                resetBoard();
              }}
            >
              Reset
            </button>
          </div>

          <div>{time}</div>
        </div>
      </div>
      <table>
        <tbody>
          {board.map((row) => (
            <tr>
              {row.map((block) => (
                <td
                  className={`h-10 w-10 border text-sm cursor-pointer ${!block.isMine && block.status === BLOCK_STATUS.SHOWED && "bg-gray-400"}`}
                  onClick={(e) => {
                    console.log(`x: ${block.x}, y: ${block.y}`);
                    if (mineList.length === 0) {
                      setMinePositions(BOARD_SIZE, NUMBER_OF_MINES, block);
                    }

                    if (gameStatus) {
                      e.stopPropagation();
                      return;
                    }

                    onClick(block);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (gameStatus) {
                      e.stopPropagation();
                      return;
                    }
                    onRightClick(block);
                    setFlagLeft(
                      NUMBER_OF_MINES -
                        board.reduce(
                          (acc, cur) =>
                            cur.filter(
                              (block) => block.status === BLOCK_STATUS.FLAGGED,
                            ).length + acc,
                          0,
                        ),
                    );
                  }}
                  onDoubleClick={(e) => {
                    if (gameStatus) {
                      e.stopPropagation();
                      return;
                    }
                    onDoubleClick(block);
                  }}
                >
                  {block.mineAlert}
                  {block.status === BLOCK_STATUS.FLAGGED && (
                    <IoIosFlag size={35} color="gray" />
                  )}
                  {block.isMine &&
                    block.status === BLOCK_STATUS.SHOWED &&
                    (gameStatus === GAME_STATUS.LOSE ? (
                      <FaBomb size={35} color="red" />
                    ) : (
                      <IoIosFlag size={35} color="gray" />
                    ))}
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
