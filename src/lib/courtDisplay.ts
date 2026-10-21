import type { CourtDisplayPlayer } from "../types";

interface TeamSource {
  players?: CourtDisplayPlayer[];
}

interface GameSource {
  team_a?: TeamSource;
  team_b?: TeamSource;
  players?: CourtDisplayPlayer[];
}

export interface CourtTeams {
  teamA: CourtDisplayPlayer[];
  teamB: CourtDisplayPlayer[];
  allPlayers: CourtDisplayPlayer[];
  format: "Singles" | "Doubles" | null;
}

export function getCourtTeams(game?: GameSource | null): CourtTeams {
  const apiTeamA = game?.team_a?.players;
  const apiTeamB = game?.team_b?.players;
  const allPlayers = game?.players ?? [...(apiTeamA ?? []), ...(apiTeamB ?? [])];
  const hasTeams = apiTeamA !== undefined || apiTeamB !== undefined;
  const half = Math.ceil(allPlayers.length / 2);
  const teamA = apiTeamA ?? (hasTeams ? [] : allPlayers.slice(0, half));
  const teamB = apiTeamB ?? (hasTeams ? [] : allPlayers.slice(half));

  return {
    teamA,
    teamB,
    allPlayers,
    format:
      allPlayers.length === 2
        ? "Singles"
        : allPlayers.length === 4
          ? "Doubles"
          : null,
  };
}
