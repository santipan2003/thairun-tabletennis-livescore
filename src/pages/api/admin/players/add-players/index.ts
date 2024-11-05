// pages/api/addPlayers.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { collection, addDoc } from "firebase/firestore";
import db from "@/services/firestore"; // Adjust the import according to your project structure

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  const { tournament_id, players } = req.body;

  if (!tournament_id || !Array.isArray(players)) {
    res.status(400).json({ success: false, message: "Invalid request data" });
    return;
  }

  try {
    const playerCollection = collection(
      db,
      `tournaments/${tournament_id}/players`
    );
    for (const player of players) {
      await addDoc(playerCollection, player);
    }
    res
      .status(200)
      .json({ success: true, message: "Players added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding players" });
    console.error("Error adding players:", error);
  }
}
