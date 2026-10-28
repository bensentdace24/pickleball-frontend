import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type {
  Court,
  CourtActivity,
  CourtDisplayGame,
  CourtDisplayPlayer,
  Game,
  Matchup,
} from "../../types";
import { getCourtTeams } from "../../lib/courtDisplay";
import { CourtStatusBadge } from "../CourtStatusBadge";

interface MiniCourtProps {
  court: Court | CourtActivity;
  mode?: "admin" | "player";
  compact?: boolean;
  onCourtClick?: () => void;
  onScoreChange?: (gameId: number, side: Side, change: -1 | 1) => void;
  scoreBusy?: boolean;
}

type Side = 0 | 1;
interface Dot {
  player: CourtDisplayPlayer;
  side: Side;
  index: number;
  count: number;
  x: number;
  y: number;
}

export function MiniCourt({
  court,
  mode = "admin",
  compact = false,
  onCourtClick,
  onScoreChange,
  scoreBusy = false,
}: MiniCourtProps) {
  const { teamA, teamB, allPlayers, format } = getCourtTeams(court.active_game);
  const playing = court.status === "playing" && allPlayers.length > 0;
  const available = court.status === "available";
  const maintenance = court.status === "maintenance";
  const svgRef = useRef<SVGSVGElement | null>(null);
  const ballRef = useRef<SVGCircleElement | null>(null);
  const glowRef = useRef<SVGCircleElement | null>(null);
  const shadowRef = useRef<SVGEllipseElement | null>(null);
  const trailRef = useRef<SVGPolylineElement | null>(null);
  const pulseRef = useRef<SVGCircleElement | null>(null);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const aimRef = useRef<{ x: number; y: number; side: Side } | null>(null);
  const [hovered, setHovered] = useState<Dot | null>(null);
  const [aimPoint, setAimPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [clockNow, setClockNow] = useState(() => Date.now());

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [playing]);

  const timer = court.active_game
    ? getTimer(court.active_game, clockNow)
    : null;

  const dots = useMemo<Dot[]>(() => {
    if (!playing) return [];
    const left = teamA;
    const right = teamB;
    return [
      ...left.map((player, index) => ({
        player,
        side: 0 as const,
        index,
        count: left.length,
        x: available ? 72 : 62,
        y: left.length === 1 ? 82 : index === 0 ? 52 : 112,
      })),
      ...right.map((player, index) => ({
        player,
        side: 1 as const,
        index,
        count: right.length,
        x: available ? 208 : 218,
        y: right.length === 1 ? 82 : index === 0 ? 52 : 112,
      })),
    ];
  }, [available, playing, teamA, teamB]);

  useEffect(() => {
    if (court.status !== "playing" || dots.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const moving = dots.map((dot) => ({
      ...dot,
      currentX: dot.x,
      currentY: dot.y,
    }));
    const home = (dot: Dot) => ({
      x: available ? (dot.side === 0 ? 72 : 208) : dot.side === 0 ? 62 : 218,
      y: dot.count === 1 ? 82 : dot.index === 0 ? 52 : 112,
    });
    // Each court has its own quick/slow pass pattern; every pattern totals 5s.
    const rallyCycles = [
      [450, 800, 1250, 2500],
      [1700, 700, 650, 1950],
      [900, 1800, 500, 1800],
      [650, 2150, 1450, 750],
      [1200, 500, 2200, 1100],
      [2000, 500, 1200, 1300],
    ] as const;
    const shotDurations = rallyCycles[(court.id - 1) % rallyCycles.length];
    let hitter = court.id % dots.length;
    let receiver = moving.findIndex((dot) => dot.side !== moving[hitter].side);
    let fromX = moving[hitter].x;
    let fromY = moving[hitter].y;
    let toX = moving[receiver].x;
    let toY = moving[receiver].y;
    let shotIndex = court.id % shotDurations.length;
    let shotElapsed = shotDurations[shotIndex] * ((court.id % 3) / 3);
    let arc = available ? 17 : 23;
    let curve = 0;
    let pulseAge = 1;
    let pulseX = fromX;
    let pulseY = fromY;
    let last = performance.now();
    let frameId = 0;
    const trail: { x: number; y: number }[] = [];

    function randomReceiver(side: Side) {
      const candidates = moving
        .map((dot, index) => ({ dot, index }))
        .filter(({ dot }) => dot.side === side);
      return (
        candidates[Math.floor(Math.random() * candidates.length)]?.index ?? 0
      );
    }

    function nextShot() {
      hitter = receiver;
      const nextSide: Side = moving[hitter].side === 0 ? 1 : 0;
      fromX = moving[hitter].currentX;
      fromY = moving[hitter].currentY;
      pulseX = fromX;
      pulseY = fromY;
      pulseAge = 0;
      receiver = randomReceiver(nextSide);
      const target = aimRef.current;
      if (target && target.side === nextSide) {
        toX = target.x;
        toY = target.y;
        arc = 11;
        aimRef.current = null;
        window.setTimeout(() => setAimPoint(null), 220);
      } else {
        const base = home(moving[receiver]);
        toX = Math.max(
          nextSide === 0 ? 32 : 178,
          Math.min(
            nextSide === 0 ? 102 : 248,
            base.x + (Math.random() - 0.5) * 35,
          ),
        );
        toY = Math.max(30, Math.min(134, base.y + (Math.random() - 0.5) * 44));
        arc = available ? 17 : Math.random() < 0.18 ? 34 : 21;
      }
      curve = (Math.random() - 0.5) * 10;
    }

    function animate(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      shotElapsed += dt * 1000;
      while (shotElapsed >= shotDurations[shotIndex]) {
        shotElapsed -= shotDurations[shotIndex];
        shotIndex = (shotIndex + 1) % shotDurations.length;
        nextShot();
      }
      const t = shotElapsed / shotDurations[shotIndex];
      const lift = Math.sin(Math.PI * t) * arc;
      const groundX = fromX + (toX - fromX) * t;
      const groundY = fromY + (toY - fromY) * t + Math.sin(Math.PI * t) * curve;
      const ballY = groundY - lift * 0.43;

      moving.forEach((dot, index) => {
        const base = home(dot);
        const receiving = index === receiver;
        const sway = Math.sin(now * 0.003 + index * 1.7);
        const goalX = receiving
          ? base.x + (toX - base.x) * Math.min(1, 0.25 + t)
          : base.x + sway * 2.2;
        const goalY = receiving
          ? base.y + (toY - base.y) * Math.min(1, 0.25 + t)
          : base.y + Math.cos(now * 0.0026 + index) * 2.8;
        dot.currentX +=
          (goalX - dot.currentX) * Math.min(1, dt * (receiving ? 7 : 3));
        dot.currentY +=
          (goalY - dot.currentY) * Math.min(1, dt * (receiving ? 7 : 3));
        dotRefs.current[index]?.setAttribute(
          "transform",
          `translate(${dot.currentX.toFixed(2)} ${dot.currentY.toFixed(2)})`,
        );
      });

      ballRef.current?.setAttribute("cx", groundX.toFixed(2));
      ballRef.current?.setAttribute("cy", ballY.toFixed(2));
      ballRef.current?.setAttribute("r", (4 + lift / 45).toFixed(2));
      glowRef.current?.setAttribute("cx", groundX.toFixed(2));
      glowRef.current?.setAttribute("cy", ballY.toFixed(2));
      shadowRef.current?.setAttribute("cx", groundX.toFixed(2));
      shadowRef.current?.setAttribute("cy", (groundY + 2).toFixed(2));
      shadowRef.current?.setAttribute(
        "opacity",
        Math.max(0.12, 0.4 - lift * 0.008).toFixed(2),
      );

      trail.push({ x: groundX, y: ballY });
      while (trail.length > (available ? 4 : 7)) trail.shift();
      trailRef.current?.setAttribute(
        "points",
        trail.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      );
      if (pulseAge < 1) {
        pulseAge = Math.min(1, pulseAge + dt * 2.7);
        pulseRef.current?.setAttribute("cx", pulseX.toFixed(2));
        pulseRef.current?.setAttribute("cy", pulseY.toFixed(2));
        pulseRef.current?.setAttribute("r", (6 + pulseAge * 14).toFixed(1));
        pulseRef.current?.setAttribute(
          "opacity",
          ((1 - pulseAge) * 0.75).toFixed(2),
        );
      }
      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [available, court.id, court.status, dots]);

  function handleCourtClick(event: MouseEvent<HTMLButtonElement>) {
    if (available && onCourtClick) {
      onCourtClick();
      return;
    }
    if (!playing || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 280;
    const y = ((event.clientY - rect.top) / rect.height) * 156;
    const side: Side = x < 140 ? 0 : 1;
    const point = {
      x: Math.max(side === 0 ? 30 : 178, Math.min(side === 0 ? 102 : 250, x)),
      y: Math.max(25, Math.min(135, y)),
      side,
    };
    aimRef.current = point;
    setAimPoint(point);
  }

  const id = court.id;
  const teamNames = (players: CourtDisplayPlayer[], fallback: string) =>
    players.map((player) => player.name.split(" ")[0]).join(" / ") || fallback;

  return (
    <article
      className={`mini-court-card ${compact ? "mini-court-card--compact" : ""}`}
    >
      <div className="mini-court-card__header">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`court-live-dot court-live-dot--${court.status}`}
            />
            <h3 className="mini-court-card__name truncate">{court.name}</h3>
          </div>
          <p className="mini-court-card__format">
            {playing
              ? `${format ?? "Active"} match in progress`
              : available
                ? "Ready for the next match"
                : "Court care in progress"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <CourtStatusBadge status={court.status} />
          {playing && timer && court.active_game && (
            <span
              className="mini-court-card__game-tag"
              data-tone={timer.tone}
              title={`Game #${court.active_game.id}`}
            >
              {timer.label}
              <small>{timer.caption}</small>
            </span>
          )}
        </div>
      </div>

      {playing && timer && (
        <div
          className="court-progress"
          data-tone={timer.tone}
          role="progressbar"
          aria-label="Game time used"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={timer.pct === null ? undefined : Math.round(timer.pct)}
        >
          <div
            className={`court-progress__bar ${timer.pct === null ? "court-progress__bar--open" : ""}`}
            style={{ width: `${timer.pct ?? 100}%` }}
          />
        </div>
      )}

      <button
        type="button"
        className={`mini-court ${compact ? "mini-court--compact" : ""} ${available && onCourtClick ? "mini-court--interactive" : ""} ${playing ? "mini-court--aimable" : ""}`}
        onClick={handleCourtClick}
        aria-label={`${court.name}, ${court.status}${playing ? `. Click court to aim the next shot.` : available && onCourtClick ? ". Select to assign players" : ""}`}
      >
        {hovered && (
          <span className="mini-court__tooltip">
            <span
              className={`mini-court__tooltip-dot ${hovered.side === 0 ? "bg-sky-400" : "bg-lemon-400"}`}
            />
            <strong>{hovered.player.name}</strong>
            {hovered.player.skill_level && (
              <span>· {hovered.player.skill_level}</span>
            )}
          </span>
        )}
        <svg
          ref={svgRef}
          className="mini-court__diagram"
          viewBox="0 0 280 156"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`court-apron-${id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0"
                stopColor={
                  maintenance ? "#8b989c" : "#bceef2"
                }
              />
              <stop
                offset="1"
                stopColor={
                  maintenance ? "#77868a" : "#f2bada"
                }
              />
            </linearGradient>
            <linearGradient
              id={`court-floor-${id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0"
                stopColor={maintenance ? "#94a3a8" : "#35cbd8"}
              />
              <stop
                offset="50%"
                stopColor={maintenance ? "#77888c" : "#20b9c9"}
              />
              <stop
                offset="50%"
                stopColor={maintenance ? "#77888c" : "#f06aae"}
              />
              <stop
                offset="100%"
                stopColor={maintenance ? "#66777b" : "#e957a0"}
              />
            </linearGradient>
            <linearGradient
              id={`court-kitchen-${id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0"
                stopColor={
                  maintenance ? "#78888d" : "#b9f2f4"
                }
              />
              <stop
                offset="1"
                stopColor={
                  maintenance ? "#66777b" : "#f9d3e7"
                }
              />
            </linearGradient>
            <radialGradient id={`court-glow-${id}`} cx="0.5" cy="0.45" r="0.65">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <pattern
              id={`court-stripes-${id}`}
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="4" fill="#ffffff" fillOpacity="0.045" />
            </pattern>
            <pattern
              id={`court-hazard-${id}`}
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="12" fill="#f59e0b" fillOpacity="0.2" />
            </pattern>
          </defs>

          <rect
            width="280"
            height="156"
            rx="12"
            fill={`url(#court-apron-${id})`}
          />
          <rect
            x="5"
            y="5"
            width="270"
            height="146"
            rx="9"
            className="mini-court__frame-line"
          />
          <rect
            x="24"
            y="18"
            width="232"
            height="120"
            rx="2"
            fill={`url(#court-floor-${id})`}
          />
          <rect
            x="24"
            y="18"
            width="232"
            height="120"
            rx="2"
            fill={`url(#court-stripes-${id})`}
          />
          <rect
            x="104"
            y="18"
            width="72"
            height="120"
            fill={`url(#court-kitchen-${id})`}
          />
          <rect
            x="24"
            y="18"
            width="232"
            height="120"
            rx="2"
            fill={`url(#court-glow-${id})`}
          />
          {maintenance && (
            <rect
              x="24"
              y="18"
              width="232"
              height="120"
              fill={`url(#court-hazard-${id})`}
            />
          )}
          <path
            className={`mini-court__lines ${maintenance ? "mini-court__lines--maintenance" : ""}`}
            d="M24 18H256V138H24z M104 18v120 M176 18v120 M24 78h80 M176 78h80"
          />
          {playing && (
            <>
              <text
                className="mini-court__team-a-label"
                x="64"
                y="12"
                textAnchor="middle"
              >
                TEAM A
              </text>
              <text
                className="mini-court__team-b-label"
                x="216"
                y="12"
                textAnchor="middle"
              >
                TEAM B
              </text>
            </>
          )}
          {available && (
            <g aria-hidden="true" className="mini-court__idle-markers">
              <circle cx="68" cy="78" r="11" fill="#ed5aa7" fillOpacity=".18" />
              <circle
                cx="68"
                cy="78"
                r="5.5"
                fill="#ed5aa7"
                stroke="#fff"
                strokeWidth="1.5"
                fillOpacity=".72"
              />
              <circle
                cx="212"
                cy="88"
                r="11"
                fill="#35cbd8"
                fillOpacity=".2"
              />
              <circle
                cx="212"
                cy="88"
                r="5.5"
                fill="#35cbd8"
                stroke="#fff"
                strokeWidth="1.5"
                fillOpacity=".65"
              />
              <ellipse
                cx="140"
                cy="88"
                rx="4.5"
                ry="2.3"
                fill="#173d42"
                fillOpacity=".2"
              />
              <circle cx="140" cy="82" r="7" fill="#ffffff" fillOpacity=".4" />
              <circle
                cx="140"
                cy="82"
                r="3.8"
                fill="#ffffff"
                stroke="#ed5aa7"
                strokeWidth="1.1"
              />
            </g>
          )}
          <path className="mini-court__net-shadow" d="M143 14v128" />
          <path className="mini-court__net" d="M140 13v130" />
          <path className="mini-court__net-mesh" d="M140 16v124" />
          <circle className="mini-court__net-post" cx="140" cy="13" r="3" />
          <circle className="mini-court__net-post" cx="140" cy="143" r="3" />

          {playing && (
            <>
              <circle
                ref={pulseRef}
                className="mini-court__pulse"
                cx="60"
                cy="82"
                r="8"
              />
              {dots.map((dot, index) => (
                <g
                  key={`${dot.player.id}-${dot.side}-${index}`}
                  ref={(element) => {
                    dotRefs.current[index] = element;
                  }}
                  transform={`translate(${dot.x} ${dot.y})`}
                  className="mini-court__player-group"
                  onMouseEnter={() => setHovered(dot)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <ellipse
                    className="mini-court__player-shadow"
                    cx="0"
                    cy="5"
                    rx="6.5"
                    ry="2.7"
                  />
                  <circle
                    className={`mini-court__aura-${dot.side === 0 ? "a" : "b"}`}
                    cx="0"
                    cy="0"
                    r={available ? 9 : 11}
                  />
                  <circle
                    className={`mini-court__dot-${dot.side === 0 ? "a" : "b"}`}
                    cx="0"
                    cy="0"
                    r={available ? 5.5 : 6.5}
                    opacity={available ? 0.78 : 1}
                  />
                  <text
                    className="mini-court__player-initial"
                    y="0.4"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {dot.player.name.charAt(0).toUpperCase()}
                  </text>
                  {!compact && (
                    <text
                      className="mini-court__player-name"
                      y="17"
                      textAnchor="middle"
                    >
                      {dot.player.name.split(" ")[0].slice(0, 9)}
                    </text>
                  )}
                </g>
              ))}
              <polyline ref={trailRef} className="mini-court__trail" />
              <ellipse
                ref={shadowRef}
                className="mini-court__ball-shadow"
                cx="140"
                cy="82"
                rx="4.5"
                ry="2.2"
              />
              <circle
                ref={glowRef}
                className="mini-court__ball-glow"
                cx="140"
                cy="78"
                r="7.5"
              />
              <circle
                ref={ballRef}
                className="mini-court__ball-core"
                cx="140"
                cy="78"
                r="4"
              />
              {aimPoint && (
                <circle
                  className="mini-court__aim-point"
                  cx={aimPoint.x}
                  cy={aimPoint.y}
                  r="8"
                />
              )}
            </>
          )}
          {maintenance && (
            <g>
              <path d="M24 18H256V138H24z" fill="#0f172a" fillOpacity=".45" />
              <rect
                className="mini-court__maintenance-pill"
                x="80"
                y="63"
                width="120"
                height="28"
                rx="14"
              />
              <text
                className="mini-court__maintenance-text"
                x="140"
                y="81"
                textAnchor="middle"
              >
                COURT MAINTENANCE
              </text>
            </g>
          )}
        </svg>
        {playing && !hovered && (
          <span className="mini-court__hint">
            Click to aim shot · Hover dots
          </span>
        )}
        {available && onCourtClick && !hovered && (
          <span className="mini-court__hint mini-court__hint--cta">
            Idle court · Click to assign
          </span>
        )}
      </button>

      {playing ? (
        <div className="mini-court-card__teams">
          <div
            className="mini-court-card__team mini-court-card__team--a"
            title={teamA.map((player) => player.name).join(", ")}
          >
            <span className="mini-court-card__team-label">Team A</span>
            <span className="mini-court-card__team-names">
              {teamNames(teamA, "Team A")}
            </span>
          </div>
          <span className="mini-court-card__versus">VS</span>
          <div
            className="mini-court-card__team mini-court-card__team--b"
            title={teamB.map((player) => player.name).join(", ")}
          >
            <span className="mini-court-card__team-label">Team B</span>
            <span className="mini-court-card__team-names">
              {teamNames(teamB, "Team B")}
            </span>
          </div>
        </div>
      ) : (
        <p className="mini-court-card__message">
          {available ? "Ready for the next match" : "Unavailable for matches"}
        </p>
      )}
      {mode === "admin" && playing && court.active_game && onScoreChange && (
        <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Match score">
          {([0, 1] as const).map((side) => {
            const score = side === 0
              ? court.active_game?.team_a?.points ?? 0
              : court.active_game?.team_b?.points ?? 0;
            const label = side === 0 ? "Team A" : "Team B";
            return (
              <div key={side} className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove point from ${label}`}
                    disabled={scoreBusy || score <= 0}
                    onClick={() => onScoreChange(court.active_game!.id, side, -1)}
                    className="h-7 w-7 rounded-md border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40"
                  >−</button>
                  <span className="min-w-5 text-center font-bold tabular-nums text-slate-900">{score}</span>
                  <button
                    type="button"
                    aria-label={`Add point to ${label}`}
                    disabled={scoreBusy || score >= 11}
                    onClick={() => onScoreChange(court.active_game!.id, side, 1)}
                    className="h-7 w-7 rounded-md border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40"
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {mode === "admin" && playing && court.active_game?.started_at && (
        <p className="mini-court-card__duration">
          Started{" "}
          {new Date(court.active_game.started_at).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
          {court.active_game.duration_minutes
            ? ` · ${court.active_game.duration_minutes} min game`
            : " · no time limit"}
        </p>
      )}
    </article>
  );
}

interface TimerInfo {
  label: string;
  caption: string;
  tone: "ok" | "warn" | "over" | "open";
  pct: number | null;
}

function mmss(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Countdown when the game has a time limit (and keeps counting past zero),
// plain elapsed clock when it doesn't.
function getTimer(game: CourtDisplayGame, now: number): TimerInfo | null {
  const startedAt = game.started_at
    ? new Date(game.started_at).getTime()
    : null;
  if (startedAt === null) return null;

  const endsAt = game.ends_at ? new Date(game.ends_at).getTime() : null;
  const limitMs = endsAt
    ? endsAt - startedAt
    : game.duration_minutes
      ? game.duration_minutes * 60_000
      : null;
  const elapsedMs = Math.max(0, now - startedAt);

  if (limitMs && limitMs > 0) {
    const remaining = startedAt + limitMs - now;
    const pct = Math.min(100, (elapsedMs / limitMs) * 100);
    if (remaining <= 0) {
      return {
        label: `+${mmss(-remaining)}`,
        caption: "over time",
        tone: "over",
        pct: 100,
      };
    }
    return {
      label: mmss(remaining),
      caption: `of ${Math.round(limitMs / 60_000)}m`,
      tone: pct >= 80 ? "warn" : "ok",
      pct,
    };
  }

  return {
    label: mmss(elapsedMs),
    caption: "elapsed",
    tone: "open",
    pct: null,
  };
}

interface CourtsSectionProps {
  courts: Court[] | null;
  loading: boolean;
  busy: boolean;
  canAssign: boolean;
  nextMatchup?: Matchup | null;
  onAssign: (courtId: number) => void;
  onStartUpNext: (matchup: Matchup, courtId: number) => void;
  onFinishGame: (game: Game) => void;
  onSetStatus: (court: Court, status: "available" | "maintenance") => void;
  onAddCourt: (name: string) => Promise<boolean>;
  onScoreChange: (gameId: number, side: 0 | 1, change: -1 | 1) => void;
}

export function CourtsSection({
  courts,
  loading,
  canAssign,
  onAssign,
  onScoreChange,
  busy,
}: CourtsSectionProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {loading ? (
        <p className="text-sm text-slate-400">Loading courts…</p>
      ) : (
        (courts ?? []).map((court) => (
          <MiniCourt
            key={court.id}
            court={court}
            onCourtClick={canAssign ? () => onAssign(court.id) : undefined}
            onScoreChange={onScoreChange}
            scoreBusy={busy}
          />
        ))
      )}
    </section>
  );
}
