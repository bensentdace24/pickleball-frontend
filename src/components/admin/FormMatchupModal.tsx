import { useState } from "react";
import type { QueueEntry } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { Alert } from "../Feedback";
import { StatusBadge } from "../StatusBadge";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../Dialog";
import { Card } from "../Card";
import { Badge } from "../Badge";
import { Flex } from "../layout/Page";

interface Props {
  entries: QueueEntry[];
  busy: boolean;
  error: string | null;
  onSubmit: (
    assignments: { queue_id: number; side: 0 | 1 }[],
  ) => void;
  onClose: () => void;
}

export function FormMatchupModal({
  entries,
  busy,
  error,
  onSubmit,
  onClose,
}: Props) {
  const [matchSize, setMatchSize] = useState<2 | 4>(4);
  const [sides, setSides] = useState<Record<number, 0 | 1>>({});

  const perSide = matchSize / 2;
  const validIds = Object.keys(sides)
    .map(Number)
    .filter((id) => entries.some((e) => e.id === id));
  const countA = validIds.filter((id) => sides[id] === 0).length;
  const countB = validIds.filter((id) => sides[id] === 1).length;
  const ready = countA === perSide && countB === perSide;

  function changeMatchSize(size: 2 | 4) {
    setMatchSize(size);
    setSides({});
  }

  function setSide(id: number, side: 0 | 1) {
    setSides((cur) => {
      const next = { ...cur };
      if (next[id] === side) {
        delete next[id];
        return next;
      }
      const countOnSide = Object.values(next).filter((s) => s === side).length;
      if (countOnSide >= perSide) return cur;
      next[id] = side;
      return next;
    });
  }

  function submit() {
    const assignments = validIds.map((id) => ({
      queue_id: id,
      side: sides[id],
    }));
    onSubmit(assignments);
  }

  return (
    <Dialog open onClose={onClose} title="Form an upcoming matchup" size="lg">
      <DialogHeader>
        <DialogTitle>Form an upcoming matchup</DialogTitle>
        <DialogDescription>No court needed yet — this just reserves the pairing.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary">Match type</p>
          <Flex gap={2} className="mt-1">
            <Button
              variant={matchSize === 4 ? "primary" : "outline"}
              size="sm"
              onClick={() => changeMatchSize(4)}
              className="flex-1"
            >
              Doubles (4)
            </Button>
            <Button
              variant={matchSize === 2 ? "primary" : "outline"}
              size="sm"
              onClick={() => changeMatchSize(2)}
              className="flex-1"
            >
              Singles (2)
            </Button>
          </Flex>
        </div>

        <p className="text-sm font-medium text-text-secondary">
          Team A ({countA}/{perSide}) vs Team B ({countB}/{perSide})
        </p>
        <Card variant="bordered" className="max-h-64 overflow-y-auto">
          <ul className="divide-y divide-border">
            {entries.map((entry) => {
              const side = sides[entry.id];
              return (
                <li key={entry.id} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                  <Badge variant="default" size="sm" className="shrink-0 font-semibold">
                    #{entry.queue_number}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-text-primary">
                    {entry.player?.name}
                  </span>
                  <span className="hidden text-text-tertiary sm:inline">
                    {formatTime(entry.joined_at)}
                  </span>
                  <StatusBadge status={entry.status} />
                  <Button
                    variant={side === 0 ? "primary" : "ghost"}
                    size="sm"
                    disabled={side !== 0 && countA >= perSide}
                    onClick={() => setSide(entry.id, 0)}
                  >
                    A
                  </Button>
                  <Button
                    variant={side === 1 ? "warning" : "ghost"}
                    size="sm"
                    disabled={side !== 1 && countB >= perSide}
                    onClick={() => setSide(entry.id, 1)}
                  >
                    B
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>

        {error && <Alert type="error">{error}</Alert>}

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Close
          </Button>
          <Button disabled={busy || !ready} onClick={submit}>
            {busy ? "Forming…" : "Form Matchup"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}