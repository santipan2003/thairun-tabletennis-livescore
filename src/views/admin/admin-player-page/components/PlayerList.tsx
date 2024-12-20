import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
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
import { Player } from "@/types"; // Import the Player interface
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

const PlayerListPage: React.FC = () => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch players from Firestore
  const fetchPlayers = useCallback(async () => {
    if (!tournament_id) return;

    try {
      const response = await axios.get(`/api/admin/players/fetch-players`, {
        params: { tournament_id },
      });

      const { players, categories, divisions } = response.data;

      setPlayers(players);
      setCategories(categories);
      setDivisions(divisions);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }, [tournament_id]);

  // Fetch tournament name
  const fetchTournamentName = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/players/fetch-tournaments`, {
        params: { tournament_id },
      });

      const { tournamentName } = response.data;
      if (tournamentName) setTournamentName(tournamentName);
    } catch (error) {
      console.error("Error fetching tournament name:", error);
    }
  }, [tournament_id]);

  useEffect(() => {
    fetchPlayers();
    fetchTournamentName();
  }, [tournament_id, fetchPlayers, fetchTournamentName]);

  useEffect(() => {
    // Filter divisions based on selected categories
    if (selectedCategories.length === 0) {
      setFilteredDivisions(divisions);
    } else {
      const filtered = players
        .filter((player) => selectedCategories.includes(player.category))
        .map((player) => player.division);
      setFilteredDivisions(Array.from(new Set(filtered)));
    }
  }, [selectedCategories, divisions, players]);

  const filteredPlayers = players.filter(
    (player) =>
      (selectedCategories.length === 0 ||
        selectedCategories.includes(player.category)) &&
      (selectedDivisions.length === 0 ||
        selectedDivisions.includes(player.division))
  );

  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{tournamentName} - Player List</h1>
        <AddPlayer setPlayers={setPlayers} onSuccess={fetchPlayers} />
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-2">Category</label>
          <Select onValueChange={(value) => setSelectedCategories([value])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-2">Division</label>
          <Select onValueChange={(value) => setSelectedDivisions([value])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select divisions" />
            </SelectTrigger>
            <SelectContent>
              {filteredDivisions.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
