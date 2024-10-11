import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import db from "@/services/firestore";
import { AddPlayer } from "./AddPlayer"; // Import AddPlayer component

interface Player {
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_id?: string;
}

interface Team {
  id: string;
  team_name: string;
}

const PlayerListPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ [key: string]: Team }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      const teamData: { [key: string]: Team } = {};
      const teamCollection = collection(db, "teams");
      const teamSnapshot = await getDocs(teamCollection);
      teamSnapshot.docs.forEach((doc) => {
        const team = { id: doc.id, ...doc.data() } as Team;
        teamData[team.team_name] = team;
      });
      setTeams(teamData);
      setLoading(false);
    };

    const fetchPlayers = async () => {
      const playerCollection = collection(db, "players");
      const playerSnapshot = await getDocs(playerCollection);
      const playerList = playerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Player[];
      setPlayers(playerList);
    };

    fetchTeams();
    fetchPlayers();
  }, []);

  if (loading) {
    return <p>Loading teams...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Player List</h1>
      {/* Add Player Section */}
      <div className="flex justify-end mt-4">
        <AddPlayer setPlayers={setPlayers} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full w-full divide-y divide-gray-200 bg-white shadow-lg rounded-lg border border-gray-300">
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
            {players.map((player, index) => (
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
                  {teams[player.team_id]?.team_name || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerListPage;
