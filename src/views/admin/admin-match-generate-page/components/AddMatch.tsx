import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import db from "@/services/firestore";

interface Player {
  firstName: string;
  lastName: string;
  rank_score: number;
}

interface Group {
  group_id: number;
  group_name: string;
  division: string;
  players: string[];
  uniqueGroupId: string;
  id: string;
}

interface Match {
  time: Date;
  table: number;
  players: Player[];
  group: number;
  division: string;
}

export default function AddMatch(): JSX.Element {
  const [playersData, setPlayersData] = useState<Record<string, Player>>({}); // Store player data
  const [groupsData, setGroupsData] = useState<Group[]>([]); // Store group data
  const [tableCount, setTableCount] = useState<number>(12); // Store the number of tables (default to 12)
  const [totalPlayersFetched, setTotalPlayersFetched] = useState<number>(0); // Track total players fetched
  const [loading, setLoading] = useState<boolean>(true); // Track loading state
  const [matchSchedule, setMatchSchedule] = useState<Match[]>([]); // Store match schedule
  const router = useRouter();
  const { id: tournament_id } = router.query;

  useEffect(() => {
    if (tournament_id) {
      fetchTournamentData(tournament_id as string);
    }
  }, [tournament_id]);

  const fetchTournamentData = async (tournamentId: string): Promise<void> => {
    try {
      // Fetch tournament data to get table count
      const tournamentRef = doc(db, "tournaments", tournamentId);
      const tournamentSnap = await getDoc(tournamentRef);
      if (tournamentSnap.exists()) {
        setTableCount(tournamentSnap.data().table_count || 12); // Set table count (default to 12)
      }

      // Fetch group and player data
      await fetchGroupsAndPlayers(tournamentId);
    } catch (error) {
      console.error("Error fetching tournament data:", error);
    }
  };

  const fetchGroupsAndPlayers = async (tournamentId: string): Promise<void> => {
    try {
      const groupCollection = collection(
        db,
        "tournaments",
        tournamentId,
        "groups"
      );
      const groupSnapshot = await getDocs(groupCollection);
      const groups = groupSnapshot.docs.map((doc) => {
        const groupData = doc.data() as Group;
        const uniqueGroupId = `${groupData.division}-${doc.id}`; // Create unique identifier
        return {
          ...groupData,
          uniqueGroupId, // Add unique group ID based on division and group_id
          id: doc.id,
        };
      });

      console.log("Fetched Groups: ", groups); // Log group details for debugging
      setGroupsData(groups); // Store fetched groups in state

      // Fetch all players in one go
      const playerCollection = collection(
        db,
        "tournaments",
        tournamentId,
        "players"
      );
      const playerSnapshot = await getDocs(playerCollection);
      const allPlayersData = playerSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data() as Player;
        return acc;
      }, {} as Record<string, Player>);

      console.log("Fetched All Players Data: ", allPlayersData); // Log all fetched player data

      // Set the total number of players fetched
      setTotalPlayersFetched(Object.keys(allPlayersData).length);

      // Set players data
      setPlayersData(allPlayersData);

      // Generate match schedule
      generateMatchSchedule(groups, allPlayersData);

      // Set loading to false after fetching all players
      setLoading(false);
    } catch (error) {
      console.error("Error fetching groups and players:", error);
    }
  };

  const generateMatchSchedule = (
    groups: Group[],
    players: Record<string, Player>
  ): void => {
    const schedule: Match[] = [];
    const initialTime = new Date();
    initialTime.setHours(8, 30, 0, 0); // Set initial match time to 8:30 AM

    let currentTable = 1; // Start with the first table

    // Variables to store the final time and table
    let finalTime: Date | undefined;
    let finalTable: number | undefined;

    // Sort groups by group_id in ascending order
    const sortedGroups = [...groups].sort((a, b) => a.group_id - b.group_id);

    // Create an array to hold matches by index
    const matchesByIndex: {
      match: Player[];
      group: number;
      division: string;
    }[][] = [[], [], []];

    // Loop through each group and create matches for each group
    sortedGroups.forEach((group) => {
      const groupPlayers = group.players.map((playerId) => players[playerId]);
      const groupMatches: Player[][] = [];

      // Create matches based on group size
      if (groupPlayers.length === 3) {
        groupMatches.push([groupPlayers[0], groupPlayers[2]]);
        groupMatches.push([groupPlayers[0], groupPlayers[1]]);
        groupMatches.push([groupPlayers[1], groupPlayers[2]]);
      } else if (groupPlayers.length === 4) {
        groupMatches.push([groupPlayers[0], groupPlayers[2]]);
        groupMatches.push([groupPlayers[3], groupPlayers[1]]);
        groupMatches.push([groupPlayers[0], groupPlayers[1]]);
        groupMatches.push([groupPlayers[2], groupPlayers[3]]);
        groupMatches.push([groupPlayers[0], groupPlayers[3]]);
        groupMatches.push([groupPlayers[1], groupPlayers[2]]);
      }

      // Push matches into the corresponding index array
      if (groupPlayers.length === 3) {
        groupMatches.forEach((match, index) => {
          matchesByIndex[index].push({
            match,
            group: group.group_id,
            division: group.division,
          });
        });
      } else if (groupPlayers.length === 4) {
        matchesByIndex[0].push({
          match: groupMatches[0],
          group: group.group_id,
          division: group.division,
        });
        matchesByIndex[0].push({
          match: groupMatches[1],
          group: group.group_id,
          division: group.division,
        });
        matchesByIndex[1].push({
          match: groupMatches[2],
          group: group.group_id,
          division: group.division,
        });
        matchesByIndex[1].push({
          match: groupMatches[3],
          group: group.group_id,
          division: group.division,
        });
        matchesByIndex[2].push({
          match: groupMatches[4],
          group: group.group_id,
          division: group.division,
        });
        matchesByIndex[2].push({
          match: groupMatches[5],
          group: group.group_id,
          division: group.division,
        });
      }
    });

    // Schedule matches by iterating through the index arrays
    matchesByIndex.forEach((matches) => {
      matches.forEach(({ match, group, division }) => {
        schedule.push({
          time: new Date(initialTime),
          table: currentTable,
          players: match,
          group,
          division,
        });

        // Update final time and table
        finalTime = new Date(initialTime);
        finalTable = currentTable;

        console.log(
          `Scheduled match for group ${group} at table ${currentTable} on ${initialTime}`
        );

        // Move to the next table, or move to the next time slot if all tables are full
        currentTable++;
        if (currentTable > tableCount) {
          currentTable = 1; // Reset to the first table
          initialTime.setMinutes(initialTime.getMinutes() + 30); // Move to the next time slot
        }
      });
    });

    setMatchSchedule(schedule);

    // Log final time and table
    console.log("Final time:", finalTime);
    console.log("Final table:", finalTable);
  };

  const renderMatchSchedule = (): JSX.Element => {
    return (
      <table className="w-full border mb-4">
        <thead>
          <tr>
            <th>Time</th>
            <th>Table</th>
            <th>Match</th>
            <th>Group</th>
            <th>Division</th>
          </tr>
        </thead>
        <tbody>
          {matchSchedule.map((match, index) => (
            <tr key={index}>
              <td>{match.time.toLocaleTimeString()}</td>
              <td>{match.table}</td>
              <td>
                (<strong>{match.players[0]?.firstName || "Unknown"}</strong>{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {match.players[0]?.lastName || "Player"}
                </span>
                ) vs (
                <strong>{match.players[1]?.firstName || "Unknown"}</strong>{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {match.players[1]?.lastName || "Player"}
                </span>
                )
              </td>
              <td>{match.group}</td>
              <td>{match.division}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderGroupsAndPlayers = (): JSX.Element => {
    // Group the groups by division
    const divisions = groupsData.reduce<Record<string, Group[]>>(
      (acc, group) => {
        if (!acc[group.division]) {
          acc[group.division] = [];
        }
        acc[group.division].push(group);
        return acc;
      },
      {}
    );

    // Sort groups within each division by group_id
    Object.keys(divisions).forEach((division) => {
      divisions[division].sort((a, b) => a.group_id - b.group_id); // Sort by group_id
    });

    return (
      <>
        {Object.keys(divisions).map((division, divisionIndex) => (
          <div key={divisionIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">Division: {division}</h2>
            <div className="flex flex-wrap -mx-2">
              {divisions[division].map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 px-2 mb-4"
                >
                  <div className="bg-white p-4 border rounded shadow">
                    <h3 className="text-lg font-bold mb-2">
                      {group.group_name}
                    </h3>
                    <table className="w-full border mb-4">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.players.map((playerId, playerIndex) => {
                          const player = playersData[playerId];
                          return (
                            <tr key={playerIndex}>
                              <td>
                                {player
                                  ? `${player.firstName} ${player.lastName}`
                                  : "Unknown Player"}
                              </td>
                              <td>{player ? player.rank_score : "N/A"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="w-full">
      {loading ? (
        <div>Loading data...</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Fetched Data</h1>

          <div className="mb-4">
            <h2 className="text-xl font-bold">Groups and Players</h2>
            {renderGroupsAndPlayers()}
          </div>

          {/* Display total players fetched */}
          <div className="mt-4">
            <strong>Total Players Fetched: {totalPlayersFetched}</strong>
          </div>

          {/* Display match schedule */}
          <div className="mt-4">
            <h2 className="text-xl font-bold">Match Schedule</h2>
            {renderMatchSchedule()}
          </div>
        </>
      )}
    </div>
  );
}
