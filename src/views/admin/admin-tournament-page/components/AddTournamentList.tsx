import React, { useState } from "react";
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
import axios from "axios";

interface AddTournamentListProps {
  onAddSuccess: () => void;
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
      const response = await axios.post(
        `/api/admin/tournaments/add-tournaments`,
        {
          tournament_name: tournamentName,
          table_count: Number(tableCount),
          start_date: startDate,
          end_date: endDate,
        }
      );

      if (response.data.success) {
        setTournamentName("");
        setTableCount("");
        setStartDate("");
        setEndDate("");
        setIsSheetOpen(false);
        onAddSuccess();
      } else {
        console.error("Error adding tournament:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding tournament:", error);
    }
    setLoading(false);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="text-white  transition-all">
          Add Tournament
        </Button>
      </SheetTrigger>
      <SheetContent className="sheet-content bg-white p-8 max-w-xl mx-auto rounded-lg shadow-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold text-center text-gray-800">
            Add New Tournament
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">
              Tournament Name
            </label>
            <Input
              placeholder="Enter tournament name"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">
              Table Count
            </label>
            <Input
              placeholder="Enter number of tables"
              type="number"
              value={tableCount}
              onChange={(e) => setTableCount(e.target.value)}
              className="border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <SheetFooter className="mt-8 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setIsSheetOpen(false)}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`text-white  transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Submit"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddTournamentList;
