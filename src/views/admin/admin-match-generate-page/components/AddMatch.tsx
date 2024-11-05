import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Player, Group, Match } from "./types";
import MatchSchedule from "./MatchSchedule";
import GroupsAndPlayers from "./GroupsAndPlayers";
import roundNames from "./constants/roundNames";
import knockoutPatterns from "./constants/knockoutPatterns";
import axios from "axios";

export default function AddMatch() {
  const [playersData, setPlayersData] = useState<Record<string, Player>>({});
  const [groupsData, setGroupsData] = useState<Group[]>([]);
  const [tableCount, setTableCount] = useState<number>(12);
  const [totalPlayersFetched, setTotalPlayersFetched] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [matchSchedule, setMatchSchedule] = useState<Match[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [knockoutStages, setKnockoutStages] = useState<Record<string, number>>(
    {}
  );
  const [initialKnockoutStages, setInitialKnockoutStages] = useState<
    Record<string, number>
  >({});
  const [lastTable, setLastTable] = useState<number>(0);
  const [lastTime, setLastTime] = useState<Date>(new Date());
  console.log("lastTime", lastTime);

  const router = useRouter();
  const { id: tournament_id } = router.query;

  const generateMatchSchedule = useCallback(
    async (groups: Group[], players: Record<string, Player>) => {
      try {
        const response = await axios.post(
          `/api/admin/generate-matches/generate-schedule`,
          {
            groups,
            players,
            tableCount,
          }
        );

        console.log("Response:", response.data);

        if (response.status === 200) {
          const {
            schedule,
            knockoutStages,
            initialKnockoutStages,
            lastTable,
            lastTime,
          } = response.data;
          setMatchSchedule(schedule);
          setKnockoutStages(knockoutStages);
          setInitialKnockoutStages(initialKnockoutStages);
          setLastTable(lastTable);
          setLastTime(lastTime);
        } else {
          console.error(
            "Error generating match schedule:",
            response.data.error
          );
        }
      } catch (error) {
        console.error("Error generating match schedule:", error);
      }
    },
    [tableCount]
  );

  const fetchGroupsAndPlayers = useCallback(
    async (tournamentId: string) => {
      try {
        const response = await axios.get(
          `/api/admin/generate-matches/fetch-groups-players`,
          {
            params: { tournamentId },
          }
        );

        if (response.status === 200) {
          const { groups, allPlayersData } = response.data;

          setGroupsData(groups);
          setTotalPlayersFetched(Object.keys(allPlayersData).length);
          setPlayersData(allPlayersData);
          generateMatchSchedule(groups, allPlayersData);
          console.log("Groups and players fetched:", groups, allPlayersData);
          setLoading(false);
        } else {
          console.error(
            "Error fetching groups and players:",
            response.data.error
          );
        }
      } catch (error) {
        console.error("Error fetching groups and players:", error);
      }
    },
    [generateMatchSchedule]
  );

  useEffect(() => {
    const fetchTournamentData = async (tournamentId: string) => {
      try {
        const response = await axios.get(
          `/api/admin/generate-matches/fetch-tournaments`,
          {
            params: { tournamentId },
          }
        );

        if (response.status === 200) {
          const tournamentData = response.data;
          setTableCount(tournamentData.table_count || 12);
          await fetchGroupsAndPlayers(tournamentId);
        } else {
          console.error("Error fetching tournament data:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching tournament data:", error);
      }
    };

    if (tournament_id) {
      fetchTournamentData(tournament_id as string);
    }
  }, [tournament_id, fetchGroupsAndPlayers]);

  const addKnockoutRound = async (division: string) => {
    if (!division) return;

    try {
      const response = await axios.post(
        `/api/admin/generate-matches/generate-knockout`,
        {
          division,
          matchSchedule,
          knockoutStages,
          initialKnockoutStages,
          roundNames,
          knockoutPatterns,
          groupsData,
          tableCount,
          lastTable,
        }
      );

      const { schedule, knockoutStages: updatedKnockoutStages } = response.data;
      setMatchSchedule(schedule);
      setKnockoutStages(updatedKnockoutStages);
    } catch (error) {
      console.error("Error adding knockout round:", error);
    }
  };

  const calculateKnockoutStageSize = (numGroups: number): number => {
    if (numGroups > 16 && numGroups <= 32) return 64;
    if (numGroups > 8 && numGroups <= 16) return 32;
    if (numGroups > 4 && numGroups <= 8) return 16;
    return 8;
  };

  // Function to submit the match schedule to Firestore
  const submitMatchSchedule = async () => {
    if (!tournament_id) {
      console.error("Tournament ID is missing");
      return;
    }

    try {
      setLoading(true); // Show loading indicator while submitting

      const response = await axios.post(
        `/api/admin/generate-matches/submit-schedule`,
        {
          tournamentId: tournament_id,
          matchSchedule: matchSchedule.map((match) => ({
            match_id: match.match_id,
            time: match.time,
            table: match.table,
            players: match.players.map((player) => ({
              ...player,
              sets: 0, // Initialize sets to 0 for each player
            })),
            group: match.group,
            division: match.division,
            nextmatch_id: match.nextmatch_id || null, // Optional, only if it exists
            matchType: "Best of 3", // Default value
          })),
        }
      );

      if (response.status === 200) {
        alert("Match schedule successfully submitted!");
        router.back(); // Navigate back to the previous page
      } else {
        console.error("Error submitting match schedule:", response.data.error);
        alert("Failed to submit match schedule.");
      }
    } catch (error) {
      console.error("Error submitting match schedule:", error);
      alert("Failed to submit match schedule.");
    } finally {
      setLoading(false); // Hide loading indicator after submitting
    }
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
            <GroupsAndPlayers
              groupsData={groupsData}
              playersData={playersData}
              calculateKnockoutStageSize={calculateKnockoutStageSize}
            />
          </div>
          <div className="mt-4">
            <strong>Total Players Fetched: {totalPlayersFetched}</strong>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold">Match Schedule</h2>
            <MatchSchedule matchSchedule={matchSchedule} />
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold">Add Knockout Round</h2>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="">Select Division</option>
              {Object.keys(knockoutStages).map((division) => (
                <option key={division} value={division}>
                  {division} ({knockoutStages[division]})
                </option>
              ))}
            </select>
            <button
              onClick={() => addKnockoutRound(selectedDivision)}
              disabled={!selectedDivision}
            >
              Add Knockout Round
            </button>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold">Submit Match Schedule</h2>
            <button
              onClick={submitMatchSchedule}
              disabled={loading || matchSchedule.length === 0}
            >
              {loading ? "Submitting..." : "Submit Schedule"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
