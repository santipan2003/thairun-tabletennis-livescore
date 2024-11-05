import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import db from "@/services/firestore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MatchTypeModal from "./MatchTypeModal";

interface Player {
  category: string;
  division: string;
  dob: string;
  firstName: string;
  group: string;
  lastName?: string;
  nationality: string;
  player_id: string;
  rank_number: string;
  rank_score: string;
  team_name?: string;
}

interface Match {
  id: string;
  division: string;
  group: number;
  match_id: string;
  nextmatch_id: string | null;
  players: Player[];
  table: number;
  time: Timestamp | string | null; // Adjusted to accept Timestamp, string, or null
  matchType: string;
}

export default function Score() {
  const [matchData, setMatchData] = useState<Match | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Games, setPlayer1Games] = useState(0);
  const [player2Games, setPlayer2Games] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [setWinnerState, setSetWinnerState] = useState<string | null>(null); // Renamed state for set winner
  const [history, setHistory] = useState<string[]>([]);
  const [isSwapped, setIsSwapped] = useState(false); // State for swapping players
  const [showModal, setShowModal] = useState(true); // State for showing the modal
  const router = useRouter();
  const { id: match_id, tournamentId } = router.query;

  useEffect(() => {
    const fetchMatchData = async (tournamentId: string, matchId: string) => {
      try {
        const matchDoc = doc(
          db,
          "tournaments",
          tournamentId,
          "matches",
          matchId
        );
        const matchSnap = await getDoc(matchDoc);
        if (matchSnap.exists()) {
          const matchData = matchSnap.data() as Match;
          matchData.id = matchSnap.id; // Store the document ID

          // Check if time is a Firestore Timestamp and convert it if necessary
          if (matchData.time instanceof Timestamp) {
            matchData.time = matchData.time.toDate().toISOString();
          } else if (typeof matchData.time === "string") {
            matchData.time = matchData.time;
          } else {
            matchData.time = null;
          }
          setMatchData(matchData);
          if (!matchData.matchType) {
            setShowModal(true); // Show the modal if matchType is not set
          }
          console.log("MatchData", matchData);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    if (match_id && tournamentId) {
      fetchMatchData(tournamentId as string, match_id as string);
    }
  }, [match_id, tournamentId]);

  const handleMatchTypeSelect = async (matchType: string) => {
    if (!match_id || !tournamentId) return;

    try {
      const matchDoc = doc(
        db,
        "tournaments",
        tournamentId as string,
        "matches",
        match_id as string
      );
      await updateDoc(matchDoc, { matchType });
      setMatchData((prev) => (prev ? { ...prev, matchType } : null));
      setShowModal(false);
    } catch (error) {
      console.error("Error updating match type:", error);
    }
  };

  const incrementScore = (player: number) => {
    if (winner) return; // Prevent scoring if there's already a winner

    if (player === 1) {
      const newScore = player1Score + 1;
      setPlayer1Score(newScore);

      // Check win condition with deuce rule (10-10 deal condition)
      if (newScore >= 11 && newScore - player2Score >= 2) {
        setPlayer1Games(player1Games + 1);
        setHistory([...history, `${newScore} - ${player2Score}`]);
        setSetWinnerState("Player 1");
        checkMatchWinner(player1Games + 1, player2Games);
        resetScores();
      }
    } else {
      const newScore = player2Score + 1;
      setPlayer2Score(newScore);

      // Check win condition with deuce rule (10-10 deal condition)
      if (newScore >= 11 && newScore - player1Score >= 2) {
        setPlayer2Games(player2Games + 1);
        setHistory([...history, `${player1Score} - ${newScore}`]);
        setSetWinnerState("Player 2");
        checkMatchWinner(player1Games, player2Games + 1);
        resetScores();
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

  const resetScores = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
  };

  const nextGame = () => {
    resetScores();
    setSetWinnerState(null);
    setIsSwapped(!isSwapped); // Swap players after each set
  };

  // Manual Swap function
  const handleManualSwap = () => {
    setIsSwapped(!isSwapped);
  };

  const checkMatchWinner = (player1Games: number, player2Games: number) => {
    if (matchData?.matchType === "Best of 3") {
      if (player1Games === 2) {
        setWinner("Player 1");
      } else if (player2Games === 2) {
        setWinner("Player 2");
      }
    } else if (matchData?.matchType === "Best of 5") {
      if (player1Games === 3) {
        setWinner("Player 1");
      } else if (player2Games === 3) {
        setWinner("Player 2");
      }
    }
  };

  const getScoreColor = (
    score: number,
    playerScore: number,
    opponentScore: number
  ) => {
    // Check if score is 11 or higher and whether it's a normal win or a deal win
    if (score >= 11 && score - opponentScore >= 2) {
      return "text-green-500";
    } else if (opponentScore >= 11 && opponentScore - playerScore >= 2) {
      return "text-red-500";
    } else if (playerScore === 10 && opponentScore === 10) {
      // Deal case at 10-10, colors won't be applied yet
      return "";
    }
    return "";
  };

  if (!matchData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-4 text-white relative font-digital">
      {/* Top row for match type */}
      <div className="w-full flex justify-center items-center text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold mt-2 absolute top-10">
        <div>
          Match ID: {matchData.match_id}, {matchData.division} - GROUP{" "}
          {matchData.group} - {matchData.matchType}
        </div>
      </div>
      {/* Manual Swap Button */}
      <div className="mb-4">
        <Button className="bg-white text-black" onClick={handleManualSwap}>
          Swap Side
        </Button>
      </div>

      {/* Top row for Player Names */}
      <div className="w-full flex justify-around items-center text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
        <div className="flex items-center">
          <Image
            src={isSwapped ? "/flags/china.png" : "/flags/thailand.png"}
            alt="Player 1 Flag"
            width={100}
            height={100}
            className="mr-2 w-[1em] h-[1em]"
          />
          {isSwapped
            ? `${matchData.players[1].firstName} ${matchData.players[1].lastName}`
            : `${matchData.players[0].firstName} ${matchData.players[0].lastName}`}
        </div>
        <div className="flex items-center">
          <Image
            src={isSwapped ? "/flags/thailand.png" : "/flags/china.png"}
            alt="Player 2 Flag"
            width={100}
            height={100}
            className="mr-2 w-[1em] h-[1em]"
          />
          {isSwapped
            ? `${matchData.players[0].firstName} ${matchData.players[0].lastName}`
            : `${matchData.players[1].firstName} ${matchData.players[1].lastName}`}
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-8">
        {/* Player 1 Controls and Info */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-6xl md:text-6xl lg:text-6xl"
            onClick={() => incrementScore(isSwapped ? 2 : 1)}
          >
            +
          </Button>
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-6xl md:text-6xl lg:text-6xl"
            onClick={() => decrementScore(isSwapped ? 2 : 1)}
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
                {isSwapped ? player2Games : player1Games}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl">
                Score
              </h3>
              <p
                className={`text-4xl sm:text-5xl md:text-7xl lg:text-13xl font-bold ${getScoreColor(
                  player1Score,
                  player1Score,
                  player2Score
                )}`}
              >
                {isSwapped ? player2Score : player1Score}
              </p>
            </div>
          </div>
        </div>

        {/* Player 2 Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center space-y-4 p-2 md:p-4">
          <div className="flex items-start justify-center space-x-4 md:space-x-8">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl">
                Score
              </h3>
              <p
                className={`text-4xl sm:text-5xl md:text-7xl lg:text-13xl font-bold ${getScoreColor(
                  player2Score,
                  player2Score,
                  player1Score
                )}`}
              >
                {isSwapped ? player1Score : player2Score}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl">
                Set
              </h3>
              <p className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl">
                {isSwapped ? player1Games : player2Games}
              </p>
            </div>
          </div>
        </div>

        {/* Player 2 Controls */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-6xl md:text-6xl lg:text-6xl"
            onClick={() => incrementScore(isSwapped ? 1 : 2)}
          >
            +
          </Button>
          <Button
            className="bg-white text-black w-14 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-28 lg:h-24 text-lg sm:text-6xl md:text-6xl lg:text-6xl"
            onClick={() => decrementScore(isSwapped ? 1 : 2)}
          >
            -
          </Button>
        </div>
      </div>

      {/* Dialog-like Button Next Set */}
      {setWinnerState && !winner && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {setWinnerState} wins the set!
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

      {/* Dialog-like Button Match Finished */}
      {winner && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Match Finished - {winner} wins!
            </h3>
            <Button
              className="bg-white text-black text-lg sm:text-xl md:text-2xl lg:text-3xl p-4"
              onClick={() => router.back()}
            >
              GO HOME
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
              player1Score === 11 || player1Score - player2Score >= 2
                ? "text-green-500"
                : "text-red-500";
            const player2Color =
              player2Score === 11 || player2Score - player1Score >= 2
                ? "text-green-500"
                : "text-red-500";
            return (
              <div key={index} className="flex flex-col items-center">
                <h4 className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  Set {index + 1}
                </h4>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  {isSwapped ? (
                    <>
                      <span className={player2Color}>{player2}</span> -{" "}
                      <span className={player1Color}>{player1}</span>
                    </>
                  ) : (
                    <>
                      <span className={player1Color}>{player1}</span> -{" "}
                      <span className={player2Color}>{player2}</span>
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Type Modal */}
      {showModal && <MatchTypeModal onSelect={handleMatchTypeSelect} />}
    </div>
  );
}
