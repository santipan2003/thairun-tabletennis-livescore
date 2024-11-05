import { NextApiRequest, NextApiResponse } from "next";
import { collection, addDoc } from "firebase/firestore";
import db from "@/services/firestore";
import { Match } from "@/types";

const submitMatchSchedule = async (
  tournamentId: string,
  matchSchedule: Match[]
) => {
  const matchCollectionRef = collection(
    db,
    "tournaments",
    tournamentId,
    "matches"
  );

  for (const match of matchSchedule) {
    await addDoc(matchCollectionRef, {
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
    });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { tournamentId, matchSchedule } = req.body;

  if (!tournamentId || !Array.isArray(matchSchedule)) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    await submitMatchSchedule(tournamentId, matchSchedule);
    res.status(200).json({ message: "Match schedule successfully submitted!" });
  } catch (error) {
    console.error("Error submitting match schedule:", error);
    res.status(500).json({ error: "Failed to submit match schedule" });
  }
};

export default handler;
