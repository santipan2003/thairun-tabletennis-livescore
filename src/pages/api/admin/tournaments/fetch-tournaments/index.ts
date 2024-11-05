// pages/api/fetchTournaments.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs } from "firebase/firestore";
import db from "@/services/firestore"; // Adjust the import according to your project structure
import { Tournament } from "@/types"; // Import the Tournament interface

type Data = {
  tournaments: Tournament[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const tournamentCollection = collection(db, "tournaments");
    const tournamentSnapshot = await getDocs(tournamentCollection);
    const tournamentList = tournamentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Tournament[];

    res.status(200).json({ tournaments: tournamentList });
  } catch (error) {
    res.status(500).json({ tournaments: [] });
    console.error(error);
  }
}
