export interface User {
  _id: string;
  name: string;
  emoji: string;
  fominhaLevel: number;
  balance: number;
  online: boolean;
}

export interface Avatar {
  name: string;
  emoji: string;
  taken: boolean;
}

export interface Food {
  _id: string;
  emoji: string;
  x: number;
  y: number;
}

export interface Bet {
  _id: string;
  userId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'exact' | 'simple';
  exactHomeScore?: number;
  exactAwayScore?: number;
  simpleResult?: 'home' | 'draw' | 'away';
  stake: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

export interface Game {
  _id: string;
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  persian_date: string;
  stadium_id: string;
  stadium_name?: string;
  stadium_city?: string;
  stadium_timezone?: string;
  utc_date?: string;
  finished: 'TRUE' | 'FALSE';
  time_elapsed: string;
  type: string;
  home_team_name_en: string;
  home_team_name_fa: string;
  away_team_name_en: string;
  away_team_name_fa: string;
}

export interface Team {
  _id: string;
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
  id: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type Screen = 'login' | 'avatar' | 'dashboard' | 'apostas' | 'historico' | 'ranking';
