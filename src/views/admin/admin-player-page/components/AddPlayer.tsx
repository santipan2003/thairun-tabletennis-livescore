import React, { useState } from "react";
import { useRouter } from "next/router";
import Papa from "papaparse";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import db from "@/services/firestore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload } from "lucide-react";

interface Player {
  player_id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_name?: string;
  category: string;
  division: string;
}

interface Team {
  id: string;
  team_name: string;
}

interface AddPlayerProps {
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onSuccess: () => void;
}

export const AddPlayer: React.FC<AddPlayerProps> = ({
  setPlayers,
  onSuccess,
}) => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [teams, setTeams] = useState<{ [key: string]: Team }>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Player[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Function to check if the team exists or create a new one
  const getTeamId = async (team_name: string): Promise<string> => {
    // Check if the team is already in the local state
    if (teams[team_name]) {
      return teams[team_name].id;
    }

    // Query Firestore to see if the team exists
    const teamQuery = query(
      collection(db, "teams"),
      where("team_name", "==", team_name)
    );
    const querySnapshot = await getDocs(teamQuery);

    if (!querySnapshot.empty) {
      const existingTeam = querySnapshot.docs[0];
      const teamId = existingTeam.id;
      setTeams((prevTeams) => ({
        ...prevTeams,
        [team_name]: { id: teamId, team_name },
      }));
      return teamId;
    } else {
      // If the team doesn't exist, create a new one
      const newTeamRef = await addDoc(collection(db, "teams"), { team_name });
      const newTeamId = newTeamRef.id;
      setTeams((prevTeams) => ({
        ...prevTeams,
        [team_name]: { id: newTeamId, team_name },
      }));
      return newTeamId;
    }
  };

  // Handle CSV File Upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
      Papa.parse(event.target.files[0], {
        header: true,
        complete: (results) => {
          const data = results.data as Player[];
          setParsedData(data);
        },
      });
    }
  };

  // Submit Players to Firestore
  const handleSubmit = async () => {
    if (parsedData.length > 0) {
      const newPlayers: Player[] = [];

      for (const player of parsedData) {
        const team_id = player.team_name
          ? await getTeamId(player.team_name)
          : undefined;

        try {
          await addDoc(collection(db, `tournaments/${tournament_id}/players`), {
            ...player,
            team_id,
          });
          newPlayers.push(player);
        } catch (error) {
          console.error("Error adding player:", error);
        }
      }

      setPlayers((prevPlayers) => [...prevPlayers, ...newPlayers]);
      setIsSheetOpen(false); // Close the sheet
      onSuccess(); // Refresh player list
    }
  };

  const resetState = () => {
    setCsvFile(null);
    setParsedData([]);
  };

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) resetState(); // Reset state when sheet closes
      }}
    >
      <SheetTrigger asChild>
        <Button variant="default" className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Import Players</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="sheet-content-v2 bg-white p-8 max-w-3xl mx-auto rounded-lg">
        <SheetHeader className="text-center">
          <SheetTitle className="text-2xl font-semibold">
            Import Players from CSV
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {csvFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: <strong>{csvFile.name}</strong>
            </p>
          )}
        </div>

        {parsedData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Player Preview</h3>
            <div className="overflow-y-auto max-h-96">
              <Table className="table-fixed w-full border-collapse border border-gray-300">
                <TableCaption>A preview of imported players.</TableCaption>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-1/8 px-6 py-3">ID</TableHead>
                    <TableHead className="w-1/8 px-6 py-3">
                      First Name
                    </TableHead>
                    <TableHead className="w-1/8 px-6 py-3">Last Name</TableHead>
                    <TableHead className="w-1/8 px-6 py-3">
                      Nationality
                    </TableHead>
                    <TableHead className="w-1/8 px-6 py-3">DOB</TableHead>
                    <TableHead className="w-1/8 px-6 py-3">Team Name</TableHead>
                    <TableHead className="w-1/8 px-6 py-3">Category</TableHead>
                    <TableHead className="w-1/8 px-6 py-3">Division</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((player, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="border px-6 py-2">
                        {player.player_id}
                      </TableCell>
                      <TableCell className="border px-6 py-2">
                        {player.firstName}
                      </TableCell>
                      <TableCell className="border px-6 py-2">
                        {player.lastName}
                      </TableCell>
                      <TableCell className="border px-6 py-2">
                        {player.nationality}
                      </TableCell>
                      <TableCell className="border px-6 py-2">
                        {player.dob}
                      </TableCell>
                      <TableCell className="border px-6 py-2">
                        {player.team_name}
                      </TableCell>
                      <TableCell className="border px-6 py-2">
                        {player.category}
                      </TableCell>
                      <TableCell className="border px-6 py-2">
                        {player.division}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <SheetFooter className="mt-6">
          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
