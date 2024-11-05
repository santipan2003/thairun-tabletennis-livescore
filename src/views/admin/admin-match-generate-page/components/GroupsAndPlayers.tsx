import React from "react";
import { Group, Player } from "./types";

interface GroupsAndPlayersProps {
  groupsData: Group[];
  playersData: Record<string, Player>;
  calculateKnockoutStageSize: (numGroups: number) => number;
}

const GroupsAndPlayers: React.FC<GroupsAndPlayersProps> = ({
  groupsData,
  playersData,
  calculateKnockoutStageSize,
}) => {
  const divisions = groupsData.reduce<Record<string, Group[]>>((acc, group) => {
    if (!acc[group.division]) {
      acc[group.division] = [];
    }
    acc[group.division].push(group);
    return acc;
  }, {});

  Object.keys(divisions).forEach((division) => {
    divisions[division].sort((a, b) => a.group_id - b.group_id);
  });

  return (
    <>
      {Object.keys(divisions).map((division, divisionIndex) => {
        const numGroups = divisions[division].length;
        const knockoutStageSize = calculateKnockoutStageSize(numGroups);

        return (
          <div key={divisionIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">Division: {division}</h2>
            <div className="flex flex-wrap -mx-2">
              {divisions[division].map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 px-2 mb-4"
                >
                  <div className="bg-white p-4 border rounded shadow">
                    <h3 className="text-lg font-bold mb-2">
                      {group.group_name}
                    </h3>
                    <table className="w-full border mb-4">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.players.map((playerId, playerIndex) => {
                          const player = playersData[playerId];
                          return (
                            <tr key={playerIndex}>
                              <td>
                                {player
                                  ? `${player.firstName} ${player.lastName}`
                                  : "Unknown Player"}
                              </td>
                              <td>{player ? player.rank_score : "N/A"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <strong>Knockout Stage Size: {knockoutStageSize} players</strong>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default GroupsAndPlayers;
