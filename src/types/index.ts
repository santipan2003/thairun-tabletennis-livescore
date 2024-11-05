export interface Tournament {
  id: string;
  tournament_name: string;
  table_count: number;
  start_date: string;
  end_date: string;
}

export interface Player {
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
  _isWinner: boolean | "pending";
  nextmatch_id?: string | null;
  rank?: number;
}

export interface Group {
  id: string;
  division: string;
  group_name: string;
  players: Player[];
  group_id: number;
}

export interface Match {
  id: string;
  match_id: string;
  time: Date | null;
  table: number | null;
  players: Player[];
  group: number;
  division: string;
  nextmatch_id: string | null;
  matchType: string;
}
