import React from "react";
import { Button } from "@/components/ui/button";

interface MatchTypeModalProps {
  onSelect: (matchType: string) => void;
}

const MatchTypeModal: React.FC<MatchTypeModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-black">
          Select Match Type
        </h2>
        <div className="space-x-4">
          <Button onClick={() => onSelect("Best of 3")}>Best of 3</Button>
          <Button onClick={() => onSelect("Best of 5")}>Best of 5</Button>
        </div>
      </div>
    </div>
  );
};

export default MatchTypeModal;
