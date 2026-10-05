import { useState } from "react";
import type { Court, Matchup } from "../../types";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";

interface Props {
  matchups: Matchup[] | null;
  loading: boolean;
  busy: boolean;
  availableCourts: Court[];
  onFormMatchup: () => void;
  onSmartForm: () => void;
  onStart: (matchup: Matchup, courtId: number) => void;
  onCancel: (matchup: Matchup) => void;
}

export function UpNextSection({
  matchups,
  loading,
  busy,
  availableCourts,
  onFormMatchup,
  onSmartForm,
  onStart,
  onCancel,
}: Props) {
  const [startingId, setStartingId] = useState<number | null>(null);
  const [courtChoice, setCourtChoice] = useState<number | "">("");

  const actions = (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={busy || (matchups?.length ?? 0) >= 3}
        onClick={onFormMatchup}
      >
        Form Matchup
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={busy || (matchups?.length ?? 0) >= 3}
        onClick={onSmartForm}
      >
        ⚡ Smart Form
      </Button>
    </div>
  );

  return (
    <Section title="Up Next (max 3)" action={actions}>
      {loading && !matchups ? (
        <Spinner />
      ) : !matchups || matchups.length === 0 ? (
        <EmptyState
          title="No matchups formed yet"
          hint="Form a matchup so it's ready the moment a court frees up."
        />
      ) : (
        <ul className="space-y-3">
          {matchups.map((m, i) => (
            <li key={m.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {i === 0 ? "Up Next" : `Up Next #${i + 1}`}
                </span>
                <span className="text-xs text-slate-400">
                  {m.match_size === 4 ? "Doubles" : "Singles"}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-blue-50 px-2 py-1.5">
                  <p className="font-semibold text-blue-900">Team A</p>
                  <p className="text-blue-800">
                    {m.team_a.map((p) => p.name).join(", ")}
                  </p>
                </div>
                <div className="rounded-md bg-amber-50 px-2 py-1.5">
                  <p className="font-semibold text-amber-900">Team B</p>
                  <p className="text-amber-800">
                    {m.team_b.map((p) => p.name).join(", ")}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {startingId === m.id ? (
                  <>
                    <select
                      value={courtChoice}
                      onChange={(e) => setCourtChoice(Number(e.target.value))}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    >
                      <option value="">Pick a court…</option>
                      {availableCourts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={busy || courtChoice === ""}
                      onClick={() => {
                        onStart(m, Number(courtChoice));
                        setStartingId(null);
                        setCourtChoice("");
                      }}
                    >
                      Confirm Start
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => setStartingId(null)}
                    >
                      Back
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      disabled={busy || availableCourts.length === 0}
                      onClick={() => setStartingId(m.id)}
                    >
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => onCancel(m)}
                    >
                      Cancel Matchup
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
