import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import db from "@/services/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MatchList: React.FC = () => {
  const [tournamentName, setTournamentName] = useState("");
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const fetchTournamentDetails = async (tournamentId: string) => {
    try {
      const tournamentDoc = doc(db, "tournaments", tournamentId);
      const tournamentSnap = await getDoc(tournamentDoc);
      if (tournamentSnap.exists()) {
        setTournamentName(tournamentSnap.data().tournament_name);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    }
  };

  useEffect(() => {
    if (tournament_id) {
      fetchTournamentDetails(tournament_id as string);
    } else {
      console.log("No tournament ID in query");
    }
  }, [tournament_id]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{tournamentName} - Grouping</h1>
        <Link href={`/admin/generate-matches/${tournament_id}`} passHref>
          <Button variant="default">Generate Match</Button>
        </Link>
      </div>
    </div>
  );
};

export default MatchList;
