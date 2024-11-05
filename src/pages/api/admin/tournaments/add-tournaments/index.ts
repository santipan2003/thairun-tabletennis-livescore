// pages/api/addTournament.ts

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

  const { tournament_name, table_count, start_date, end_date } = req.body;

  if (!tournament_name || !table_count || !start_date || !end_date) {
    res.status(400).json({ success: false, message: "Invalid request data" });
    return;
  }

  try {
    await addDoc(collection(db, "tournaments"), {
      tournament_name,
      table_count: Number(table_count),
      start_date,
      end_date,
    });
    res
      .status(200)
      .json({ success: true, message: "Tournament added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding tournament" });
    console.error(error);
  }
}
