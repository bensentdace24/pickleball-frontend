import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type {
  Court,
  CourtActivity,
  CourtDisplayGame,
  CourtDisplayPlayer,
} from "../types";
import { getCourtTeams } from "../lib/courtDisplay";
import { CourtStatusBadge } from "./CourtStatusBadge";

interface MiniCourtProps {
  court: Court | CourtActivity;
  mode?: "admin" | "player";
  compact?: boolean;
  onCourtClick?: () => void;
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

// SVG viewBox is 280x156. Court playing area is x:[24,256], y:[18,138].
const COURT = { x0: 24, x1: 256, y0: 18, y1: 138, net: 140 };
const GRAVITY = 320; // px/s^2 in SVG units

export function MiniCourt({
  court,
  mode = "admin",
  compact = false,
  onCourtClick,
}: MiniCourtProps) {
  const { teamA, teamB, allPlayers, format } = getCourtTeams(court.active_game);
  const playing = court.status === "playing" && allPlayers.length > 0;
  const available = court.status === "available";

  const svgRef = useRef<SVGSVGElement | null>(null);
  const ballRef = useRef<SVGCircleElement | null>(null);
  const glowRef = useRef<SVGCircleElement | null>(null);
  const shadowRef = useRef<SVGEllipseElement | null>(null);
  const trailRef = useRef<SVGPolylineElement | null>(null);
  const landingRef = useRef<SVGCircleElement | null>(null);
  const pulseRef = useRef<SVGCircleElement | null>(null);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const hitFlashRefs = useRef<(SVGCircleElement | null)[]>([]);
  const aimRef = useRef<{ x: number; y: number; side: Side } | null>(null);

  const [hovered, setHovered] = useState<Dot | null>(null);
  const [aimPoint, setAimPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [clockNow, setClockNow] = useState(() => Date.now());

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  const gameTime = court.active_game
    ? formatCourtTime(court.active_game, clockNow)
    : null;

  // Home positions. When playing, spread the team across the half-court.
  const homes = useMemo(() => {
    const leftCount = teamA.length;
    const rightCount = teamB.length;
    const laneY = (count: number, i: number) => {
      if (count <= 1) return 78;
      const span = 96; // vertical spread
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
      })),
      ...teamB.map((player, index) => ({
        player,
        side: 1 as Side,
        index,
        count: rightCount,
        x: 202,
        y: laneY(rightCount, index),
      })),
    ];
  }, [teamA, teamB]);

  const dots = playing ? homes : [];

  // The rally simulation.
  useEffect(() => {
    if (!playing || dots.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const moving = dots.map((dot) => ({
      ...dot,
      cx: dot.x,
      cy: dot.y,
      vx: 0,
      vy: 0,
      hitFlash: 0,
    }));

    let hitter = 0;
    let receiver = moving.findIndex((m) => m.side !== moving[hitter].side);
    if (receiver < 0) receiver = 1;

    // Shot state
    let shotT = 0;
    let shotDur = 0.9;
    let fromX = moving[hitter].cx;
    let fromY = moving[hitter].cy;
    let toX = moving[receiver].cx;
    let toY = moving[receiver].cy;
    let arcH = 34;
    let ballX = fromX;
    let ballY = fromY;
    let ballZ = 0; // height above ground (0 = on ground)
    let ballVZ = 0;
    let ballVX = 0;
    let ballVY = 0;
    let aimX = toX;
    let aimY = toY;

    const trail: { x: number; y: number }[] = [];
    let pulseAge = 1;
    let pulseX = 0;
    let pulseY = 0;

    function randomReceiver(side: Side) {
      const candidates = moving
        .map((dot, index) => ({ dot, index }))
        .filter(({ dot }) => dot.side === side);
      return (
        candidates[Math.floor(Math.random() * candidates.length)]?.index ?? 0
      );
    }

    function homeOf(m: (typeof moving)[number]) {
      const baseX = m.side === 0 ? 78 : 202;
      const count = m.count;
      const i = m.index;
      const baseY = count <= 1 ? 78 : 78 - 48 + (96 / (count - 1)) * i;
      return { x: baseX, y: baseY };
    }

    function startShot() {
      // Hitter is whoever just received.
      hitter = receiver;
      const nextSide: Side = moving[hitter].side === 0 ? 1 : 0;
      receiver = randomReceiver(nextSide);

      fromX = moving[hitter].cx;
      fromY = moving[hitter].cy;
      const home = homeOf(moving[receiver]);

      // Aimed shot?
      const aim = aimRef.current;
      if (aim && aim.side === nextSide) {
        toX = aim.x;
        toY = aim.y;
        aimRef.current = null;
        window.setTimeout(() => setAimPoint(null), 200);
      } else {
        // Natural rally: land inside the receiver's half with variation.
        const laneX0 = nextSide === 0 ? COURT.x0 + 10 : COURT.net + 14;
        const laneX1 = nextSide === 0 ? COURT.net - 14 : COURT.x1 - 10;
        toX = laneX0 + Math.random() * (laneX1 - laneX0);
        toY = COURT.y0 + 12 + Math.random() * (COURT.y1 - COURT.y0 - 24);
        // Bias toward the receiver so they don't have to run the whole court.
        toX = toX * 0.4 + home.x * 0.6;
        toY = toY * 0.4 + home.y * 0.6;
      }

      aimX = toX;
      aimY = toY;

      // Solve ballistic arc: given horizontal distance and a target apex height.
      const dx = toX - fromX;
      const dy = toY - fromY;
      const dist = Math.hypot(dx, dy);
      // Bigger distance -> higher lob, but capped.
      arcH = Math.min(70, 26 + dist * 0.25 + Math.random() * 12);
      // Choose a flight time so the apex lands at arcH under gravity.
      // h(t) = vz*t - 0.5*g*t^2, apex at t = vz/g, apex height = vz^2/(2g)
      ballVZ = Math.sqrt(2 * GRAVITY * arcH);
      // Horizontal velocity set so ball reaches target exactly when it lands.
      // Flight time is 2*vz/g (symmetric up/down).
      const flight = (2 * ballVZ) / GRAVITY;
      ballVX = dx / flight;
      ballVY = dy / flight;
      shotDur = flight;
      shotT = 0;
      ballX = fromX;
      ballY = fromY;
      ballZ = 0;

      // Hitter flash + pulse.
      moving[hitter].hitFlash = 1;
      pulseX = fromX;
      pulseY = fromY;
      pulseAge = 0;

      // The ball trail resets each shot.
      trail.length = 0;
    }

    // Initial shot
    startShot();

    let last = performance.now();
    let frameId = 0;

    function animate(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      shotT += dt;

      if (shotT >= shotDur) {
        // Ball landed. Snap and start the next shot.
        ballX = aimX;
        ballY = aimY;
        ballZ = 0;
        startShot();
      } else {
        ballX = fromX + ballVX * shotT;
        ballY = fromY + ballVY * shotT;
        ballZ = Math.max(0, ballVZ * shotT - 0.5 * GRAVITY * shotT * shotT);
      }

      const t = Math.min(1, shotT / shotDur);
      // On-screen y = ground y minus height (z).
      const screenBallY = ballY - ballZ;

      // --- Players ---
      moving.forEach((m, index) => {
        const home = homeOf(m);
        const isReceiver = index === receiver;
        const isHitter = index === hitter;

        // Where do they want to be?
        let goalX = home.x;
        let goalY = home.y;

        if (isReceiver) {
          // Run to intercept the ball's landing spot, arriving slightly early.
          const lead = Math.min(0.9, t + 0.15);
          const predictX = fromX + ballVX * shotDur * lead;
          const predictY = fromY + ballVY * shotDur * lead;
          goalX = home.x * 0.35 + predictX * 0.65;
          goalY = home.y * 0.35 + predictY * 0.65;
        } else if (isHitter) {
          // Follow through: lean toward the net after contact.
          if (t < 0.35) {
            goalX = home.x + (m.side === 0 ? 6 : -6);
          }
        } else {
          // Others shuffle on their toes.
          goalX = home.x + Math.sin(now * 0.002 + index * 1.7) * 2.5;
          goalY = home.y + Math.cos(now * 0.0026 + index * 2.1) * 3;
        }

        // Spring-damper toward goal — gives weight and follow-through.
        const k = isReceiver ? 55 : isHitter ? 42 : 18;
        const damping = isReceiver ? 11 : isHitter ? 10 : 7;
        const ax = (goalX - m.cx) * k - m.vx * damping;
        const ay = (goalY - m.cy) * k - m.vy * damping;
        m.vx += ax * dt;
        m.vy += ay * dt;
        m.cx += m.vx * dt;
        m.cy += m.vy * dt;

        // Clamp inside court.
        m.cx = Math.max(COURT.x0 + 6, Math.min(COURT.x1 - 6, m.cx));
        m.cy = Math.max(COURT.y0 + 6, Math.min(COURT.y1 - 6, m.cy));

        // Hit flash decay
        m.hitFlash = Math.max(0, m.hitFlash - dt * 3);

        const el = dotRefs.current[index];
        if (el) {
          el.setAttribute(
            "transform",
            `translate(${m.cx.toFixed(2)} ${m.cy.toFixed(2)})`,
          );
        }
        const flash = hitFlashRefs.current[index];
        if (flash) {
          flash.setAttribute("r", (10 + m.hitFlash * 10).toFixed(1));
          flash.setAttribute("opacity", (m.hitFlash * 0.55).toFixed(2));
        }
      });

      // --- Ball visuals ---
      const ballR = 3.6 + (ballZ / (arcH || 1)) * 1.8;
      ballRef.current?.setAttribute("cx", ballX.toFixed(2));
      ballRef.current?.setAttribute("cy", screenBallY.toFixed(2));
      ballRef.current?.setAttribute("r", ballR.toFixed(2));

      glowRef.current?.setAttribute("cx", ballX.toFixed(2));
      glowRef.current?.setAttribute("cy", screenBallY.toFixed(2));
      glowRef.current?.setAttribute(
        "r",
        (7 + (ballZ / (arcH || 1)) * 5).toFixed(1),
      );

      shadowRef.current?.setAttribute("cx", ballX.toFixed(2));
      shadowRef.current?.setAttribute("cy", (ballY + 2).toFixed(2));
      shadowRef.current?.setAttribute(
        "rx",
        (4.5 - (ballZ / (arcH || 1)) * 2).toFixed(2),
      );
      shadowRef.current?.setAttribute(
        "opacity",
        Math.max(0.12, 0.45 - (ballZ / (arcH || 1)) * 0.3).toFixed(2),
      );

      // Trail
      if (shotT < shotDur * 0.98) {
        trail.push({ x: ballX, y: screenBallY });
        while (trail.length > 9) trail.shift();
        trailRef.current?.setAttribute(
          "points",
          trail.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
        );
      } else {
        trailRef.current?.setAttribute("points", "");
      }

      // Landing marker
      if (landingRef.current) {
        const near = Math.max(
          0,
          1 - Math.abs(shotDur * 0.5 - shotT) / (shotDur * 0.5),
        );
        landingRef.current.setAttribute("cx", aimX.toFixed(2));
        landingRef.current.setAttribute("cy", aimY.toFixed(2));
        landingRef.current.setAttribute("r", (5 + near * 3).toFixed(1));
        landingRef.current.setAttribute(
          "opacity",
          (0.2 + near * 0.45).toFixed(2),
        );
      }

      // Contact pulse
      if (pulseAge < 1) {
        pulseAge = Math.min(1, pulseAge + dt * 3.5);
        pulseRef.current?.setAttribute("cx", pulseX.toFixed(2));
        pulseRef.current?.setAttribute("cy", pulseY.toFixed(2));
        pulseRef.current?.setAttribute("r", (4 + pulseAge * 18).toFixed(1));
        pulseRef.current?.setAttribute(
          "opacity",
          ((1 - pulseAge) * 0.7).toFixed(2),
        );
      }

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [playing, court.id, court.status, dots, homes]);

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
              ? `${format ?? "Active"} match · Rally simulation`
              : available
                ? "Ready for the next match"
                : "Court care in progress"}
          </p>
        </div>
        {playing && court.active_game && (
          <span
            className="mini-court-card__game-tag"
            title={`Game #${court.active_game.id}`}
          >
            {gameTime}
          </span>
        )}
        <CourtStatusBadge status={court.status} />
      </div>

      <button
        type="button"
        className={`mini-court ${compact ? "mini-court--compact" : ""} ${
          available && onCourtClick ? "mini-court--interactive" : ""
        } ${playing ? "mini-court--aimable" : ""}`}
        onClick={handleCourtClick}
        aria-label={`${court.name}, ${court.status}${
          playing
            ? ". Click court to aim the next shot."
            : available && onCourtClick
              ? ". Select to assign players"
              : ""
        }`}
      >
        {hovered && (
          <span className="mini-court__tooltip">
            <span
              className={`mini-court__tooltip-dot mini-court__tooltip-dot--${
                hovered.side === 0 ? "a" : "b"
              }`}
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
              id={`court-apron-${court.id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0"
                stopColor={
                  court.status === "maintenance"
                    ? "#334155"
                    : available
                      ? "#1e293b"
                      : "#0f172a"
                }
              />
              <stop
                offset="1"
                stopColor={
                  court.status === "maintenance"
                    ? "#1e293b"
                    : available
                      ? "#0f172a"
                      : "#020617"
                }
              />
            </linearGradient>
            <linearGradient
              id={`court-floor-${court.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0"
                stopColor={
                  court.status === "maintenance" ? "#475569" : "#0e7490"
                }
              />
              <stop
                offset="1"
                stopColor={
                  court.status === "maintenance" ? "#334155" : "#155e75"
                }
              />
            </linearGradient>
            <radialGradient
              id={`court-glow-${court.id}`}
              cx="0.5"
              cy="0.5"
              r="0.5"
            >
              <stop offset="0" stopColor="#facc15" stopOpacity="0.35" />
              <stop offset="1" stopColor="#facc15" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect
            width="280"
            height="156"
            rx="12"
            fill={`url(#court-apron-${court.id})`}
          />
          <rect
            x="5"
            y="5"
            width="270"
            height="146"
            rx="9"
            className="mini-court__frame-line"
          />

          {/* Court floor */}
          <rect
            x="24"
            y="18"
            width="232"
            height="120"
            rx="2"
            fill={`url(#court-floor-${court.id})`}
          />
          {/* Kitchen (non-volley zone) subtle tint */}
          <rect
            x="104"
            y="18"
            width="72"
            height="120"
            fill={
              court.status === "maintenance"
                ? "#64748b"
                : available
                  ? "#0d9488"
                  : "#0f766e"
            }
            fillOpacity="0.65"
          />
          {/* Live glow behind center line */}
          {playing && (
            <rect
              x="24"
              y="18"
              width="232"
              height="120"
              fill={`url(#court-glow-${court.id})`}
              opacity="0.25"
            />
          )}

          <path
            className={`mini-court__lines ${
              court.status === "maintenance"
                ? "mini-court__lines--maintenance"
                : ""
            }`}
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
            <g aria-hidden="true">
              <circle cx="68" cy="78" r="11" fill="#facc15" fillOpacity=".14" />
              <circle
                cx="68"
                cy="78"
                r="5.5"
                fill="#fde047"
                fillOpacity=".8"
                stroke="#0a0f1a"
                strokeWidth="1.5"
              />
              <circle
                cx="212"
                cy="88"
                r="11"
                fill="#fde047"
                fillOpacity=".12"
              />
              <circle
                cx="212"
                cy="88"
                r="5.5"
                fill="#fef9c3"
                fillOpacity=".75"
                stroke="#0a0f1a"
                strokeWidth="1.5"
              />
              <ellipse
                cx="140"
                cy="88"
                rx="4.5"
                ry="2.3"
                fill="#020617"
                fillOpacity=".4"
              />
              <circle cx="140" cy="82" r="7" fill="#fde047" fillOpacity=".28" />
              <circle
                cx="140"
                cy="82"
                r="3.8"
                fill="#facc15"
                stroke="#fef9c3"
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
                  ref={(el) => {
                    dotRefs.current[index] = el;
                  }}
                  transform={`translate(${dot.x} ${dot.y})`}
                  className="mini-court__player-group"
                  tabIndex={0}
                  onMouseEnter={() => setHovered(dot)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(dot)}
                  onBlur={() => setHovered(null)}
                >
                  <ellipse
                    className="mini-court__player-shadow"
                    cx="0"
                    cy="5"
                    rx="6.5"
                    ry="2.7"
                  />
                  <circle
                    ref={(el) => {
                      hitFlashRefs.current[index] = el;
                    }}
                    cx="0"
                    cy="0"
                    r="10"
                    fill="#facc15"
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
                  <circle
                    className="mini-court__dot-highlight"
                    cx="-1.7"
                    cy="-1.7"
                    r="1.5"
                  />
                </g>
              ))}

              {/* Landing marker */}
              <circle
                ref={landingRef}
                cx="140"
                cy="78"
                r="6"
                fill="none"
                stroke="#fde047"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                opacity="0.4"
              />

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

          {court.status === "maintenance" && (
            <g>
              <path d="M24 18H256V138H24z" fill="#0a0f1a" fillOpacity=".55" />
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
          <span className="mini-court__hint">Click to aim · Hover dots</span>
        )}
        {available && onCourtClick && !hovered && (
          <span className="mini-court__hint">Idle court · Click to assign</span>
        )}
      </button>

      {playing ? (
        <div className="mini-court-card__players">
          <span title={teamA.map((p) => p.name).join(", ")}>
            {teamA.map((p) => p.name.split(" ")[0]).join(" / ") || "Team A"}
          </span>
          <span className="mini-court-card__versus">VS</span>
          <span title={teamB.map((p) => p.name).join(", ")}>
            {teamB.map((p) => p.name.split(" ")[0]).join(" / ") || "Team B"}
          </span>
        </div>
      ) : (
        <p className="mini-court-card__message">
          {available ? "Ready for the next match" : "Unavailable for matches"}
        </p>
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

function formatCourtTime(game: CourtDisplayGame, now: number) {
  const startedAt = game.started_at
    ? new Date(game.started_at).getTime()
    : null;
  const endsAt = game.ends_at ? new Date(game.ends_at).getTime() : null;
  const durationSeconds = game.duration_minutes
    ? game.duration_minutes * 60
    : null;
  const elapsedSeconds = startedAt
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : null;
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
