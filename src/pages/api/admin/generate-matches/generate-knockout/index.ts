import { NextApiRequest, NextApiResponse } from "next";

// Define the Player interface
interface Player {
  firstName: string;
  lastName: string;
  rank_score: number;
  _isWinner: boolean | "pending";
  group: string;
  rank: number;
  nextmatch_id?: string;
}

// Define the Match interface
interface Match {
  match_id: string;
  time: string | null; // Time is a string to use .toLocaleString()
  table: number | null;
  players: Player[];
  group: number;
  division: string;
  nextmatch_id?: string;
}

// Define the Group interface
interface Group {
  group_id: number;
  division: string;
}

// Define the KnockoutPatterns interface
interface KnockoutPatterns {
  [key: number]: [Player, Player][];
}

// Define the RoundNames interface
interface RoundNames {
  [key: number]: string;
}

// Define the RequestBody interface
interface RequestBody {
  division: string;
  matchSchedule: Match[];
  knockoutStages: { [key: string]: number };
  initialKnockoutStages: { [key: string]: number };
  roundNames: RoundNames;
  knockoutPatterns: KnockoutPatterns;
  groupsData: Group[];
  tableCount: number;
  lastTable: number;
}

// API handler function
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if the request method is POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Destructure the request body
  const {
    division,
    matchSchedule,
    knockoutStages,
    initialKnockoutStages,
    roundNames,
    knockoutPatterns,
    groupsData,
    tableCount,
    lastTable,
  }: RequestBody = req.body;

  // Check if the division is provided
  if (!division) {
    return res.status(400).json({ message: "Division is required" });
  }

  // Copy the match schedule
  const schedule = [...matchSchedule];
  // Initialize the initial time for scheduling matches
  const initialTime = new Date(schedule[schedule.length - 1].time!);
  initialTime.setMinutes(initialTime.getMinutes() + 25);

  // Determine the current table number
  let currentTable: number;
  const existingKnockoutMatches = schedule.filter((match) =>
    match.division.includes(division)
  );
  if (existingKnockoutMatches.length > 0) {
    currentTable =
      existingKnockoutMatches[existingKnockoutMatches.length - 1].table! + 1;
  } else {
    currentTable = lastTable + 1;
  }

  // Initialize the match counter
  let matchCounter = parseInt(schedule[schedule.length - 1].match_id) + 1;
  const currentKnockoutStageSize = knockoutStages[division];
  const KnockoutStageSize = initialKnockoutStages[division];

  // Get the round keys and determine the next knockout stage size
  const roundKeys = Object.keys(roundNames)
    .map(Number)
    .sort((a, b) => b - a);
  const currentIndex = roundKeys.indexOf(currentKnockoutStageSize);
  const nextKnockoutStageSize = roundKeys[currentIndex + 1];

  // Function to add a match to the schedule
  const addMatchToSchedule = (
    match_id: string,
    player1: Player,
    player2: Player,
    division: string,
    nextmatch_id?: string
  ) => {
    // Find the last valid match with a non-null time and table
    let lastValidMatch = schedule
      .slice()
      .reverse()
      .find((match) => match.time !== null && match.table !== null);

    if (!lastValidMatch) {
      lastValidMatch = schedule[schedule.length - 1];
    }

    const lastMatchTime = new Date(lastValidMatch.time!);
    const lastMatchTable = lastValidMatch.table!;
    currentTable = lastMatchTable + 1;

    // Adjust the initial time and table number
    if (currentTable > tableCount) {
      initialTime.setTime(lastMatchTime.getTime() + 25 * 60000);
      currentTable = 1;
    } else {
      initialTime.setTime(lastMatchTime.getTime());
    }

    // Add the match to the schedule
    schedule.push({
      match_id,
      time:
        player1.firstName === "BYE" || player2.firstName === "BYE"
          ? null
          : new Date(initialTime).toLocaleString(),
      table:
        player1.firstName === "BYE" || player2.firstName === "BYE"
          ? null
          : currentTable,
      players: [player1, player2],
      group: currentKnockoutStageSize,
      division,
      nextmatch_id,
    });
    matchCounter++;
  };

  // If there is no next knockout stage size, handle the final matches
  if (!nextKnockoutStageSize) {
    const previousKnockoutStageSize = roundKeys[currentIndex - 1];
    const previousMatches = schedule.filter((match) => {
      const comparisonString = `${division} ${
        roundNames[previousKnockoutStageSize as keyof typeof roundNames]
      }`;
      return match.division === comparisonString;
    });

    // Add final matches to the schedule
    for (let i = 0; i < previousMatches.length; i += 2) {
      const match_id = matchCounter.toString().padStart(4, "0");
      const player1: Player = {
        firstName: `Winner of Match ${previousMatches[i].match_id}`,
        lastName: "",
        rank_score: 0,
        _isWinner: "pending",
        group: "", // Provide appropriate value or default
        rank: 0, // Provide appropriate value or default
      };

      const player2: Player = {
        firstName: `Winner of Match ${previousMatches[i + 1].match_id}`,
        lastName: "",
        rank_score: 0,
        _isWinner: "pending",
        group: "", // Provide appropriate value or default
        rank: 0, // Provide appropriate value or default
      };

      previousMatches[i].nextmatch_id = match_id;
      previousMatches[i + 1].nextmatch_id = match_id;

      addMatchToSchedule(match_id, player1, player2, `${division} Final`);
    }

    knockoutStages[division] = 1;
    return res.status(200).json({ schedule, knockoutStages });
  }

  const byeWinners: Player[] = [];

  // Handle the current knockout stage
  if (currentKnockoutStageSize === KnockoutStageSize) {
    const patterns =
      knockoutPatterns[
        currentKnockoutStageSize as keyof typeof knockoutPatterns
      ];
    const groupCount = groupsData.filter(
      (group) => group.division === division
    ).length;
    const byeCount = currentKnockoutStageSize - groupCount * 2;
    // Explicitly type `patterns[byeCount]` to ensure TypeScript recognizes it as an array of tuples
    const pattern: [Player, Player][] = (patterns[byeCount] ||
      patterns[0]) as unknown as [Player, Player][];

    // Add matches based on the knockout patterns
    pattern.forEach((match) => {
      const match_id = matchCounter.toString().padStart(4, "0");

      const player1: Player = groupsData.some(
        (group) => group.group_id.toString() === match[0].group
      )
        ? {
            firstName: `Rank ${match[0].rank} Group ${match[0].group}`,
            lastName: "",
            rank_score: 0,
            _isWinner: "pending",
            group: match[0].group,
            rank: match[0].rank,
          }
        : {
            firstName: "BYE",
            lastName: "",
            rank_score: 0,
            _isWinner: false,
            group: "",
            rank: 0,
          };

      const player2: Player = groupsData.some(
        (group) => group.group_id.toString() === match[1].group
      )
        ? {
            firstName: `Rank ${match[1].rank} Group ${match[1].group}`,
            lastName: "",
            rank_score: 0,
            _isWinner: "pending",
            group: match[1].group,
            rank: match[1].rank,
          }
        : {
            firstName: "BYE",
            lastName: "",
            rank_score: 0,
            _isWinner: false,
            group: "",
            rank: 0,
          };

      if (player1.firstName === "BYE") {
        player2._isWinner = true;
        byeWinners.push(player2);
      } else if (player2.firstName === "BYE") {
        player1._isWinner = true;
        byeWinners.push(player1);
      }

      addMatchToSchedule(
        match_id,
        player1,
        player2,
        `${division} ${
          roundNames[currentKnockoutStageSize as keyof typeof roundNames]
        }`
      );
    });
  } else {
    // Handle the next knockout stage
    const previousKnockoutStageSize = roundKeys[currentIndex - 1];
    const previousMatches = schedule.filter((match) => {
      const comparisonString = `${division} ${
        roundNames[previousKnockoutStageSize as keyof typeof roundNames]
      }`;
      return match.division === comparisonString;
    });

    // Add matches based on the previous knockout stage
    for (let i = 0; i < previousMatches.length; i += 2) {
      const match_id = matchCounter.toString().padStart(4, "0");

      const previousMatch1 = previousMatches[i];
      const previousMatch2 = previousMatches[i + 1];

      const winner1 = previousMatch1.players.find(
        (player) => player._isWinner === true
      );
      const player1: Player = winner1
        ? {
            firstName: winner1.firstName,
            lastName: "",
            rank_score: 0,
            _isWinner: "pending",
            group: "", // Provide appropriate value or default
            rank: 0, // Provide appropriate value or default
          }
        : {
            firstName: `Winner of Match ${previousMatch1.match_id}`,
            lastName: "",
            rank_score: 0,
            _isWinner: "pending",
            group: "", // Provide appropriate value or default
            rank: 0, // Provide appropriate value or default
          };

      const winner2 = previousMatch2.players.find(
        (player) => player._isWinner === true
      );
      const player2: Player = winner2
        ? {
            firstName: winner2.firstName,
            lastName: "",
            rank_score: 0,
            _isWinner: "pending",
            group: "", // Provide appropriate value or default
            rank: 0, // Provide appropriate value or default
          }
        : {
            firstName: `Winner of Match ${previousMatch2.match_id}`,
            lastName: "",
            rank_score: 0,
            _isWinner: "pending",
            group: "", // Provide appropriate value or default
            rank: 0, // Provide appropriate value or default
          };

      previousMatch1.nextmatch_id = match_id;
      previousMatch2.nextmatch_id = match_id;

      addMatchToSchedule(
        match_id,
        player1,
        player2,
        `${division} ${
          roundNames[currentKnockoutStageSize as keyof typeof roundNames]
        }`
      );
    }

    // Add matches for bye winners
    for (let i = 0; i < byeWinners.length; i += 2) {
      const match_id = matchCounter.toString().padStart(4, "0");
      const player1 = byeWinners[i];
      const player2 = byeWinners[i + 1] || {
        firstName: `Winner of Match ${match_id}`,
        lastName: "",
        rank_score: 0,
        _isWinner: "pending",
      };
      addMatchToSchedule(
        match_id,
        player1,
        player2,
        `${division} ${
          roundNames[nextKnockoutStageSize as keyof typeof roundNames]
        }`
      );

      if (byeWinners[i + 1]) {
        byeWinners[i].nextmatch_id = match_id;
        byeWinners[i + 1].nextmatch_id = match_id;
      } else {
        byeWinners[i].nextmatch_id = match_id;
      }
    }
  }

  // Update the knockout stages and return the response
  knockoutStages[division] = nextKnockoutStageSize;
  return res.status(200).json({ schedule, knockoutStages });
}
