import { useEffect, useState } from "react";
import { QueueStatusCard } from "../components/player/QueueStatusCard";
import { JoinForm } from "../components/player/JoinForm";
import { Alert, Spinner } from "../components/Feedback";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useAsync } from "../hooks/useAsync";
import { queueApi } from "../services/api";
import type { SkillLevel, MatchType } from "../types";

const STORAGE_KEY = "pickleball_queue_id";
const POLL_MS = 4000;

export default function PlayerView() {
  const [queueId, setQueueId] = useState<number | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const status = useAsync(
    () => (queueId ? queueApi.get(queueId) : Promise.resolve(null)),
    queueId ? POLL_MS : undefined,
  );

  useEffect(() => {
    status.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId]);

  function forget() {
    localStorage.removeItem(STORAGE_KEY);
    setQueueId(null);
  }

  async function handleJoin(data: {
    name: string;
    phone?: string;
    skill_level?: SkillLevel;
    match_type: MatchType;
  }) {
    const entry = await queueApi.selfRegister(data);
    localStorage.setItem(STORAGE_KEY, String(entry.id));
    setQueueId(entry.id);
  }

  async function handleCancel() {
    if (!queueId) return;
    setBusy(true);
    setError(null);
    try {
      await queueApi.cancel(queueId);
      await status.refresh();
      setConfirmCancel(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <h1 className="mb-8 text-center text-2xl font-bold text-slate-900">
        Pickleball Queue
      </h1>

      {error && (
        <div className="mx-auto mb-4 max-w-md">
          <Alert type="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {!queueId && (
        <>
          <p className="mx-auto mb-6 max-w-md text-center text-sm text-slate-600">
            Enter your details to join the queue.
          </p>
          <JoinForm busy={busy} onJoin={handleJoin} />
        </>
      )}

      {queueId && status.loading && !status.data && (
        <Spinner label="Loading your spot…" />
      )}

      {queueId && status.data && (
        <QueueStatusCard
          entry={status.data}
          busy={busy}
          onCancel={() => setConfirmCancel(true)}
          onLeave={forget}
        />
      )}

      {queueId && status.error && !status.data && (
        <div className="mx-auto max-w-md">
          <Alert type="error">{status.error}</Alert>
          <button
            onClick={forget}
            className="mt-3 text-sm text-blue-600 underline"
          >
            Start over
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel}
        danger
        busy={busy}
        title="Cancel your spot?"
        message="You'll be removed from the queue and will need to join again."
        confirmLabel="Cancel my spot"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
