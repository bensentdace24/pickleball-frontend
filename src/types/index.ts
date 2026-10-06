export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type QueueStatus =
  | "waiting"
  | "called"
  | "playing"
  | "completed"
  | "cancelled";
export type CourtStatus = "available" | "playing" | "maintenance";
export type GameStatus = "playing" | "completed" | "cancelled";

export interface Player {
  id: number;
  name: string;
  phone: string | null;
  skill_level: SkillLevel | null;
  created_at: string;
}

export interface Game {
  id: number;
  status: GameStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  ends_at: string | null;
  court?: Court;
  players?: Player[];
}

export interface Court {
  id: number;
  name: string;
  status: CourtStatus;
  active_game: Game | null;
}

export interface QueueEntry {
  id: number;
  queue_number: number;
  status: QueueStatus;
  joined_at: string;
  called_at: string | null;
  player?: Player;
  position: number | null;
  game?: Game | null;
  match_type: MatchType;
}

// Response envelopes
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: Record<string, string[]> | null;
}

// Request payloads
export type JoinQueuePayload =
  | { player_id: number; match_type?: MatchType }
  | {
      name: string;
      phone?: string;
      skill_level?: SkillLevel;
      match_type?: MatchType;
    };
export interface CreatePlayerPayload {
  name: string;
  phone?: string;
  skill_level?: SkillLevel;
}

export interface TeamResult {
  players: Player[];
  points: number | null;
  result: "win" | "loss" | "draw" | null;
}

export interface Game {
  id: number;
  status: GameStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  ends_at: string | null;
  court?: Court;
  players?: Player[];
  team_a?: TeamResult;
  team_b?: TeamResult;
  skill_warning: string | null;
}

export interface AssignGamePayload {
  court_id: number;
  assignments: { queue_id: number; side: 0 | 1 }[];
  duration_minutes?: number;
}

export interface RankingRow {
  rank: number;
  player_id: number;
  name: string;
  total_points: number;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  avg_seconds: number | null;
}

export interface Matchup {
  id: number;
  status: "pending" | "started" | "cancelled";
  match_size: 2 | 4;
  duration_minutes: number | null;
  created_at: string;
  team_a: Player[];
  team_b: Player[];
  skill_warning: string | null;
}

export type MatchType = "any" | "singles" | "doubles";

// Additional types for player details and stats
export interface PlayerStats {
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  total_points: number;
}

export interface PlayerDetail {
  player: Player;
  stats: PlayerStats;
  currently_in_queue: boolean;
  current_status: QueueStatus | null;
}
