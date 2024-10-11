import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import db from "@/services/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Tournament {
  id: string;
  tournament_name: string;
  table_count: number;
  start_date: string;
  end_date: string;
}

const TournamentDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the tournament ID from the URL
  const [tournament, setTournament] = useState<Tournament | null>(null);

  const fetchTournamentDetail = async (id: string) => {
    const tournamentDoc = doc(db, "tournaments", id);
    const docSnap = await getDoc(tournamentDoc);
    if (docSnap.exists()) {
      setTournament({ id: docSnap.id, ...docSnap.data() } as Tournament);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTournamentDetail(id as string);
    }
  }, [id]);

  if (!tournament) {
    return <div>Loading tournament details...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg border border-gray-200 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            {tournament.tournament_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Tables: {tournament.table_count}</p>
          <p className="text-sm">
            Start Date: {new Date(tournament.start_date).toLocaleDateString()}
          </p>
          <p className="text-sm">
            End Date: {new Date(tournament.end_date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentDetail;
