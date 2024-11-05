import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

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
    try {
      const response = await axios.get(`/api/admin/tournaments/byID/fetch-tournament-detail`, {
        params: { id },
      });
      const { tournament } = response.data;
      if (tournament) {
        setTournament(tournament);
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
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
