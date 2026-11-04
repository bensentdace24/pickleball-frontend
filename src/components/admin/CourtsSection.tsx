import { useState } from "react";
import type { Court } from "../../types";
import { MiniCourt } from "../MiniCourt";
import { Section } from "../Section";
import { Button } from "../Button";
import { Input, Field } from "../form/Input";
import { Skeleton } from "../Feedback";

interface CourtsSectionProps {
  courts: Court[] | null;
  loading: boolean;
  busy: boolean;
  canAssign: boolean;
  onAssign: (courtId: number) => void;
  onScoreChange: (gameId: number, side: 0 | 1, change: -1 | 1) => void;
  onAddCourt: (name: string) => Promise<boolean>;
}

export function CourtsSection({
  courts,
  loading,
  canAssign,
  onAssign,
  onScoreChange,
  busy,
  onAddCourt,
}: CourtsSectionProps) {
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");

  async function handleAddCourt() {
    if (!newCourtName.trim()) return;
    const ok = await onAddCourt(newCourtName.trim());
    if (ok) {
      setNewCourtName("");
      setShowAddCourt(false);
    }
  }

  return (
    <Section title="Courts" action={
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowAddCourt(true)}>
          Add Court
        </Button>
      </div>
    }>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mini-court-card p-4 animate-pulse">
              <Skeleton className="h-5 w-24 rounded mb-2" />
              <Skeleton className="h-4 w-32 rounded mb-4" />
              <Skeleton className="h-20 w-full rounded" />
              <Skeleton className="h-4 w-20 rounded mt-3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {showAddCourt && (
            <div className="mb-4 flex items-center gap-2">
              <Field className="flex-1">
                <Input
                  value={newCourtName}
                  onChange={(e) => setNewCourtName(e.target.value)}
                  placeholder="Court name (e.g., Court 5)"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAddCourt()}
                />
              </Field>
              <Button size="sm" onClick={handleAddCourt} disabled={busy || !newCourtName.trim()}>
                Create
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowAddCourt(false); setNewCourtName(""); }}>
                Cancel
              </Button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(courts ?? []).map((court) => (
              <MiniCourt
                key={court.id}
                court={court}
                mode="admin"
                onCourtClick={canAssign ? () => onAssign(court.id) : undefined}
                onScoreChange={onScoreChange}
                scoreBusy={busy}
              />
            ))}
          </div>
          {(courts ?? []).length === 0 && (
            <div className="col-span-full py-8 text-center">
              <p className="text-body text-text-secondary">No courts configured yet.</p>
              <p className="mt-1 text-label text-text-tertiary">Click "Add Court" to create your first court.</p>
            </div>
          )}
        </>
      )}
    </Section>
  );
}