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
import { Upload } from "lucide-react";

interface Player {
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_name?: string;
}

interface Team {
  id: string;
  team_name: string;
}

interface AddPlayerProps {
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

export const AddPlayer: React.FC<AddPlayerProps> = () => {
  const router = useRouter();
  const { id: tournament_id } = router.query;

  const [teams, setTeams] = useState<{ [key: string]: Team }>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Player[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getTeamId = async (team_name: string) => {
    if (teams[team_name]) {
      return teams[team_name].id;
    } else {
      const newTeamRef = await addDoc(collection(db, "teams"), { team_name });
      const newTeamId = newTeamRef.id;
      setTeams((prevTeams) => ({
        ...prevTeams,
        [team_name]: { id: newTeamId, team_name },
      }));
      return newTeamId;
    }
  };

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

  const handleSubmit = async () => {
    if (parsedData.length > 0) {
      for (const player of parsedData) {
        const team_id = player.team_name
          ? await getTeamId(player.team_name)
          : undefined;

        try {
          await addDoc(collection(db, "players"), {
            ...player,
            team_id,
            tournament_id,
          });
        } catch (error) {
          console.error("Error adding player:", error);
        }
      }
      setIsSheetOpen(false);
    }
  };

  // ฟังก์ชันสำหรับรีเซ็ตข้อมูล
  const resetState = () => {
    setCsvFile(null);
    setParsedData([]);
  };

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) resetState(); // รีเซ็ตข้อมูลเมื่อปิด Sheet
      }}
    >
      <SheetTrigger asChild>
        <Button variant="default" className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Import Players</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sheet-content bg-white p-8 max-w-3xl mx-auto rounded-lg">
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
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full border-collapse border border-gray-300">
                <TableCaption>A preview of imported players.</TableCaption>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-1/5 px-6 py-3">
                      First Name
                    </TableHead>
                    <TableHead className="w-1/5 px-6 py-3">Last Name</TableHead>
                    <TableHead className="w-1/5 px-6 py-3">
                      Nationality
                    </TableHead>
                    <TableHead className="w-1/5 px-6 py-3">
                      Date of Birth
                    </TableHead>
                    <TableHead className="w-1/5 px-6 py-3">Team Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((player, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="border px-6 py-2 text-left">
                        {player.firstName}
                      </TableCell>
                      <TableCell className="border px-6 py-2 text-left">
                        {player.lastName}
                      </TableCell>
                      <TableCell className="border px-6 py-2 text-left">
                        {player.nationality}
                      </TableCell>
                      <TableCell className="border px-6 py-2 text-left">
                        {player.dob}
                      </TableCell>
                      <TableCell className="border px-6 py-2 text-left">
                        {player.team_name}
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
