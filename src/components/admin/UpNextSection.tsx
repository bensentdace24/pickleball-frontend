import type { Matchup } from "../../types";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { formatWait } from "../../lib/format";

interface Props {
  matchups: Matchup[] | null;
  loading: boolean;
  busy: boolean;
  canStart: boolean;
  onFormMatchup: () => void;
  onSmartForm: (matchSize: 2 | 4) => void;
  onStart: (matchup: Matchup) => void;
  onCancel: (matchup: Matchup) => void;
}

export function UpNextSection({
  matchups,
  loading,
  busy,
  canStart,
  onFormMatchup,
  onSmartForm,
  onStart,
  onCancel,
}: Props) {
  const actions = (
    <div className="flex flex-wrap gap-2">
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
        onClick={() => onSmartForm(4)}
      >
        ⚡ Smart Form (Doubles)
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={busy || (matchups?.length ?? 0) >= 3}
        onClick={() => onSmartForm(2)}
      >
        ⚡ Smart Form (Singles)
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

              {m.skill_warning && (
                <p className="mt-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                  ⚠️ {m.skill_warning}
                </p>
              )}

              {formatWait(m.estimated_minutes) && (
                <p className="mt-1 text-xs text-slate-500">
                  Est. start: {formatWait(m.estimated_minutes)}
                </p>
              )}

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
                {i === 0 ? (
                  <Button
                    size="sm"
                    disabled={busy || !canStart}
                    onClick={() => onStart(m)}
                  >
                    {canStart ? "Start Next" : "No court free yet"}
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">
                    Waiting behind Up Next
                  </span>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busy}
                  onClick={() => onCancel(m)}
                >
                  Cancel Matchup
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
