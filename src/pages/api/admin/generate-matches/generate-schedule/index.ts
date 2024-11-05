import { NextApiRequest, NextApiResponse } from "next";

// Define the Player interface
interface Player {
  id: string;
  firstName: string;
  lastName: string;
  rank_score: number;
  _isWinner: boolean | "pending";
  group: string;
  rank: number;
  nextmatch_id?: string | null;
}

// Define the Group interface
interface Group {
  group_id: number;
  division: string;
  players: string[]; // Array of player IDs (strings)
}

// Define the Match interface
interface Match {
  match_id: string;
  time: string | null; // Time is a string to use .toLocaleString()
  table: number | null;
  players: Player[];
  group: number;
  division: string;
  nextmatch_id?: string | null;
  matchType: string;
}

// Function to calculate the knockout stage size based on the number of groups
const calculateKnockoutStageSize = (numGroups: number): number => {
  if (numGroups > 16 && numGroups <= 32) return 64;
  if (numGroups > 8 && numGroups <= 16) return 32;
  if (numGroups > 4 && numGroups <= 8) return 16;
  return 8;
};

// Function to generate the match schedule
const generateMatchSchedule = (
  groups: Group[],
  players: Record<string, Player>,
  tableCount: number
): {
  schedule: Match[];
  knockoutStages: Record<string, number>;
  initialKnockoutStages: Record<string, number>;
  lastTable: number;
  lastTime: string; // Change to string to represent ISO 8601 format
} => {
  const schedule: Match[] = [];
  const initialTime = new Date();
  initialTime.setHours(8, 30, 0, 0); // Set the initial time to 8:30 AM

  let currentTable = 1;
  let matchCounter = 1;

  // Sort groups by group_id
  const sortedGroups = [...groups].sort((a, b) => a.group_id - b.group_id);
  const matchesByIndex: {
    match: Player[];
    group: number;
    division: string;
  }[][] = [[], [], []];

  // Generate matches for each group
  sortedGroups.forEach((group) => {
    const groupPlayers = group.players.map(
      (playerId: string) => players[playerId]
    );
    const groupMatches: Player[][] = [];

    // Generate matches for groups with 3 players
    if (groupPlayers.length === 3) {
      groupMatches.push([groupPlayers[0], groupPlayers[2]]);
      groupMatches.push([groupPlayers[0], groupPlayers[1]]);
      groupMatches.push([groupPlayers[1], groupPlayers[2]]);
    }
    // Generate matches for groups with 4 players
    else if (groupPlayers.length === 4) {
      groupMatches.push([groupPlayers[0], groupPlayers[2]]);
      groupMatches.push([groupPlayers[3], groupPlayers[1]]);
      groupMatches.push([groupPlayers[0], groupPlayers[1]]);
      groupMatches.push([groupPlayers[2], groupPlayers[3]]);
      groupMatches.push([groupPlayers[0], groupPlayers[3]]);
      groupMatches.push([groupPlayers[1], groupPlayers[2]]);
    }

    // Distribute matches into different indexes
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

  // Schedule matches
  matchesByIndex.forEach((matches) => {
    matches.forEach(({ match, group, division }) => {
      const match_id = matchCounter.toString().padStart(4, "0");
      schedule.push({
        match_id,
        time: new Date(initialTime).toLocaleString(), // Use .toLocaleString() for formatted time
        table: currentTable,
        players: match,
        group,
        division,
        nextmatch_id: null,
        matchType: "Best of 3",
      });

      currentTable++;
      if (currentTable > tableCount) {
        currentTable = 1;
        initialTime.setMinutes(initialTime.getMinutes() + 25);
      }

      matchCounter++;
    });
  });

  // Calculate knockout stages for each division
  const divisions = new Set(groups.map((group) => group.division));
  const knockoutStagesTemp: Record<string, number> = {};
  const initialKnockoutStagesTemp: Record<string, number> = {};

  divisions.forEach((division) => {
    const numGroups = groups.filter(
      (group) => group.division === division
    ).length;
    const knockoutStageSize = calculateKnockoutStageSize(numGroups);
    knockoutStagesTemp[division] = knockoutStageSize;
    initialKnockoutStagesTemp[division] = knockoutStageSize;
  });

  // Determine the last table and last time used in the schedule
  let lastTable = 0;
  let lastTime = "";
  if (schedule.length > 0) {
    const lastMatch = schedule[schedule.length - 1];
    lastTable = lastMatch.table!;
    lastTime = lastMatch.time!;
  }

  return {
    schedule,
    knockoutStages: knockoutStagesTemp,
    initialKnockoutStages: initialKnockoutStagesTemp,
    lastTable,
    lastTime,
  };
};

// API handler function
const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // Check if the request method is POST
  if (req.method === "POST") {
    const { groups, players, tableCount } = req.body;
    const {
      schedule,
      knockoutStages,
      initialKnockoutStages,
      lastTable,
      lastTime,
    } = generateMatchSchedule(groups, players, tableCount);

    // Return the generated schedule and knockout stages
    res.status(200).json({
      schedule,
      knockoutStages,
      initialKnockoutStages,
      lastTable,
      lastTime,
    });
  } else {
    // Return a 405 Method Not Allowed response for other request methods
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
