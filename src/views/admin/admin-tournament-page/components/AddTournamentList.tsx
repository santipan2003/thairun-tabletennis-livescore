import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
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
import { Input } from "@/components/ui/input";

interface AddTournamentListProps {
  onAddSuccess: () => void; // Add a callback prop to notify when a tournament is added
}

const AddTournamentList: React.FC<AddTournamentListProps> = ({
  onAddSuccess,
}) => {
  const [tournamentName, setTournamentName] = useState("");
  const [tableCount, setTableCount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "tournaments"), {
        tournament_name: tournamentName,
        table_count: Number(tableCount),
        start_date: startDate,
        end_date: endDate,
      });
      // Reset form fields
      setTournamentName("");
      setTableCount("");
      setStartDate("");
      setEndDate("");
      setLoading(false);
      setIsSheetOpen(false); 
      onAddSuccess(); // Notify TournamentList to reload data
    } catch (error) {
      console.error("Error adding tournament:", error);
      setLoading(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => setIsSheetOpen(true)}>Add Tournament</Button>
      </SheetTrigger>
      <SheetContent className="bg-white w-[50%] p-6">
        <SheetHeader>
          <SheetTitle>Add New Tournament</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <Input
            placeholder="Tournament Name"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            className="border p-2"
          />
          <Input
            placeholder="Table Count"
            type="number"
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            className="border p-2"
          />
          <Input
            placeholder="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2"
          />
          <Input
            placeholder="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2"
          />
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit} className="mt-4" disabled={loading}>
            {loading ? "Adding..." : "Submit"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddTournamentList;
