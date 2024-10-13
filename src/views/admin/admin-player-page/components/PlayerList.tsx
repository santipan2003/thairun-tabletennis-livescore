import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDocs, collection } from "firebase/firestore";
import db from "@/services/firestore";
import { AddPlayer } from "./AddPlayer";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Shadcn pagination components

interface Player {
  player_id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_id?: string;
  team_name?: string;
  category: string;
  division: string;
}

const PlayerListPage: React.FC = () => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(players.length / itemsPerPage);

  // Fetch players from Firestore
  const fetchPlayers = async () => {
    if (!tournament_id) return;
    const playerCollection = collection(
      db,
      `tournaments/${tournament_id}/players`
    );
    const snapshot = await getDocs(playerCollection);
    const playerList = snapshot.docs.map((doc) => doc.data() as Player);
    setPlayers(playerList);
  };

  // Fetch tournament name
  const fetchTournamentName = async () => {
    const tournamentRef = collection(db, "tournaments");
    const snapshot = await getDocs(tournamentRef);
    const tournament = snapshot.docs.find((doc) => doc.id === tournament_id);
    if (tournament) setTournamentName(tournament.data().tournament_name);
  };

  useEffect(() => {
    fetchPlayers();
    fetchTournamentName();
  }, [tournament_id]);

  const paginatedPlayers = players.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{tournamentName} - Player List</h1>
        <AddPlayer setPlayers={setPlayers} onSuccess={fetchPlayers} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-lg rounded-lg border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Player ID
              </th>
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
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Division
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPlayers.length > 0 ? (
              paginatedPlayers.map((player, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                    {player.player_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    {player.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    {player.division}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No players have been added to this tournament yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls using Shadcn Pagination */}
      <Pagination className="mt-4">
        {currentPage > 1 && (
          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </PaginationPrevious>
        )}
        <PaginationContent>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => handlePageChange(index + 1)}
                className={index + 1 === currentPage ? "font-bold" : ""}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          {totalPages > 5 && <PaginationEllipsis />}
        </PaginationContent>
        {currentPage < totalPages && (
          <PaginationNext onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </PaginationNext>
        )}
      </Pagination>
    </div>
  );
};

export default PlayerListPage;
