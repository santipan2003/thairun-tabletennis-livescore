import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { getDocs, collection, addDoc } from "firebase/firestore";
import db from "@/services/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Player {
  player_id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_name?: string;
  category: string;
  division: string;
  rank_score?: number;
  rank_number?: number;
  group?: string;
}

interface PlayerWithStats extends Player {
  matches: number;
  wins: number;
  losses: number;
  points_diff: number; // Points difference (e.g., +/- score)
}

interface Group {
  group_id: number;
  name: string;
  players: PlayerWithStats[];
  category: string;
  division: string;
}

const AddGroup: React.FC = () => {
  const router = useRouter();
  const { id: tournamentId } = router.query;

  const [categories, setCategories] = useState<string[]>(["youth", "general"]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [canGenerate, setCanGenerate] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  // Fetch player data from Firestore
  const fetchPlayerData = useCallback(async () => {
    const playerCollection = collection(
      db,
      `tournaments/${tournamentId}/players`
    );
    const snapshot = await getDocs(playerCollection);
    const playerList = snapshot.docs.map((doc) => {
      const data = doc.data() as Player;
      return {
        ...data,
        player_id: doc.id,
        matches: 0,
        wins: 0,
        losses: 0,
        points_diff: 0, // Default value
      };
    }) as PlayerWithStats[];

    const uniqueCategories = Array.from(
      new Set(playerList.map((player) => player.category))
    );
    const uniqueDivisions = Array.from(
      new Set(playerList.map((player) => player.division))
    );

    setCategories(uniqueCategories);
    setDivisions(uniqueDivisions);
    setPlayers(playerList);
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId) {
      fetchPlayerData();
    }
  }, [tournamentId, fetchPlayerData]);

  useEffect(() => {
    setCanGenerate(
      selectedCategories.length > 0 && selectedDivisions.length > 0
    );
  }, [selectedCategories, selectedDivisions]);

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

  // Generate groups based on the same group value
  const generateGroups = () => {
    const filteredPlayers = players.filter(
      (player) =>
        selectedCategories.includes(player.category) &&
        selectedDivisions.includes(player.division)
    );

    const groupedPlayers = filteredPlayers.reduce((acc, player) => {
      const groupId = parseInt(player.group?.toString() ?? "0");
      if (!acc[groupId]) acc[groupId] = [];
      acc[groupId].push(player);
      return acc;
    }, {} as Record<number, PlayerWithStats[]>);

    const generatedGroups: Group[] = Object.entries(groupedPlayers)
      .map(([groupId, groupPlayers]) => ({
        group_id: parseInt(groupId),
        name: `Group ${groupId}`,
        players: groupPlayers.sort(
          (a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0)
        ),
        category: groupPlayers[0]?.category || "N/A",
        division: groupPlayers[0]?.division || "N/A",
      }))
      .sort((a, b) => a.group_id - b.group_id);

    setGroups(generatedGroups);
  };

  // Submit generated groups to Firestore with loading state
  const submitGroups = async () => {
    setLoading(true); // Set loading to true when submission starts
    try {
      const groupCollection = collection(
        db,
        `tournaments/${tournamentId}/groups`
      );

      for (const group of groups) {
        const groupDoc = await addDoc(groupCollection, {
          group_id: group.group_id,
          group_name: group.name,
          category: group.category,
          division: group.division,
          players: group.players.map((player) => player.player_id),
        });

        const playerCollection = collection(
          db,
          `tournaments/${tournamentId}/groups/${groupDoc.id}/players`
        );

        for (const player of group.players) {
          await addDoc(playerCollection, { ...player });
        }
      }

      alert("Groups submitted successfully!");
      router.back();
    } catch (error) {
      console.error("Error submitting groups:", error);
      alert("Failed to submit groups.");
    } finally {
      setLoading(false); // Set loading back to false after submission
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Generate Group</h1>

      <div className="space-y-6">
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

      {canGenerate && (
        <div className="mt-8 flex justify-end">
          <Button onClick={generateGroups}>Generate Group</Button>
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Generated Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card
                key={group.group_id}
                className="shadow-md border border-gray-200 rounded-xl"
              >
                <CardHeader>
                  <CardTitle className="text-md font-bold">
                    {group.name}
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
                        <tr key={player.player_id} className="hover:bg-gray-50">
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
                          <td className="py-2 text-center">{player.matches}</td>
                          <td className="py-2 text-center">{player.wins}</td>
                          <td className="py-2 text-center">{player.losses}</td>
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

          <div className="mt-8 flex justify-end">
            {/* Show loading state while submitting */}
            <Button onClick={submitGroups} disabled={loading}>
              {loading ? "Submitting..." : "Submit Groups"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGroup;
