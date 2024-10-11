import React, { useState } from "react";
import Papa from "papaparse";
import { getDocs, collection, addDoc } from "firebase/firestore";
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
  TableHead,
  TableRow,
} from "@/components/ui/table";

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

export const AddPlayer: React.FC<AddPlayerProps> = ({ setPlayers }) => {
  const [teams, setTeams] = useState<{ [key: string]: Team }>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Player[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State to control the sheet

  const fetchTeams = async () => {
    const teamData: { [key: string]: Team } = {};
    const teamCollection = collection(db, "teams");
    const teamSnapshot = await getDocs(teamCollection);
    teamSnapshot.docs.forEach((doc) => {
      const team = { id: doc.id, ...doc.data() } as Team;
      teamData[team.team_name] = team;
    });
    setTeams(teamData);
  };

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
        if (player.team_name) {
          const team_id = await getTeamId(player.team_name);
          try {
            await addDoc(collection(db, "players"), {
              firstName: player.firstName,
              lastName: player.lastName,
              nationality: player.nationality,
              dob: player.dob,
              team_id,
            });
            console.log(`Player added: ${player.firstName} ${player.lastName}`);
          } catch (error) {
            console.error("Error adding player:", error);
          }
        }
      }
      // อัปเดตข้อมูลผู้เล่นหลังจากการ Submit
      const playerCollection = collection(db, "players");
      const playerSnapshot = await getDocs(playerCollection);
      const playerList = playerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Player[];
      setPlayers(playerList);

      // Close the sheet after submission
      setIsSheetOpen(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="mt-4" onClick={() => setIsSheetOpen(true)}>
          Import Players
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white w-[50%] p-6">
        <SheetHeader>
          <SheetTitle>Import CSV File</SheetTitle>
        </SheetHeader>
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-4 border p-2"
          />
        </div>

        {parsedData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Preview CSV Data</h3>
            <Table className="table-auto w-full mt-2">
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Nationality</TableCell>
                  <TableCell>Date of Birth</TableCell>
                  <TableCell>Team Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedData.map((player, index) => (
                  <TableRow key={index}>
                    <TableCell>{player.firstName}</TableCell>
                    <TableCell>{player.lastName}</TableCell>
                    <TableCell>{player.nationality}</TableCell>
                    <TableCell>{player.dob}</TableCell>
                    <TableCell>{player.team_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <SheetFooter>
          <Button onClick={handleSubmit} className="mt-4">
            Submit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
