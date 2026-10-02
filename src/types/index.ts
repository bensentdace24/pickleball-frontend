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
  | { player_id: number }
  | { name: string; phone?: string; skill_level?: SkillLevel };

export interface CreatePlayerPayload {
  name: string;
  phone?: string;
  skill_level?: SkillLevel;
}

export interface AssignGamePayload {
  court_id: number;
  queue_ids: number[];
  duration_minutes?: number;
}
