import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type {
  Court,
  CourtActivity,
  CourtDisplayGame,
  CourtDisplayPlayer,
} from "../types";
import { getCourtTeams } from "../lib/courtDisplay";
import { CourtStatusBadge } from "./index";

interface MiniCourtProps {
  court: Court | CourtActivity;
  mode?: "admin" | "player";
  compact?: boolean;
  onCourtClick?: () => void;
  onScoreChange?: (gameId: number, side: 0 | 1, change: -1 | 1) => void;
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
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  hitFlash: number;
}

const COURT_BOUNDS = { x0: 24, x1: 256, y0: 18, y1: 138, net: 140 };

function formatCourtTime(game: CourtDisplayGame, now: number) {
  const startedAt = game.started_at ? new Date(game.started_at).getTime() : null;
  const endsAt = game.ends_at ? new Date(game.ends_at).getTime() : null;
  const durationSeconds = game.duration_minutes ? game.duration_minutes * 60 : null;
  const elapsedSeconds = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : null;
  const remainingSeconds = endsAt
    ? Math.max(0, Math.ceil((endsAt - now) / 1000))
    : durationSeconds !== null && elapsedSeconds !== null
      ? Math.max(0, durationSeconds - elapsedSeconds)
      : null;
  const shownSeconds = remainingSeconds ?? elapsedSeconds;
  if (shownSeconds === null) return "Live";
  const minutes = String(Math.floor(shownSeconds / 60)).padStart(2, "0");
  const seconds = String(shownSeconds % 60).padStart(2, "0");
  return remainingSeconds !== null
    ? `${minutes}:${seconds}${game.duration_minutes ? ` / ${game.duration_minutes}m` : " left"}`
    : `${minutes}:${seconds} elapsed`;
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
  const [hovered, setHovered] = useState<Dot | null>(null);
  const [aimPoint, setAimPoint] = useState<{ x: number; y: number } | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  const gameTime = court.active_game ? formatCourtTime(court.active_game, clockNow) : null;

  // Home positions for players
  const dots = useMemo<Dot[]>(() => {
    if (!playing) return [];
    const leftCount = teamA.length;
    const rightCount = teamB.length;
    const laneY = (count: number, i: number) => {
      if (count <= 1) return 78;
      const span = 96;
      return 78 - span / 2 + (span / (count - 1)) * i;
    };
    return [
      ...teamA.map((player, index) => ({
        player,
        side: 0 as Side,
        index,
        count: leftCount,
        x: 78,
        y: laneY(leftCount, index),
        cx: 78,
        cy: laneY(leftCount, index),
        vx: 0,
        vy: 0,
        hitFlash: 0,
      })),
      ...teamB.map((player, index) => ({
        player,
        side: 1 as Side,
        index,
        count: rightCount,
        x: 202,
        y: laneY(rightCount, index),
        cx: 202,
        cy: laneY(rightCount, index),
        vx: 0,
        vy: 0,
        hitFlash: 0,
      })),
    ];
  }, [teamA, teamB]);

  // Simplified rally animation using CSS keyframes + JS for ball position
  useEffect(() => {
    if (!playing || dots.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const moving = dots.map((dot) => ({
      ...dot,
      cx: dot.x,
      cy: dot.y,
    }));

    let hitter = 0;
    let receiver = moving.findIndex((m) => m.side !== moving[hitter].side);
    if (receiver < 0) receiver = 1;

    let shotT = 0;
    let shotDur = 0.9;
    let fromX = moving[hitter].cx;
    let fromY = moving[hitter].cy;
    let ballX = fromX;
    let ballY = fromY;
    let ballZ = 0;

    function randomReceiver(side: Side) {
      const candidates = moving
        .map((dot, index) => ({ dot, index }))
        .filter(({ dot }) => dot.side === side);
      return candidates[Math.floor(Math.random() * candidates.length)]?.index ?? 0;
    }

    function homeOf(m: (typeof moving)[number]) {
      const baseX = m.side === 0 ? 78 : 202;
      const count = m.count;
      const i = m.index;
      const baseY = count <= 1 ? 78 : 78 - 48 + (96 / (count - 1)) * i;
      return { x: baseX, y: baseY };
    }

    function startShot() {
      hitter = receiver;
      const nextSide: Side = moving[hitter].side === 0 ? 1 : 0;
      receiver = randomReceiver(nextSide);

      fromX = moving[hitter].cx;
      fromY = moving[hitter].cy;
      const home = homeOf(moving[receiver]);

      const aim = aimRef.current;
      if (aim && aim.side === nextSide) {
        toXRef.current = aim.x;
        toYRef.current = aim.y;
        aimRef.current = null;
        window.setTimeout(() => setAimPoint(null), 200);
      } else {
        const laneX0 = nextSide === 0 ? COURT_BOUNDS.x0 + 10 : COURT_BOUNDS.net + 14;
        const laneX1 = nextSide === 0 ? COURT_BOUNDS.net - 14 : COURT_BOUNDS.x1 - 10;
        let toX = laneX0 + Math.random() * (laneX1 - laneX0);
        let toY = COURT_BOUNDS.y0 + 12 + Math.random() * (COURT_BOUNDS.y1 - COURT_BOUNDS.y0 - 24);
        toX = toX * 0.4 + home.x * 0.6;
        toY = toY * 0.4 + home.y * 0.6;
        toXRef.current = toX;
        toYRef.current = toY;
      }

      const dx = toXRef.current - fromX;
      const dy = toYRef.current - fromY;
      const dist = Math.hypot(dx, dy);
      const arcH = Math.min(70, 26 + dist * 0.25 + Math.random() * 12);
      const GRAVITY = 320;
      const ballVZ = Math.sqrt(2 * GRAVITY * arcH);
      const flight = (2 * ballVZ) / GRAVITY;
      const ballVX = dx / flight;
      const ballVY = dy / flight;
      shotDur = flight;
      shotT = 0;
      ballX = fromX;
      ballY = fromY;
      ballZ = 0;

      // Store for animation
      moving[hitter].vx = 0;
      moving[hitter].vy = 0;
      moving[hitter].hitFlash = 1;

      // Attach velocities to ball via closure
      (startShot as any).ballVX = ballVX;
      (startShot as any).ballVY = ballVY;
      (startShot as any).ballVZ = ballVZ;
      (startShot as any).GRAVITY = GRAVITY;
    }

    startShot();

    let last = performance.now();
    let frameId = 0;

    function animate(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      shotT += dt;

      if (shotT >= shotDur) {
        ballX = toXRef.current;
        ballY = toYRef.current;
        ballZ = 0;
        startShot();
      } else {
        const ballVX = (startShot as any).ballVX;
        const ballVY = (startShot as any).ballVY;
        const ballVZ = (startShot as any).ballVZ;
        const GRAVITY = (startShot as any).GRAVITY;
        ballX = fromX + ballVX * shotT;
        ballY = fromY + ballVY * shotT;
        ballZ = Math.max(0, ballVZ * shotT - 0.5 * GRAVITY * shotT * shotT);
      }

      const t = Math.min(1, shotT / shotDur);
      const screenBallY = ballY - ballZ;

      // Update player positions
      moving.forEach((m, index) => {
        const home = homeOf(m);
        const isReceiver = index === receiver;
        const isHitter = index === hitter;

        let goalX = home.x;
        let goalY = home.y;

        if (isReceiver) {
          const lead = Math.min(0.9, t + 0.15);
          const predictX = fromX + (startShot as any).ballVX * shotDur * lead;
          const predictY = fromY + (startShot as any).ballVY * shotDur * lead;
          goalX = home.x * 0.35 + predictX * 0.65;
          goalY = home.y * 0.35 + predictY * 0.65;
        } else if (isHitter) {
          if (t < 0.35) goalX = home.x + (m.side === 0 ? 6 : -6);
        } else {
          goalX = home.x + Math.sin(now * 0.002 + index * 1.7) * 2.5;
          goalY = home.y + Math.cos(now * 0.0026 + index * 2.1) * 3;
        }

        const k = isReceiver ? 55 : isHitter ? 42 : 18;
        const damping = isReceiver ? 11 : isHitter ? 10 : 7;
        m.vx += (goalX - m.cx) * k * dt - m.vx * damping * dt;
        m.vy += (goalY - m.cy) * k * dt - m.vy * damping * dt;
        m.cx += m.vx * dt;
        m.cy += m.vy * dt;

        m.cx = Math.max(COURT_BOUNDS.x0 + 6, Math.min(COURT_BOUNDS.x1 - 6, m.cx));
        m.cy = Math.max(COURT_BOUNDS.y0 + 6, Math.min(COURT_BOUNDS.y1 - 6, m.cy));

        m.hitFlash = Math.max(0, (m.hitFlash) - dt * 3);
      });

      // Update DOM
      moving.forEach((m, index) => {
        const el = playerGroupRefs.current[index];
        if (el) {
          el.setAttribute("transform", `translate(${m.cx.toFixed(2)} ${m.cy.toFixed(2)})`);
        }
        const flash = hitFlashRefs.current[index];
        if (flash) {
          flash.setAttribute("r", (10 + (m.hitFlash) * 10).toFixed(1));
          flash.setAttribute("opacity", ((m.hitFlash) * 0.55).toFixed(2));
        }
      });

      if (ballRef.current) {
        const ballR = 3.6 + (ballZ / (70)) * 1.8;
        ballRef.current.setAttribute("cx", ballX.toFixed(2));
        ballRef.current.setAttribute("cy", screenBallY.toFixed(2));
        ballRef.current.setAttribute("r", ballR.toFixed(2));
      }
      if (glowRef.current) {
        glowRef.current.setAttribute("cx", ballX.toFixed(2));
        glowRef.current.setAttribute("cy", screenBallY.toFixed(2));
        glowRef.current.setAttribute("r", (7 + (ballZ / (70)) * 5).toFixed(1));
      }
      if (shadowRef.current) {
        shadowRef.current.setAttribute("cx", ballX.toFixed(2));
        shadowRef.current.setAttribute("cy", (ballY + 2).toFixed(2));
        shadowRef.current.setAttribute("rx", (4.5 - (ballZ / (70)) * 2).toFixed(2));
        shadowRef.current.setAttribute("opacity", Math.max(0.12, 0.45 - (ballZ / (70)) * 0.3).toFixed(2));
      }

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [playing, court.id, court.status, dots]);

  const aimRef = useRef<{ x: number; y: number; side: Side } | null>(null);
  const playerGroupRefs = useRef<(SVGGElement | null)[]>([]);
  const hitFlashRefs = useRef<(SVGCircleElement | null)[]>([]);
  const ballRef = useRef<SVGCircleElement | null>(null);
  const glowRef = useRef<SVGCircleElement | null>(null);
  const shadowRef = useRef<SVGEllipseElement | null>(null);
  const toXRef = useRef<number>(140);
  const toYRef = useRef<number>(78);

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
      x: Math.max(side === 0 ? 34 : 178, Math.min(side === 0 ? 128 : 248, x)),
      y: Math.max(28, Math.min(132, y)),
      side,
    };
    aimRef.current = point;
    setAimPoint(point);
  }

  const teamNames = (players: CourtDisplayPlayer[], fallback: string) =>
    players.map((p) => p.name.split(" ")[0]).join(" / ") || fallback;

  const courtStatusColor = court.status === "playing" ? "var(--color-primary-500)" : court.status === "available" ? "var(--color-success-500)" : "var(--color-warning-500)";
  const courtBgColor = maintenance ? "var(--color-surface-elevated)" : available ? "var(--color-primary-50)" : "var(--color-surface)";

  return (
    <article
      className={`mini-court-card ${compact ? "mini-court-card--compact" : ""}`}
      style={{
        "--court-status": courtStatusColor,
        "--court-bg": courtBgColor,
      } as React.CSSProperties}
    >
      <div className="mini-court-card__header">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`court-live-dot court-live-dot--${court.status}`}
              style={{
                backgroundColor:
                  court.status === "playing"
                    ? "var(--color-primary-500)"
                    : court.status === "available"
                      ? "var(--color-success-500)"
                      : "var(--color-warning-500)",
              }}
            />
            <h3 className="mini-court-card__name truncate">{court.name}</h3>
          </div>
          <p className="mini-court-card__format">
            {playing
              ? `${format ?? "Active"} match`
              : available
                ? "Ready for the next match"
                : "Court care in progress"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {playing && court.active_game && (
            <span className="mini-court-card__game-tag" title={`Game #${court.active_game.id}`}>
              {gameTime}
            </span>
          )}
          <CourtStatusBadge status={court.status} />
        </div>
      </div>

      <button
        type="button"
        className={`mini-court ${compact ? "mini-court--compact" : ""} ${
          available && onCourtClick ? "mini-court--interactive" : ""
        } ${playing ? "mini-court--aimable" : ""}`}
        onClick={handleCourtClick}
        aria-label={`${court.name}, ${court.status}${playing ? ". Click court to aim the next shot." : available && onCourtClick ? ". Select to assign players" : ""}`}
      >
        {hovered && (
          <span className="mini-court__tooltip">
            <span
              className={`mini-court__tooltip-dot ${hovered.side === 0 ? "team-a" : "team-b"}`}
            />
            <strong>{hovered.player.name}</strong>
            {hovered.player.skill_level && <span>· {hovered.player.skill_level}</span>}
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
            <linearGradient id={`court-apron-${court.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop
                offset="0"
                stopColor={maintenance ? "var(--color-border)" : available ? "var(--color-primary-100)" : "var(--color-primary-50)"}
              />
              <stop
                offset="1"
                stopColor={maintenance ? "var(--color-surface-sunken)" : available ? "var(--color-primary-200)" : "var(--color-primary-100)"}
              />
            </linearGradient>
            <linearGradient id={`court-floor-${court.id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={maintenance ? "var(--color-border)" : "var(--color-primary-600)"} />
              <stop offset="50%" stopColor={maintenance ? "var(--color-surface-sunken)" : "var(--color-primary-700)"} />
              <stop offset="50%" stopColor={maintenance ? "var(--color-surface-sunken)" : "var(--color-accent-500)"} />
              <stop offset="100%" stopColor={maintenance ? "var(--color-surface)" : "var(--color-accent-600)"} />
            </linearGradient>
          </defs>

          <rect width="280" height="156" rx="12" fill={`url(#court-apron-${court.id})`} />
          <rect x="5" y="5" width="270" height="146" rx="9" className="mini-court__frame-line" />

          <rect
            x="24"
            y="18"
            width="232"
            height="120"
            rx="2"
            fill={`url(#court-floor-${court.id})`}
          />
          <rect
            x="104"
            y="18"
            width="72"
            height="120"
            fill={maintenance ? "var(--color-surface-sunken)" : available ? "var(--color-primary-200)" : "var(--color-accent-100)"}
            fillOpacity="0.5"
          />
          {playing && (
            <rect x="24" y="18" width="232" height="120" rx="2" fill="#ffffff" fillOpacity="0.1" />
          )}

          <path
            className={`mini-court__lines ${maintenance ? "mini-court__lines--maintenance" : ""}`}
            d="M24 18H256V138H24z M104 18v120 M176 18v120 M24 78h80 M176 78h80"
          />

          {playing && (
            <>
              <text className="mini-court__team-a-label" x="64" y="12" textAnchor="middle">
                TEAM A
              </text>
              <text className="mini-court__team-b-label" x="216" y="12" textAnchor="middle">
                TEAM B
              </text>
            </>
          )}

          {available && (
            <g aria-hidden="true" className="mini-court__idle-markers">
              <circle cx="68" cy="78" r="11" fill="var(--color-primary-500)" fillOpacity=".18" />
              <circle cx="68" cy="78" r="5.5" fill="var(--color-primary-500)" stroke="#fff" strokeWidth="1.5" fillOpacity=".8" />
              <circle cx="212" cy="88" r="11" fill="var(--color-accent-500)" fillOpacity=".2" />
              <circle cx="212" cy="88" r="5.5" fill="var(--color-accent-500)" stroke="#fff" strokeWidth="1.5" fillOpacity=".75" />
              <ellipse cx="140" cy="88" rx="4.5" ry="2.3" fill="var(--color-surface)" fillOpacity=".2" />
              <circle cx="140" cy="82" r="7" fill="#fff" fillOpacity=".4" />
              <circle cx="140" cy="82" r="3.8" fill="#fff" stroke="var(--color-primary-500)" strokeWidth="1.1" />
            </g>
          )}

          <path className="mini-court__net-shadow" d="M143 14v128" />
          <path className="mini-court__net" d="M140 13v130" />
          <path className="mini-court__net-mesh" d="M140 16v124" />
          <circle className="mini-court__net-post" cx="140" cy="13" r="3" fill="var(--color-sky-500)" />
          <circle className="mini-court__net-post" cx="140" cy="143" r="3" fill="var(--color-sky-500)" />

          {playing && (
            <>
              <circle
                className="mini-court__pulse"
                cx="60"
                cy="82"
                r="8"
              />
              {dots.map((dot, index) => (
                <g
                  key={`${dot.player.id}-${dot.side}-${index}`}
                  ref={(el) => {
                    playerGroupRefs.current[index] = el;
                  }}
                  transform={`translate(${dot.x} ${dot.y})`}
                  className="mini-court__player-group"
                  tabIndex={0}
                  onMouseEnter={() => setHovered(dot)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(dot)}
                  onBlur={() => setHovered(null)}
                >
                  <ellipse className="mini-court__player-shadow" cx="0" cy="5" rx="6.5" ry="2.7" />
                  <circle
                    ref={(el) => {
                      hitFlashRefs.current[index] = el;
                    }}
                    cx="0"
                    cy="0"
                    r="10"
                    fill="var(--color-accent-400)"
                    opacity="0"
                    pointerEvents="none"
                  />
                  <circle
                    className={`mini-court__aura-${dot.side === 0 ? "a" : "b"}`}
                    cx="0"
                    cy="0"
                    r={11}
                  />
                  <circle
                    className={`mini-court__dot-${dot.side === 0 ? "a" : "b"}`}
                    cx="0"
                    cy="0"
                    r={6.5}
                  />
                  <circle className="mini-court__dot-highlight" cx="-1.7" cy="-1.7" r="1.5" />
                </g>
              ))}
              <circle
                className="mini-court__landing-marker"
                cx={toXRef.current || 140}
                cy={toYRef.current || 78}
                r="6"
                fill="none"
                stroke="var(--color-accent-300)"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                opacity="0.4"
              />
              <ellipse className="mini-court__ball-shadow" cx="140" cy="82" rx="4.5" ry="2.2" />
              <circle className="mini-court__ball-glow" cx="140" cy="78" r="7.5" />
              <circle ref={ballRef} className="mini-court__ball-core" cx="140" cy="78" r="4" />
              {aimPoint && (
                <circle className="mini-court__aim-point" cx={aimPoint.x} cy={aimPoint.y} r="8" />
              )}
            </>
          )}

          {maintenance && (
            <g>
              <path d="M24 18H256V138H24z" fill="var(--color-surface)" fillOpacity=".55" />
              <rect className="mini-court__maintenance-pill" x="80" y="63" width="120" height="28" rx="14" />
              <text className="mini-court__maintenance-text" x="140" y="81" textAnchor="middle">
                COURT MAINTENANCE
              </text>
            </g>
          )}
        </svg>

        {playing && !hovered && <span className="mini-court__hint">Click to aim · Hover dots</span>}
        {available && onCourtClick && !hovered && <span className="mini-court__hint mini-court__hint--cta">Idle court · Click to assign</span>}
      </button>

      {playing ? (
        <div className="mini-court-card__players">
          <span title={teamA.map((p) => p.name).join(", ")}>{teamNames(teamA, "Team A")}</span>
          <span className="mini-court-card__versus">VS</span>
          <span title={teamB.map((p) => p.name).join(", ")}>{teamNames(teamB, "Team B")}</span>
        </div>
      ) : (
        <p className="mini-court-card__message">
          {available ? "Ready for the next match" : "Unavailable for matches"}
        </p>
      )}

      {mode === "admin" && playing && court.active_game && onScoreChange && (
        <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Match score">
          {([0, 1] as const).map((side) => {
            const score = side === 0 ? court.active_game?.team_a?.points ?? 0 : court.active_game?.team_b?.points ?? 0;
            const label = side === 0 ? "Team A" : "Team B";
            return (
              <div key={side} className="flex items-center justify-between rounded-lg bg-surface-sunken px-2 py-1.5">
                <span className="text-xs font-semibold text-text-secondary">{label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove point from ${label}`}
                    disabled={scoreBusy || score <= 0}
                    onClick={() => onScoreChange(court.active_game!.id, side, -1)}
                    className="h-7 w-7 rounded-md border border-border bg-surface text-text-primary font-bold disabled:opacity-40 hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    −
                  </button>
                  <span className="min-w-5 text-center font-bold tabular-nums text-text-primary">{score}</span>
                  <button
                    type="button"
                    aria-label={`Add point to ${label}`}
                    disabled={scoreBusy || score >= 11}
                    onClick={() => onScoreChange(court.active_game!.id, side, 1)}
                    className="h-7 w-7 rounded-md border border-border bg-surface text-text-primary font-bold disabled:opacity-40 hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    +
                  </button>
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
        </p>
      )}
    </article>
  );
}