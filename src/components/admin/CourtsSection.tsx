import { useState, type FormEvent } from "react";
import type { Court } from "../../types";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { MiniCourt } from "../MiniCourt";

interface Props {
  courts: Court[] | null;
  loading: boolean;
  busy: boolean;
  canAssign: boolean;
  onAssign: (courtId: number) => void;
  onSetStatus: (court: Court, status: "available" | "maintenance") => void;
  onAddCourt: (name: string) => Promise<boolean>;
}

export function CourtsSection({
  courts,
  loading,
  busy,
  canAssign,
  onAssign,
  onSetStatus,
  onAddCourt,
}: Props) {
  const [name, setName] = useState("");

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
    <Section title="Courts" action={addForm}>
      {loading && !courts ? (
        <Spinner />
      ) : !courts || courts.length === 0 ? (
        <EmptyState title="No courts yet" hint="Add your first court above." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courts.map((court) => (
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
                      Assign players
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => onSetStatus(court, "maintenance")}
                    >
                      Put on maintenance
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
                  <p className="text-xs text-slate-500">
                    Finish the game to free this court.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
