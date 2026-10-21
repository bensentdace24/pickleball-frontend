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
  const [filter, setFilter] = useState<"all" | CourtStatus>("all");
  const courtList = courts ?? [];
  const counts = {
    all: courtList.length,
    playing: courtList.filter((court) => court.status === "playing").length,
    available: courtList.filter((court) => court.status === "available").length,
    maintenance: courtList.filter((court) => court.status === "maintenance").length,
  };
  const visibleCourts = filter === "all" ? courtList : courtList.filter((court) => court.status === filter);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (await onAddCourt(name.trim())) setName("");
  }

  const addForm = (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New court name"
        maxLength={100}
        className="w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm sm:w-48"
      />
      <Button type="submit" size="sm" disabled={busy || !name.trim()}>
        Add court
      </Button>
    </form>
  );

  return (
    <Section title="Live Court Telemetry & Rally View" action={addForm}>
      <p className="mb-4 -mt-2 text-sm text-slate-500">Current court status and player positions. Rally movement is a visual simulation.</p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="Filter courts">
          {([
            ["all", `All (${counts.all})`],
            ["playing", `Live (${counts.playing})`],
            ["available", `Open (${counts.available})`],
            ["maintenance", `Maint. (${counts.maintenance})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === value ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="hidden flex-wrap gap-2 sm:flex" aria-label="Court status legend">
          {(["playing", "available", "maintenance"] as const).map((status) => (
            <CourtStatusBadge key={status} status={status} />
          ))}
        </div>
      </div>
      {loading && !courts ? (
        <Spinner />
      ) : courtList.length === 0 ? (
        <EmptyState title="No courts yet" hint="Add your first court above." />
      ) : (
        visibleCourts.length === 0 ? (
          <EmptyState title="No courts match this filter" hint="Choose a different court status." />
        ) : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourts.map((court) => (
            <div key={court.id} className="court-admin-card">
              <MiniCourt
                court={court}
                mode="admin"
                onCourtClick={court.status === "available" && canAssign && !busy ? () => onAssign(court.id) : undefined}
              />
              <div className="mt-auto flex flex-wrap gap-2 p-4 pt-0">
                {court.status === "available" && (
                  <>
                    <Button
                      size="sm"
                      disabled={busy || !canAssign}
                      onClick={() => onAssign(court.id)}
                    >
                      Assign queue
                    </Button>
                    {nextMatchup && (
                      <Button size="sm" variant="success" disabled={busy} onClick={() => onStartUpNext(nextMatchup, court.id)}>
                        Start Up-Next
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
                    Make available
                  </Button>
                )}
                {court.status === "playing" && (
                  <>
                    <p className="mr-auto self-center text-xs text-slate-500">Match in progress</p>
                    {court.active_game && <Button size="sm" variant="success" disabled={busy} onClick={() => onFinishGame(court.active_game!)}>Finish match</Button>}
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
