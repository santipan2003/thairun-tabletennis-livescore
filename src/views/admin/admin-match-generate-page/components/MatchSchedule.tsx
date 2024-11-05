import React from "react";
import { Match } from "./types";

interface MatchScheduleProps {
  matchSchedule: Match[];
}

const MatchSchedule: React.FC<MatchScheduleProps> = ({ matchSchedule }) => {
  return (
    <table className="w-full border mb-4">
      <thead>
        <tr>
          <th>Match ID</th>
          <th>Time</th>
          <th>Table</th>
          <th>Match</th>
          <th>Group</th>
          <th>Division</th>
        </tr>
      </thead>
      <tbody>
        {matchSchedule.map((match, index) => (
          <tr key={index}>
            <td>{match.match_id}</td>
            <td>
              {match.time instanceof Date
                ? match.time.toLocaleString()
                : match.time}
            </td>
            <td>{match.table}</td>
            <td>
              (
              <strong>
                {match.players[0]?.firstName ||
                  match.players[0]?.player?.firstName ||
                  "Unknown"}
              </strong>{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                {match.players[0]?.lastName ||
                  match.players[0]?.player?.lastName}
              </span>
              ) vs (
              <strong>
                {match.players[1]?.firstName ||
                  match.players[1]?.player?.firstName ||
                  "Unknown"}
              </strong>{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                {match.players[1]?.lastName ||
                  match.players[1]?.player?.lastName}
              </span>
              )
            </td>
            <td>{match.group}</td>
            <td>{match.division}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MatchSchedule;
