import * as React from "react";
import { Button } from "@/components/ui/button"; // Assuming button component is imported from Shadcn
import { useState } from "react";

export default function Score() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Games, setPlayer1Games] = useState(0);
  const [player2Games, setPlayer2Games] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const incrementScore = (player: number) => {
    if (winner) return; // Prevent scoring if there's already a winner

    if (player === 1) {
      const newScore = player1Score + 1;
      setPlayer1Score(newScore);
      if (newScore === 11) {
        setPlayer1Games(player1Games + 1);
        setWinner("Player 1");
        setHistory([...history, `${newScore} - ${player2Score}`]);
      }
    } else {
      const newScore = player2Score + 1;
      setPlayer2Score(newScore);
      if (newScore === 11) {
        setPlayer2Games(player2Games + 1);
        setWinner("Player 2");
        setHistory([...history, `${player1Score} - ${newScore}`]);
      }
    }
  };

  const decrementScore = (player: number) => {
    if (winner) return; // Prevent scoring if there's already a winner

    if (player === 1 && player1Score > 0) {
      setPlayer1Score(player1Score - 1);
    } else if (player === 2 && player2Score > 0) {
      setPlayer2Score(player2Score - 1);
    }
  };

  const nextGame = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
    setWinner(null);
  };

  const getScoreColor = (score: number) => {
    return player1Score === 11 || player2Score === 11
      ? score === 11
        ? "text-green-500"
        : "text-red-500"
      : "";
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-4 text-white relative font-digital">
      {/* Top row for match type */}
      <div className="w-full flex justify-center items-center text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold mt-2 absolute top-10">
        <div>Match ID : 10001 , Group Stage - Best of 3</div>
      </div>

      {/* Top row for Player Names */}
      <div className="w-full flex justify-around items-center text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
        <div>PLAYER 1</div>
        <div>PLAYER 2</div>
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-8">
        {/* Player 1 Controls and Info */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-xl md:text-3xl lg:text-4xl"
            onClick={() => incrementScore(1)}
          >
            +
          </Button>
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-xl md:text-3xl lg:text-4xl"
            onClick={() => decrementScore(1)}
          >
            -
          </Button>
        </div>

        {/* Player 1 Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center space-y-4 p-2 md:p-4">
          <div className="flex items-start justify-center space-x-4 md:space-x-8">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl">
                Set
              </h3>
              <p className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl">
                {player1Games}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl">
                Score
              </h3>
              <p
                className={`text-4xl sm:text-5xl md:text-7xl lg:text-13xl font-bold ${getScoreColor(
                  player1Score
                )}`}
              >
                {player1Score}
              </p>
            </div>
          </div>
        </div>

        {/* Player 2 Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center space-y-4 p-2 md:p-4">
          <div className="flex items-start justify-center space-x-4 md:space-x-8">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl">
                Set
              </h3>
              <p className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl">
                {player2Games}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl">
                Score
              </h3>
              <p
                className={`text-4xl sm:text-5xl md:text-7xl lg:text-13xl font-bold ${getScoreColor(
                  player2Score
                )}`}
              >
                {player2Score}
              </p>
            </div>
          </div>
        </div>

        {/* Player 2 Controls */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-xl md:text-3xl lg:text-4xl"
            onClick={() => incrementScore(2)}
          >
            +
          </Button>
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-xl md:text-3xl lg:text-4xl"
            onClick={() => decrementScore(2)}
          >
            -
          </Button>
        </div>
      </div>

      {/* Dialog-like Button Next Set */}
      {winner && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Match Finished
            </h3>
            <Button
              className="bg-white text-black text-lg sm:text-xl md:text-2xl lg:text-3xl p-4"
              onClick={nextGame}
            >
              NEXT SET
            </Button>
          </div>
        </div>
      )}

      {/* Section History */}
      <div className="absolute bottom-0 w-full flex flex-col items-center mb-10 md:mb-20">
        <div className="flex flex-row items-center space-x-2 md:space-x-4">
          {history.map((entry, index) => {
            const [player1, player2] = entry.split(" - ");
            const player1Score = parseInt(player1);
            const player2Score = parseInt(player2);
            const player1Color =
              player1Score === 11 ? "text-green-500" : "text-red-500";
            const player2Color =
              player2Score === 11 ? "text-green-500" : "text-red-500";
            return (
              <div key={index} className="flex flex-col items-center">
                <h4 className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  Set {index + 1}
                </h4>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  <span className={player1Color}>{player1}</span> -{" "}
                  <span className={player2Color}>{player2}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}