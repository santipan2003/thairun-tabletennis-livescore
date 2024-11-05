export interface Player {
  firstName: string;
  lastName: string;
  rank_score: number;
  nextmatch_id: string | null;
  _isWinner: boolean;
  group: string;
  rank: number;
}

export interface Group {
  group_id: number;
  group_name: string;
  division: string;
  players: string[];
  uniqueGroupId: string;
  id: string;
}

export interface Match {
  match_id: string;
  time: Date;
  table: number;
  players: Player[];
  group: number;
  division: string;
  nextmatch_id: string | null;
}
