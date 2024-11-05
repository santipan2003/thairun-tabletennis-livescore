// pages/api/fetchPlayers.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs } from "firebase/firestore";
import db from "@/services/firestore"; // Adjust the import according to your project structure
import { Player } from "@/types"; // Import the Player interface

type Data = {
  players: Player[];
  categories: string[];
  divisions: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { tournament_id } = req.query;

  if (!tournament_id || typeof tournament_id !== "string") {
    res.status(400).json({ players: [], categories: [], divisions: [] });
    return;
  }

  try {
    const playerCollection = collection(
      db,
      `tournaments/${tournament_id}/players`
    );
    const snapshot = await getDocs(playerCollection);
    const playerList = snapshot.docs.map((doc) => doc.data() as Player);

    // Group players by their group
    const groupedPlayers: { [key: string]: Player[] } = {};
    playerList.forEach((player) => {
      const group = player.group ?? "Not Assigned";
      if (!groupedPlayers[group]) {
        groupedPlayers[group] = [];
      }
      groupedPlayers[group].push(player);
    });

    // Sort each group by rank_score in descending order
    Object.keys(groupedPlayers).forEach((group) => {
      groupedPlayers[group].sort(
        (a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0)
      );
    });

    // Flatten the sorted groups back into a single array
    const sortedPlayers = Object.values(groupedPlayers).flat();

    // Extract unique categories and divisions
    const uniqueCategories = Array.from(
      new Set(playerList.map((player) => player.category))
    );
    const uniqueDivisions = Array.from(
      new Set(playerList.map((player) => player.division))
    );

    res.status(200).json({
      players: sortedPlayers,
      categories: uniqueCategories,
      divisions: uniqueDivisions,
    });
  } catch (error) {
    res.status(500).json({ players: [], categories: [], divisions: [] });
    console.error("Error fetching players:", error);
  }
}
