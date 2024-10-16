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
import { Settings, Users } from "lucide-react"; // Replace Upload with Users icon
import AddTournamentList from "./AddTournamentList";
import Link from "next/link"; // Import Next.js Link
import { Tournament } from "@/types"; // Import Tournament type from types/index.ts

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
            className="shadow-lg border border-gray-200 rounded-2xl"
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
            <CardFooter className="flex flex-col items-start space-y-2">
              {/* Link to Manage Tournament */}
              <Link href={`/admin/tournament/${tournament.id}`}>
                <Button
                  variant="default"
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Manage Tournament</span>
                </Button>
              </Link>

              {/* Button to Import Players using Users icon */}
              <Link href={`/admin/players/${tournament.id}`}>
                <Button
                  variant="default"
                  className="flex items-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Manage Players</span>
                </Button>
              </Link>

              {/* Button to Manage Groups */}
              <Link href={`/admin/groups/${tournament.id}`}>
                <Button
                  variant="default"
                  className="flex items-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Manage Group</span>
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