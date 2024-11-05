import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import db from "@/services/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

const MatchList: React.FC = () => {
  const [tournamentName, setTournamentName] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const fetchTournamentDetails = async (tournamentId: string) => {
    try {
      const tournamentDoc = doc(db, "tournaments", tournamentId);
      const tournamentSnap = await getDoc(tournamentDoc);
      if (tournamentSnap.exists()) {
        setTournamentName(tournamentSnap.data().tournament_name);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    }
  };

  const fetchMatches = async (tournamentId: string) => {
    try {
      const matchesCollection = collection(
        db,
        "tournaments",
        tournamentId,
        "matches"
      );
      const matchesSnapshot = await getDocs(matchesCollection);

      const matchList = matchesSnapshot.docs
        .map((doc) => {
          const matchData = doc.data() as Match;
          matchData.id = doc.id; // Store the document ID

          // Check if time is a Firestore Timestamp and convert it if necessary
          if (matchData.time instanceof Timestamp) {
            matchData.time = matchData.time.toDate().toISOString();
          } else if (typeof matchData.time === "string") {
            matchData.time = matchData.time;
          } else {
            matchData.time = null;
          }
          return matchData;
        })
        .sort((a, b) => parseInt(a.match_id) - parseInt(b.match_id));

      setMatches(matchList);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  useEffect(() => {
    if (tournament_id) {
      fetchTournamentDetails(tournament_id as string);
      fetchMatches(tournament_id as string);
    } else {
      console.log("No tournament ID in query");
    }
  }, [tournament_id]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{tournamentName} - Grouping</h1>
        {tournament_id && (
          <Link href={`/admin/generate-matches/${tournament_id}`} passHref>
            <Button variant="default">Generate Match</Button>
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Match ID
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Time
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Table
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Match
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Group
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Division
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Next Match ID
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Match Type
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => {
              const isByeMatch =
                match.players[0].firstName === "BYE" ||
                match.players[1].firstName === "BYE";
              return (
                <tr
                  key={match.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td
                    className={`py-4 px-6 border-b text-sm ${
                      isByeMatch ? "font-bold text-red-600" : "text-gray-800"
                    }`}
                  >
                    {match.match_id}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-800 text-sm">
                    {isByeMatch ? (
                      <span className="font-bold text-red-600">NO MATCH</span>
                    ) : match.time ? (
                      // Convert Timestamp to Date if necessary, else use the string directly
                      new Date(
                        match.time instanceof Timestamp
                          ? match.time.toDate()
                          : match.time
                      ).toLocaleString()
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td className="py-4 px-6 border-b text-gray-800 text-sm">
                    {isByeMatch ? (
                      <span className="font-bold text-red-600">NO MATCH</span>
                    ) : match.table !== null ? (
                      match.table
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-800 text-sm font-medium">
                    {match.players[0] ? (
                      <>
                        <span
                          className={
                            match.players[0].firstName === "BYE"
                              ? "text-red-600 font-bold"
                              : ""
                          }
                        >
                          {match.players[0].firstName}
                        </span>{" "}
                        {match.players[0].lastName && match.players[0].lastName}{" "}
                        {match.players[0].team_name && (
                          <>({match.players[0].team_name})</>
                        )}{" "}
                        <span className="text-blue-600 font-bold">vs</span>{" "}
                        {match.players[1] ? (
                          <>
                            <span
                              className={
                                match.players[1].firstName === "BYE"
                                  ? "text-red-600 font-bold"
                                  : ""
                              }
                            >
                              {match.players[1].firstName}
                            </span>{" "}
                            {match.players[1].lastName &&
                              match.players[1].lastName}{" "}
                            {match.players[1].team_name && (
                              <>({match.players[1].team_name})</>
                            )}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-800 text-sm">
                    {match.group}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-800 text-sm">
                    {match.division}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-800 text-sm">
                    {match.nextmatch_id || "N/A"}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-800 text-sm">
                    {match.matchType || "N/A"}
                  </td>
                  <td className="py-4 px-6 border-b text-gray-800 text-sm">
                    <Link href={`/admin/scores/${match.id}`} passHref>
                      <Button variant="default">LIVE!</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchList;
