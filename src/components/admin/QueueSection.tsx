import type { QueueEntry } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { StatusBadge } from "../StatusBadge";
import { Card } from "../Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../Table";

interface Props {
  entries: QueueEntry[] | null;
  loading: boolean;
  busy: boolean;
  canAssign: boolean;
  onAssign: () => void;
  onCancel: (entry: QueueEntry) => void;
}

export function QueueSection({
  entries,
  loading,
  busy,
  canAssign,
  onAssign,
  onCancel,
}: Props) {
  return (
    <Section
      title="Waiting Queue"
      action={
        <div className="flex items-center gap-2">
          {entries && (
            <Badge variant="info" className="text-label">
              {entries.length} waiting
            </Badge>
          )}
          <Button disabled={busy || !canAssign} onClick={onAssign}>
            Assign Players
          </Button>
        </div>
      }
    >
      {loading && !entries ? (
        <Spinner />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          title="Nobody is waiting"
          description="Players who join the queue will show up here."
        />
      ) : (
        <Card variant="bordered">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="w-48">Status</TableHead>
                <TableHead className="w-64">Details</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono font-semibold text-text-secondary">
                    {entry.position ?? index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-text-primary">
                        {entry.player?.name ?? "Unknown player"}
                      </span>
                      <span className="text-label text-text-tertiary">#{entry.queue_number}</span>
                      {entry.player?.skill_level && (
                        <Badge variant="info" size="sm">
                          {entry.player.skill_level}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status} />
                  </TableCell>
                  <TableCell className="text-body text-text-secondary">
                    <div>
                      {entry.match_type === "any"
                        ? "Either format"
                        : `${entry.match_type} requested`}
                      <span className="mx-1.5">·</span>
                      Joined {formatTime(entry.joined_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => onCancel(entry)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Section>
  );
}