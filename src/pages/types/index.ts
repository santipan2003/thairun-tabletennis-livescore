// types/index.ts
export interface Tournament {
  id: string;
  tournament_name: string;
  table_count: number;
  start_date: string;
  end_date: string;
}

export interface Player {
  player_id: number;
  rank_number?: number;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  team_name?: string;
  category: string;
  division: string;
  rank_score?: number;
  group: string;
}
