import type { Matchup } from "../../types";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { Card } from "../Card";
import { Badge } from "../Badge";
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
        Smart Form (Doubles)
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={busy || (matchups?.length ?? 0) >= 3}
        onClick={() => onSmartForm(2)}
      >
        Smart Form (Singles)
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
          description="Form a matchup so it's ready the moment a court frees up."
        />
      ) : (
        <div className="space-y-3">
          {matchups.map((m, i) => (
            <Card key={m.id} variant="bordered" className="p-4">
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm">
                  {i === 0 ? "Up Next" : `Up Next #${i + 1}`}
                </Badge>
                <Badge variant="default" size="sm">
                  {m.match_size === 4 ? "Doubles" : "Singles"}
                </Badge>
              </div>

              {m.skill_warning && (
                <div className="mt-2 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-label font-medium text-warning dark:bg-warning-900/30 dark:border-warning-800 dark:text-warning">
                  ⚠ {m.skill_warning}
                </div>
              )}

              {formatWait(m.estimated_minutes) && (
                <p className="mt-1 text-body text-text-secondary">
                  Est. start: {formatWait(m.estimated_minutes)}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Card variant="sunken" className="p-3 border-team-a">
                  <p className="text-label text-team-a">Team A</p>
                  <p className="mt-1 font-medium text-text-primary">{m.team_a.map((p) => p.name).join(", ")}</p>
                </Card>
                <Card variant="sunken" className="p-3 border-team-b">
                  <p className="text-label text-team-b">Team B</p>
                  <p className="mt-1 font-medium text-text-primary">{m.team_b.map((p) => p.name).join(", ")}</p>
                </Card>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {i === 0 ? (
                  <Button
                    size="sm"
                    disabled={busy || !canStart}
                    onClick={() => onStart(m)}
                  >
                    {canStart ? "Start Next" : "No court free yet"}
                  </Button>
                ) : (
                  <span className="text-label text-text-tertiary">
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
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}