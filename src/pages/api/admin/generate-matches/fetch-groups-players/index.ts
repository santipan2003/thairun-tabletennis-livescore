import { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs } from "firebase/firestore";
import db from "@/services/firestore";
import { Player, Group } from "@/types";

const fetchGroupsAndPlayers = async (tournamentId: string) => {
  const groupCollection = collection(db, "tournaments", tournamentId, "groups");
  const groupSnapshot = await getDocs(groupCollection);
  const groups = groupSnapshot.docs.map((doc) => {
    const groupData = doc.data() as Group;
    const uniqueGroupId = `${groupData.division}-${doc.id}`;
    return { ...groupData, uniqueGroupId, id: doc.id };
  });

  const playerCollection = collection(
    db,
    "tournaments",
    tournamentId,
    "players"
  );
  const playerSnapshot = await getDocs(playerCollection);
  const allPlayersData = playerSnapshot.docs.reduce((acc, doc) => {
    acc[doc.id] = doc.data() as Player;
    return acc;
  }, {} as Record<string, Player>);

  return { groups, allPlayersData };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tournamentId } = req.query;

  if (!tournamentId || typeof tournamentId !== "string") {
    res.status(400).json({ error: "Invalid tournament ID" });
    return;
  }

  try {
    const { groups, allPlayersData } = await fetchGroupsAndPlayers(
      tournamentId
    );
    res.status(200).json({ groups, allPlayersData });
  } catch (error) {
    console.error("Error fetching groups and players:", error);
    res.status(500).json({ error: "Failed to fetch groups and players" });
  }
};

export default handler;
