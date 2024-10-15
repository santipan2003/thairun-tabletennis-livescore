import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDocs, collection } from "firebase/firestore";
import db from "@/services/firestore";
import { Player } from "@/pages/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const GroupListPage: React.FC = () => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentName, setTournamentName] = useState("");

  const fetchPlayers = async (tournamentId: string) => {
    const playerCollection = collection(
      db,
      `tournaments/${tournamentId}/players`
    );
    const snapshot = await getDocs(playerCollection);
    const playerList = snapshot.docs.map((doc) => doc.data() as Player);
    setPlayers(playerList);
  };

  const fetchTournamentDetails = async (tournamentId: string) => {
    const tournamentCollection = collection(db, "tournaments");
    const snapshot = await getDocs(tournamentCollection);
    const tournament = snapshot.docs.find((doc) => doc.id === tournamentId);

    if (tournament) {
      setTournamentName(tournament.data().tournament_name);
    }
  };

  useEffect(() => {
    if (tournament_id) {
      fetchPlayers(tournament_id as string);
      fetchTournamentDetails(tournament_id as string);
    }
  }, [tournament_id]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{tournamentName} - Grouping</h1>
        <Link href={`/admin/generate-groups/${tournament_id}`} passHref>
          <Button as="a" variant="default">
            Generate Group
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GroupListPage;
