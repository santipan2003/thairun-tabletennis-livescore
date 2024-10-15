import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDocs, collection } from "firebase/firestore";
import db from "@/services/firestore";
import { Player } from "@/pages/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/router";

interface Group {
  name: string;
  players: Player[];
}

const AddGroup: React.FC = () => {
  const router = useRouter();
  const { id: tournamentId } = router.query;

  const [categories, setCategories] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [canGenerate, setCanGenerate] = useState(false);

  const fetchPlayerData = async () => {
    const playerCollection = collection(
      db,
      `tournaments/${tournamentId}/players`
    );
    const snapshot = await getDocs(playerCollection);
    const playerList = snapshot.docs.map((doc) => doc.data() as Player);

    const uniqueCategories = Array.from(
      new Set(playerList.map((player) => player.category))
    );
    const uniqueDivisions = Array.from(
      new Set(playerList.map((player) => player.division))
    );

    setCategories(uniqueCategories);
    setDivisions(uniqueDivisions);
    setPlayers(playerList);
  };

  useEffect(() => {
    if (tournamentId) {
      fetchPlayerData();
    }
  }, [tournamentId]);

  useEffect(() => {
    setCanGenerate(
      selectedCategories.length > 0 && selectedDivisions.length > 0
    );
  }, [selectedCategories, selectedDivisions]);

  const generateGroups = () => {
    const filteredPlayers = players.filter(
      (player) =>
        selectedCategories.includes(player.category) &&
        selectedDivisions.includes(player.division)
    );

    const groupedPlayers = filteredPlayers.reduce((acc, player) => {
      const groupName = player.group || "Unassigned";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(player);
      return acc;
    }, {} as Record<string, Player[]>);

    const generatedGroups: Group[] = Object.entries(groupedPlayers).map(
      ([groupName, groupPlayers]) => ({
        name: groupName,
        players: groupPlayers.sort(
          (a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0)
        ),
      })
    );

    setGroups(generatedGroups);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Generate Group</h1>

      <div className="space-y-6">
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-2">Category</label>
          <Select
            multiple
            onValueChange={(values) => setSelectedCategories(values)}
          >
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
          <Select
            multiple
            onValueChange={(values) => setSelectedDivisions(values)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select divisions" />
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

      {canGenerate && (
        <div className="mt-8 flex justify-end">
          <Button onClick={generateGroups} variant="default">
            Generate Group
          </Button>
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Generated Groups</h2>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto"
            style={{ maxHeight: "500px" }}
          >
            {groups.map((group) => (
              <Card
                key={group.name}
                className="shadow-lg border border-gray-200 rounded-2xl"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    {group.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {group.players.length > 0 ? (
                    <ul>
                      {group.players.map((player) => (
                        <li key={player.player_id} className="text-sm">
                          {player.firstName} {player.lastName} -{" "}
                          {player.nationality} (Score:{" "}
                          {typeof player.rank_score === "number"
                            ? player.rank_score.toFixed(2)
                            : player.rank_score}
                          )
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No players in this group.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGroup;
