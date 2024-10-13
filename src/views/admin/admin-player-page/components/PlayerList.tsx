import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDocs, collection, query, where } from "firebase/firestore";
import db from "@/services/firestore";
import { AddPlayer } from "./AddPlayer"; // Import AddPlayer component

interface Player {
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_id?: string;
  team_name?: string; // Allow team_name to be undefined
}

const PlayerListPage: React.FC = () => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentName, setTournamentName] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!tournament_id) return;
      const q = query(
        collection(db, "players"),
        where("tournament_id", "==", tournament_id)
      );
      const snapshot = await getDocs(q);
      const playerList = snapshot.docs.map((doc) => doc.data() as Player);
      setPlayers(playerList);
    };

    const fetchTournamentName = async () => {
      const docRef = collection(db, "tournaments");
      const snapshot = await getDocs(docRef);
      const tournament = snapshot.docs.find((doc) => doc.id === tournament_id);
      if (tournament) setTournamentName(tournament.data().tournament_name);
    };

    fetchPlayers();
    fetchTournamentName();
  }, [tournament_id]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{tournamentName} - Player List</h1>
        {/* AddPlayer button on the right */}
        <AddPlayer setPlayers={setPlayers} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-lg rounded-lg border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Firstname
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Lastname
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Nationality
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Date of Birth
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Team
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.length > 0 ? (
              players.map((player, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                    {player.firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    {player.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    {player.nationality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    {player.dob}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    {player.team_name || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No players have been added to this tournament yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerListPage;
