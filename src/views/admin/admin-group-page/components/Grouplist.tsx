import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import db from "@/services/firestore";
import { Player } from "@/pages/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
            .sort((a, b) => b.rank_score - a.rank_score); // Sort descending

          return { ...groupData, players } as Group;
        })
      );

      fetchedGroups.sort((a, b) => a.group_id - b.group_id);
      setGroups(fetchedGroups);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{tournamentName} - Grouping</h1>
        <Link href={`/admin/generate-groups/${tournament_id}`} passHref>
          <Button variant="default">Generate Group</Button>
        </Link>
      </div>

      <Card className="shadow-lg border border-gray-300 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Groups Overview</CardTitle>
          {groups.length > 0 && (
            <p className="text-sm text-gray-500">
              Category: {groups[0].category} | Division: {groups[0].division}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {groups.map((group) => (
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
                  <CardContent className="space-y-4">
                    {group.players.length > 0 ? (
                      <ul className="space-y-4">
                        {group.players.map((player) => (
                          <li key={player.player_id}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {player.rank_number}
                                </Badge>
                                <div>
                                  <span className="font-medium">
                                    {player.firstName} {player.lastName}
                                  </span>
                                  <p className="text-sm text-gray-500">
                                    {player.nationality}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p>
                                  Score: {(player.rank_score ?? 0).toFixed(2)}
                                </p>
                                <p>
                                  M: {player.matches} | W: {player.wins} | L:{" "}
                                  {player.losses} | +/-: {player.points_diff}
                                </p>
                              </div>
                            </div>
                            <Separator className="my-2" />
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