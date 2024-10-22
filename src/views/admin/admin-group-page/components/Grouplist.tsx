import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import db from "@/services/firestore";
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlayerWithStats extends Player {
  matches: number;
  wins: number;
  losses: number;
  points_diff: number;
}

interface Group {
  group_name: string;
  players: PlayerWithStats[];
  category: string;
  division: string;
  group_id: number;
}

const GroupListPage: React.FC = () => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [groups, setGroups] = useState<Group[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  // ดึงข้อมูล groups และผู้เล่น
  const fetchGroupsWithPlayers = async (tournamentId: string) => {
    try {
      const groupCollection = collection(
        db,
        `tournaments/${tournamentId}/groups`
      );
      const groupSnapshot = await getDocs(groupCollection);

      const fetchedGroups = await Promise.all(
        groupSnapshot.docs.map(async (groupDoc) => {
          const groupData = groupDoc.data() as Omit<Group, "players">;

          const playersCollection = collection(
            db,
            `tournaments/${tournamentId}/groups/${groupDoc.id}/players`
          );
          const playersSnapshot = await getDocs(playersCollection);

          const players = playersSnapshot.docs
            .map((playerDoc) => {
              const playerData = playerDoc.data() as PlayerWithStats;
              return {
                ...playerData,
                rank_score: parseFloat(
                  playerData.rank_score?.toString() || "0"
                ),
              };
            })
            .sort((a, b) => b.rank_score - a.rank_score);

          return { ...groupData, players } as Group;
        })
      );

      fetchedGroups.sort((a, b) => a.group_id - b.group_id);
      setGroups(fetchedGroups);

      // Log the fetched groups
      console.log("Fetched Groups:", fetchedGroups);

      // Extract categories and divisions
      const uniqueCategories = Array.from(
        new Set(fetchedGroups.map((group) => group.category))
      );
      setCategories(uniqueCategories);
      setSelectedCategory(uniqueCategories[0] || ""); // Default selection

      const uniqueDivisions = Array.from(
        new Set(fetchedGroups.map((group) => group.division))
      );
      setDivisions(uniqueDivisions);
      setSelectedDivision(uniqueDivisions[0] || ""); // Default selection
    } catch (error) {
      console.error("Error fetching groups and players:", error);
    }
  };

  const fetchTournamentDetails = async (tournamentId: string) => {
    try {
      const tournamentDoc = doc(db, "tournaments", tournamentId);
      const tournamentSnap = await getDoc(tournamentDoc);
      if (tournamentSnap.exists()) {
        setTournamentName(tournamentSnap.data().tournament_name);
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    }
  };

  useEffect(() => {
    if (tournament_id) {
      fetchGroupsWithPlayers(tournament_id as string);
      fetchTournamentDetails(tournament_id as string);
    }
  }, [tournament_id]);

  // Filter groups by selected category and division
  const filteredGroups = groups.filter(
    (group) =>
      group.category === selectedCategory && group.division === selectedDivision
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{tournamentName} - Grouping</h1>
        <Link href={`/admin/generate-groups/${tournament_id}`} passHref>
          <Button variant="default">Generate Group</Button>
        </Link>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-2">Category</label>
          <Select onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
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
          <Select onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-lg border border-gray-300 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Groups Overview</CardTitle>
          {filteredGroups.length > 0 && (
            <p className="text-sm text-gray-500">
              Category: {selectedCategory} | Division: {selectedDivision}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredGroups.map((group) => (
                <Card
                  key={group.group_id}
                  className="shadow-md border border-gray-200 rounded-xl"
                >
                  <CardHeader>
                    <CardTitle className="text-md font-bold">
                      {group.group_name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {group.category} | {group.division}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="border-b pb-2 text-center">Rank</th>
                          <th className="border-b pb-2 text-center">Player</th>
                          <th className="border-b pb-2 text-center">M</th>
                          <th className="border-b pb-2 text-center">W</th>
                          <th className="border-b pb-2 text-center">L</th>
                          <th className="border-b pb-2 text-center">+/-</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.players.map((player) => (
                          <tr
                            key={player.player_id}
                            className="hover:bg-gray-50"
                          >
                            <td className="py-2 text-center">
                              <Badge variant="outline">
                                {player.rank_number}
                              </Badge>
                            </td>
                            <td className="py-2 text-center">
                              {player.firstName} {player.lastName}
                              <p className="text-sm text-gray-500">
                                {player.nationality}
                              </p>
                            </td>
                            <td className="py-2 text-center">
                              {player.matches}
                            </td>
                            <td className="py-2 text-center">{player.wins}</td>
                            <td className="py-2 text-center">
                              {player.losses}
                            </td>
                            <td className="py-2 text-center">
                              {player.points_diff}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No groups found for this tournament.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupListPage;
