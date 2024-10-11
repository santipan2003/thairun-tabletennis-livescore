import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import db from "@/services/firestore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react"; // Import Lucide Settings icon
import AddTournamentList from "./AddTournamentList";
import Link from "next/link"; // Import Next.js Link

interface Tournament {
  id: string;
  tournament_name: string;
  table_count: number;
  start_date: string;
  end_date: string;
}

const TournamentList: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const fetchTournaments = async () => {
    const tournamentCollection = collection(db, "tournaments");
    const tournamentSnapshot = await getDocs(tournamentCollection);
    const tournamentList = tournamentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Tournament[];
    setTournaments(tournamentList);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tournament List</h1>
        <AddTournamentList onAddSuccess={fetchTournaments} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments.map((tournament) => (
          <Card
            key={tournament.id}
            className="shadow-lg border border-gray-200 rounded-lg"
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {tournament.tournament_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Tables: {tournament.table_count}</p>
              <p className="text-sm">
                Start Date:{" "}
                {new Date(tournament.start_date).toLocaleDateString()}
              </p>
              <p className="text-sm">
                End Date: {new Date(tournament.end_date).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              {/* Use Next.js Link to navigate to the dynamic tournament detail page */}
              <Link href={`/admin/tournament/${tournament.id}`}>
                <Button
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Manage Tournament</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TournamentList;
