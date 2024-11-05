// pages/api/fetchTournamentName.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs } from "firebase/firestore";
import db from "@/services/firestore"; // Adjust the import according to your project structure

type Data = {
  tournamentName: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { tournament_id } = req.query;

  if (!tournament_id || typeof tournament_id !== "string") {
    res.status(400).json({ tournamentName: null });
    return;
  }

  try {
    const tournamentRef = collection(db, "tournaments");
    const snapshot = await getDocs(tournamentRef);
    const tournament = snapshot.docs.find((doc) => doc.id === tournament_id);
    const tournamentName = tournament
      ? tournament.data().tournament_name
      : null;

    res.status(200).json({ tournamentName });
  } catch (error) {
    res.status(500).json({ tournamentName: null });
    console.error("Error fetching tournament name:", error);
  }
}
