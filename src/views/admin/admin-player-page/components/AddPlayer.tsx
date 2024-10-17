import React, { useState } from "react";
import { useRouter } from "next/router";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
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
import { Upload, Loader } from "lucide-react"; // Import Loader icon

interface Player {
  player_id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_name?: string;
  category: string;
  division: string;
  rank_score?: number;
  rank_number?: number;
  group?: string;
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

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Player[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const validatePlayerData = (player: Partial<Player>): Player => ({
    player_id: player.player_id ?? 0,
    firstName: player.firstName ?? "Unknown",
    lastName: player.lastName ?? "Unknown",
    nationality: player.nationality ?? "Unknown",
    dob: player.dob ?? "N/A",
    team_name: player.team_name ?? "N/A",
    category: player.category ?? "Uncategorized",
    division: player.division ?? "Undivided",
    rank_score: player.rank_score ?? 0,
    rank_number: player.rank_number ?? 0,
    group: player.group ?? "Not Assigned",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
      Papa.parse(event.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Partial<Player>[];
          const processedData = data.map(validatePlayerData);
          setParsedData(processedData);
        },
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // Start loading
    if (parsedData.length > 0) {
      const newPlayers: Player[] = [];

      for (const player of parsedData) {
        try {
          await addDoc(collection(db, `tournaments/${tournament_id}/players`), {
            ...player,
          });
          newPlayers.push(player);
        } catch (error) {
          console.error("Error adding player:", error);
        }
      }

      setPlayers((prevPlayers) => [...prevPlayers, ...newPlayers]);
      setIsSheetOpen(false);
      onSuccess();
    }
    setLoading(false); // Stop loading
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
        if (!open) resetState();
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
                    <TableHead>Player ID</TableHead>
                    <TableHead>Rank No.</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Rank Score</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((player, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>{player.player_id}</TableCell>
                      <TableCell>{player.rank_number}</TableCell>
                      <TableCell>{player.firstName}</TableCell>
                      <TableCell>{player.lastName}</TableCell>
                      <TableCell>{player.nationality}</TableCell>
                      <TableCell>{player.dob}</TableCell>
                      <TableCell>{player.team_name}</TableCell>
                      <TableCell>
                        {typeof player.rank_score === "number"
                          ? player.rank_score.toFixed(2)
                          : player.rank_score}
                      </TableCell>
                      <TableCell>{player.category}</TableCell>
                      <TableCell>{player.division}</TableCell>
                      <TableCell>{player.group}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <SheetFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
