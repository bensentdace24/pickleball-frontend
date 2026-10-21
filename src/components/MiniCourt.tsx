import type { Court } from "../types";
import { getCourtTeams } from "../lib/courtDisplay";
import { CourtStatusBadge } from "./CourtStatusBadge";

interface MiniCourtProps {
  court: Court;
  mode?: "admin" | "player";
  compact?: boolean;
  onCourtClick?: () => void;
}

export function MiniCourt({
  court,
  mode = "admin",
  compact = false,
  onCourtClick,
}: MiniCourtProps) {
  const { teamA, teamB, allPlayers, format } = getCourtTeams(court.active_game);
  const playing = court.status === "playing" && allPlayers.length > 0;
  const available = court.status === "available";
  const interactive = Boolean(onCourtClick) && (available || playing);

  return (
    <article
      className={`mini-court-card ${compact ? "mini-court-card--compact" : ""}`}
    >
      <div className="mini-court-card__header">
        <div>
          <h3 className="mini-court-card__name">{court.name}</h3>
          {playing && format && (
            <p className="mini-court-card__format">{format} match</p>
          )}
        </div>
        <CourtStatusBadge status={court.status} />
      </div>

      <button
        type="button"
        className={`mini-court ${compact ? "mini-court--compact" : ""} ${interactive ? "mini-court--interactive" : ""}`}
        onClick={interactive ? onCourtClick : undefined}
        disabled={!interactive}
        aria-label={`${court.name}, ${court.status}${playing ? `, ${format ?? "match"} with ${allPlayers.map((player) => player.name).join(", ")}` : ""}${available && onCourtClick ? ". Select to assign players" : ""}`}
      >
        <svg
          className="mini-court__diagram"
          viewBox="0 0 280 150"
          role="img"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="278" height="148" rx="12" fill="#192437" />
          <rect x="24" y="24" width="232" height="116" fill="#08699b" />
          <rect x="104" y="24" width="72" height="116" fill="#0c8f83" />
          <path
            className="mini-court__lines"
            d="M24 24H256V140H24z M104 24v116 M176 24v116 M24 82h80 M176 82h80"
          />
          <text
            className="mini-court__team-a-label"
            x="70"
            y="17"
            textAnchor="middle"
          >
            TEAM A
          </text>
          <text
            className="mini-court__team-b-label"
            x="210"
            y="17"
            textAnchor="middle"
          >
            TEAM B
          </text>
          <path className="mini-court__net-shadow" d="M140 19v124" />
          <path className="mini-court__net" d="M140 19v124" />
          <path className="mini-court__net-mesh" d="M140 25v112" />
          <circle className="mini-court__net-post" cx="140" cy="19" r="2.8" />
          {playing &&
            [...teamA, ...teamB].map((player, index) => {
              const isTeamA = index < teamA.length;
              const teamIndex = isTeamA ? index : index - teamA.length;
              const teamCount = isTeamA ? teamA.length : teamB.length;
              const x = isTeamA ? 62 : 218;
              const y = teamCount === 1 ? 82 : teamIndex === 0 ? 55 : 108;
              const colorClass = isTeamA ? "a" : "b";
              return (
                <g
                  key={`${player.id}-${index}`}
                  className="mini-court__player-group"
                  tabIndex={0}
                >
                  <title>
                    {player.name}
                    {player.skill_level ? ` · ${player.skill_level}` : ""}
                  </title>
                  <circle
                    className={`mini-court__aura-${colorClass}`}
                    cx={x}
                    cy={y}
                    r="12"
                  />
                  <circle
                    className={`mini-court__dot-${colorClass}`}
                    cx={x}
                    cy={y}
                    r="7.5"
                  />
                  <circle
                    className="mini-court__dot-highlight"
                    cx={x - 2}
                    cy={y - 2}
                    r="2"
                  />
                </g>
              );
            })}
          {playing && (
            <g className="mini-court__ball-motion">
              <circle
                className="mini-court__ball-shadow"
                cx="140"
                cy="91"
                r="4.4"
              />
              <circle
                className="mini-court__ball-glow"
                cx="140"
                cy="89"
                r="7"
              />
              <circle
                className="mini-court__ball-core"
                cx="140"
                cy="89"
                r="4"
              />
            </g>
          )}
          {court.status === "maintenance" && (
            <g>
              <path d="M24 24H256V140H24z" fill="#111827" fillOpacity=".62" />
              <rect
                className="mini-court__maintenance-pill"
                x="90"
                y="67"
                width="100"
                height="22"
                rx="11"
              />
              <text
                className="mini-court__maintenance-text"
                x="140"
                y="81.5"
                textAnchor="middle"
              >
                MAINTENANCE
              </text>
            </g>
          )}
        </svg>
        {playing && (
          <span className="mini-court__overlay">
            Rally simulation · no live game events
          </span>
        )}
      </button>

      {playing ? (
        <div className="mini-court-card__players">
          <span title={teamA.map((player) => player.name).join(", ")}>
            {teamA.map((player) => player.name).join(" / ") || "Team A"}
          </span>
          <span className="mini-court-card__versus">VS</span>
          <span title={teamB.map((player) => player.name).join(", ")}>
            {teamB.map((player) => player.name).join(" / ") || "Team B"}
          </span>
        </div>
      ) : available ? (
        <p className="mini-court-card__message">Ready for the next match</p>
      ) : court.status === "maintenance" ? (
        <p className="mini-court-card__message">Unavailable for matches</p>
      ) : null}
      {mode === "admin" && playing && court.active_game?.started_at && (
        <p className="mini-court-card__duration">
          Match started{" "}
          {new Date(court.active_game.started_at).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}
    </article>
  );
}
