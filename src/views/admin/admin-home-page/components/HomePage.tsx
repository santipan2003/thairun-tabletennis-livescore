import React from "react";
import { Button } from "@/components/ui/button"; // ShadCN button
import { Table } from "@/components/ui/table"; // Assume you're using ShadCN's table component

// Mock data for table rows
const matches = [
  {
    id: 1,
    match: "Match 1",
    player1: "John Doe",
    player2: "Jane Smith",
    score: "2-1",
    status: "In Progress",
  },
  {
    id: 2,
    match: "Match 2",
    player1: "Alice Cooper",
    player2: "Bob Marley",
    score: "3-0",
    status: "Completed",
  },
  {
    id: 3,
    match: "Match 3",
    player1: "Michael Jordan",
    player2: "LeBron James",
    score: "1-2",
    status: "In Progress",
  },
  {
    id: 4,
    match: "Match 4",
    player1: "Serena Williams",
    player2: "Venus Williams",
    score: "3-1",
    status: "Completed",
  },
  {
    id: 5,
    match: "Match 5",
    player1: "Roger Federer",
    player2: "Rafael Nadal",
    score: "2-3",
    status: "In Progress",
  },
  {
    id: 6,
    match: "Match 6",
    player1: "Lionel Messi",
    player2: "Cristiano Ronaldo",
    score: "0-3",
    status: "Completed",
  },
  {
    id: 7,
    match: "Match 7",
    player1: "Usain Bolt",
    player2: "Tyson Gay",
    score: "3-2",
    status: "In Progress",
  },
  {
    id: 8,
    match: "Match 8",
    player1: "Tiger Woods",
    player2: "Phil Mickelson",
    score: "1-3",
    status: "Completed",
  },
  {
    id: 9,
    match: "Match 9",
    player1: "Tom Brady",
    player2: "Peyton Manning",
    score: "2-2",
    status: "In Progress",
  },
  {
    id: 10,
    match: "Match 10",
    player1: "Kobe Bryant",
    player2: "Shaquille O'Neal",
    score: "3-1",
    status: "Completed",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Table Tennis Live Score Admin
          </h1>
        </header>

        {/* Live Score Table */}
        <section className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Live Matches
          </h2>
          <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  Match
                </th>
                <th className="py-3 px-4 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  Player 1
                </th>
                <th className="py-3 px-4 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  Player 2
                </th>
                <th className="py-3 px-4 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  Score
                </th>
                <th className="py-3 px-4 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="py-3 px-4 border border-gray-200 dark:border-gray-700">
                    {match.match}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 dark:border-gray-700">
                    {match.player1}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 dark:border-gray-700">
                    {match.player2}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 dark:border-gray-700">
                    {match.score}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 dark:border-gray-700">
                    {match.status}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      className="text-black dark:text-white"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
