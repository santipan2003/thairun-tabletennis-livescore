import React, { useEffect, useState, useCallback } from "react";
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
import { Player } from "@/types";

const PlayerListPage: React.FC = () => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [category, setCategory] = useState("");
  const [division, setDivision] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(players.length / itemsPerPage);

  // Fetch players from Firestore
  const fetchPlayers = useCallback(async () => {
    if (!tournament_id) return;
    const playerCollection = collection(
      db,
      `tournaments/${tournament_id}/players`
    );
    const snapshot = await getDocs(playerCollection);
    const playerList = snapshot.docs.map((doc) => doc.data() as Player);

    // Group players by their group
    const groupedPlayers: { [key: string]: Player[] } = {};
    playerList.forEach((player) => {
      const group = player.group ?? "Not Assigned";
      if (!groupedPlayers[group]) {
        groupedPlayers[group] = [];
      }
      groupedPlayers[group].push(player);
    });

    // Sort each group by rank_score in descending order
    Object.keys(groupedPlayers).forEach((group) => {
      groupedPlayers[group].sort(
        (a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0)
      );
    });

    // Flatten the sorted groups back into a single array
    const sortedPlayers = Object.values(groupedPlayers).flat();
    setPlayers(sortedPlayers);

    if (playerList.length > 0) {
      setCategory(playerList[0].category);
      setDivision(playerList[0].division);
    }
  }, [tournament_id]);

  // Fetch tournament name
  const fetchTournamentName = useCallback(async () => {
    const tournamentRef = collection(db, "tournaments");
    const snapshot = await getDocs(tournamentRef);
    const tournament = snapshot.docs.find((doc) => doc.id === tournament_id);
    if (tournament) setTournamentName(tournament.data().tournament_name);
  }, [tournament_id]);

  useEffect(() => {
    fetchPlayers();
    fetchTournamentName();
  }, [tournament_id, fetchPlayers, fetchTournamentName]);

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
        <h1 className="text-2xl font-bold">
          {tournamentName} - Player List ({category}, {division})
        </h1>
        <AddPlayer setPlayers={setPlayers} onSuccess={fetchPlayers} />
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
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Rank Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Ranking No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300">
                Group
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
                    {player.rank_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                    {player.rank_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                    {player.group}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
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
