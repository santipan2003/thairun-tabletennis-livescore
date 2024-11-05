import { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc } from "firebase/firestore";
import db from "@/services/firestore";

const fetchTournamentData = async (tournamentId: string) => {
  const tournamentRef = doc(db, "tournaments", tournamentId);
  const tournamentSnap = await getDoc(tournamentRef);
  if (!tournamentSnap.exists()) {
    throw new Error("Tournament not found");
  }
  return tournamentSnap.data();
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tournamentId } = req.query;

  if (!tournamentId || typeof tournamentId !== "string") {
    res.status(400).json({ error: "Invalid tournament ID" });
    return;
  }

  try {
    const tournamentData = await fetchTournamentData(tournamentId);
    res.status(200).json(tournamentData);
  } catch (error) {
    console.error("Error fetching tournament data:", error);
    res.status(500).json({ error: "Failed to fetch tournament data" });
  }
};

export default handler;
