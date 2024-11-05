// pages/api/fetchTournamentDetail.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc } from "firebase/firestore";
import db from "@/services/firestore"; // Adjust the import according to your project structure

type Data = {
  tournament: {
    id: string;
    tournament_name: string;
    table_count: number;
    start_date: string;
    end_date: string;
  } | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ tournament: null });
    return;
  }

  try {
    const tournamentDoc = doc(db, "tournaments", id);
    const docSnap = await getDoc(tournamentDoc);
    if (docSnap.exists()) {
      const tournament = {
        id: docSnap.id,
        ...docSnap.data(),
      } as Data["tournament"];
      res.status(200).json({ tournament });
    } else {
      res.status(404).json({ tournament: null });
    }
  } catch (error) {
    res.status(500).json({ tournament: null });
    console.error(error)
  }
}
