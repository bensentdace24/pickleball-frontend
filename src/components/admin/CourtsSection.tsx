import { useState, type FormEvent } from "react";
import type { Court, CourtStatus, Game, Matchup } from "../../types";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { MiniCourt } from "../MiniCourt";
import { CourtStatusBadge } from "../CourtStatusBadge";

interface Props {
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
}

export function CourtsSection({
  courts,
  loading,
  busy,
  canAssign,
  nextMatchup,
  onAssign,
  onStartUpNext,
  onFinishGame,
  onSetStatus,
  onAddCourt,
}: Props) {
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | CourtStatus>("all");
  const courtList = courts ?? [];

  const counts = {
    all: courtList.length,
    playing: courtList.filter((c) => c.status === "playing").length,
    available: courtList.filter((c) => c.status === "available").length,
    maintenance: courtList.filter((c) => c.status === "maintenance").length,
  };
  const visibleCourts =
    filter === "all" ? courtList : courtList.filter((c) => c.status === filter);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (await onAddCourt(name.trim())) {
      setName("");
      setAdding(false);
    }
  }

  return (
    <Section
      title="Courts"
      action={
        adding ? (
          <form onSubmit={submit} className="flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
              placeholder="Court name"
              maxLength={100}
              className="w-36 rounded-lg border border-slate-700 bg-[#0a1220] px-3 py-1.5 text-sm text-[#f4f1e8] placeholder:text-slate-600 focus:border-amber-400 focus:outline-none sm:w-44"
            />
            <Button type="submit" size="sm" disabled={busy || !name.trim()}>
              Add
            </Button>
          </form>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            + Court
          </Button>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex flex-wrap gap-0.5 rounded-xl border border-slate-800 bg-[#0a1220] p-1"
          aria-label="Filter courts"
        >
          {(
            [
              ["all", "All", counts.all],
              ["playing", "Live", counts.playing],
              ["available", "Open", counts.available],
              ["maintenance", "Maint.", counts.maintenance],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filter === value
                  ? "bg-amber-400 text-[#0a0f1a]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              {label}
              <span
                className={`tabular-nums text-[0.65rem] ${
                  filter === value ? "text-[#0a0f1a]/60" : "text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {(["playing", "available", "maintenance"] as const).map((status) => (
            <CourtStatusBadge key={status} status={status} />
          ))}
        </div>
      </div>

      {loading && !courts ? (
        <Spinner />
      ) : courtList.length === 0 ? (
        <EmptyState title="No courts yet" hint="Add your first court above." />
      ) : visibleCourts.length === 0 ? (
        <EmptyState
          title="No courts match this filter"
          hint="Choose a different status."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourts.map((court) => (
            <div key={court.id} className="court-admin-card">
              <MiniCourt
                court={court}
                mode="admin"
                onCourtClick={
                  court.status === "available" && canAssign && !busy
                    ? () => onAssign(court.id)
                    : undefined
                }
              />
              <div className="flex flex-wrap gap-2 p-3 pt-0">
                {court.status === "available" && (
                  <>
                    <Button
                      size="sm"
                      disabled={busy || !canAssign}
                      onClick={() => onAssign(court.id)}
                    >
                      Assign
                    </Button>
                    {nextMatchup && (
                      <Button
                        size="sm"
                        variant="success"
                        disabled={busy}
                        onClick={() => onStartUpNext(nextMatchup, court.id)}
                      >
                        Up-Next
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => onSetStatus(court, "maintenance")}
                    >
                      Maint
                    </Button>
                  </>
                )}
                {court.status === "maintenance" && (
                  <Button
                    size="sm"
                    variant="success"
                    disabled={busy}
                    onClick={() => onSetStatus(court, "available")}
                  >
                    Available
                  </Button>
                )}
                {court.status === "playing" && (
                  <>
                    <span className="mr-auto self-center text-xs text-slate-500">
                      In progress
                    </span>
                    {court.active_game && (
                      <Button
                        size="sm"
                        variant="success"
                        disabled={busy}
                        onClick={() => onFinishGame(court.active_game!)}
                      >
                        Finish
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
