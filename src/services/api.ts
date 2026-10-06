import type { AxiosResponse } from "axios";
import { http } from "./http";
import type {
  ApiResponse,
  AssignGamePayload,
  Court,
  CreatePlayerPayload,
  Game,
  GameStatus,
  JoinQueuePayload,
  Matchup,
  Player,
  PlayerDetail,
  QueueEntry,
  RankingRow,
} from "../types";

async function unwrap<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  const response = await request;
  return response.data.data;
}

export const playersApi = {
  list: (search?: string) =>
    unwrap<Player[]>(
      http.get("/players", { params: search ? { search } : undefined }),
    ),

  create: (payload: CreatePlayerPayload) =>
    unwrap<Player>(http.post("/players", payload)),
  get: (id: number) => unwrap<PlayerDetail>(http.get(`/players/${id}`)),
};

export const courtsApi = {
  list: () => unwrap<Court[]>(http.get("/courts")),
  create: (name: string) => unwrap<Court>(http.post("/courts", { name })),
  setStatus: (id: number, status: "available" | "maintenance") =>
    unwrap<Court>(http.patch(`/courts/${id}/status`, { status })),
};

export const queueApi = {
  list: () => unwrap<QueueEntry[]>(http.get("/queue")),
  get: (id: number) => unwrap<QueueEntry>(http.get(`/queue/${id}`)),
  join: (payload: JoinQueuePayload) =>
    unwrap<QueueEntry>(http.post("/queue", payload)),
  cancel: (id: number) => unwrap<QueueEntry>(http.post(`/queue/${id}/cancel`)),
  callNext: (count = 4) =>
    unwrap<QueueEntry[]>(http.post("/queue/call-next", { count })),
};

export const gamesApi = {
  list: (status: GameStatus | "all" = "playing") =>
    unwrap<Game[]>(http.get("/games", { params: { status } })),
  assign: (payload: AssignGamePayload) =>
    unwrap<Game>(http.post("/games", payload)),
  finish: (id: number, teamAScore: number, teamBScore: number) =>
    unwrap<Game>(
      http.post(`/games/${id}/finish`, {
        team_a_score: teamAScore,
        team_b_score: teamBScore,
      }),
    ),
  smartAssign: (payload: {
    court_id: number;
    match_size: 2 | 4;
    duration_minutes?: number;
  }) => unwrap<Game>(http.post("/games/smart-assign", payload)),
};

export const rankingsApi = {
  list: () => unwrap<RankingRow[]>(http.get("/rankings")),
};

//matchups
export const matchupsApi = {
  list: () => unwrap<Matchup[]>(http.get("/matchups")),
  form: (
    assignments: { queue_id: number; side: 0 | 1 }[],
    durationMinutes?: number,
  ) =>
    unwrap<Matchup>(
      http.post("/matchups", {
        assignments,
        duration_minutes: durationMinutes,
      }),
    ),
  smartForm: (matchSize: 2 | 4, durationMinutes?: number) =>
    unwrap<Matchup>(
      http.post("/matchups/smart", {
        match_size: matchSize,
        duration_minutes: durationMinutes,
      }),
    ),
  start: (matchupId: number) =>
    unwrap<Game>(http.post(`/matchups/${matchupId}/start`, {})),

  cancel: (matchupId: number) =>
    unwrap<Matchup>(http.post(`/matchups/${matchupId}/cancel`)),
};
