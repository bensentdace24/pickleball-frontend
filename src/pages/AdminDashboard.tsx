import { useState } from "react";
import { ActiveGamesSection } from "../components/admin/ActiveGamesSection";
import { AssignModal } from "../components/admin/AssignModal";
import { CourtsSection } from "../components/admin/CourtsSection";
import { QueueSection } from "../components/admin/QueueSection";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Alert } from "../components/Feedback";
import { useAsync } from "../hooks/useAsync";
import { courtsApi, gamesApi, queueApi } from "../services/api";
import type { Court, Game, QueueEntry } from "../types";
import { AddToQueueForm } from "../components/admin/AddToQueueForm";
import { Link } from "react-router-dom";
import { FinishGameModal } from "../components/admin/FinishGameModal";
import { SmartAssignModal } from "../components/admin/SmartAssignModal";
import { UpNextSection } from "../components/admin/UpNextSection";
import { FormMatchupModal } from "../components/admin/FormMatchupModal";
import { matchupsApi } from "../services/api";
import type { Matchup } from "../types";

const POLL_MS = 5000;

interface Notice {
  type: "success" | "error";
  text: string;
}

export default function AdminDashboard() {
  const courts = useAsync(courtsApi.list, POLL_MS);
  const queue = useAsync(queueApi.list, POLL_MS);
  const games = useAsync(() => gamesApi.list("playing"), POLL_MS);
  const upNext = useAsync(matchupsApi.list, POLL_MS);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [assign, setAssign] = useState<{ courtId: number | null } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<QueueEntry | null>(null);
  const [finishTarget, setFinishTarget] = useState<Game | null>(null);
  const [formMatchup, setFormMatchup] = useState(false);

  const [smartAssign, setSmartAssign] = useState<{
    courtId: number | null;
  } | null>(null);
  const [smartResult, setSmartResult] = useState<
    import("../types").Game | null
  >(null);

  const availableCourts = (courts.data ?? []).filter(
    (c) => c.status === "available",
  );
  const eligible = queue.data ?? [];
  const canAssign = availableCourts.length > 0 && eligible.length >= 2;

  async function run(
    action: () => Promise<unknown>,
    success: string,
  ): Promise<boolean> {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      setNotice({ type: "success", text: success });
      await refreshAll();
      return true;
    } catch (e) {
      setNotice({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong.",
      });
      await refreshAll();
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function handleSmartAssign(
    courtId: number,
    matchSize: 2 | 4,
    durationMinutes?: number,
  ) {
    setBusy(true);
    setNotice(null);
    try {
      const game = await gamesApi.smartAssign({
        court_id: courtId,
        match_size: matchSize,
        duration_minutes: durationMinutes,
      });
      setSmartResult(game);
      await refreshAll();
    } catch (e) {
      setNotice({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  }

  function openAssign(courtId: number | null) {
    setNotice(null);
    setAssign({ courtId });
  }

  async function handleAssign(
    courtId: number,
    assignments: { queue_id: number; side: 0 | 1 }[],
    durationMinutes?: number,
  ) {
    const ok = await run(
      () =>
        gamesApi.assign({
          court_id: courtId,
          assignments,
          duration_minutes: durationMinutes,
        }),
      "Game started.",
    );
    if (ok) setAssign(null);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    await run(
      () => queueApi.cancel(cancelTarget.id),
      `Queue #${cancelTarget.queue_number} cancelled.`,
    );
    setCancelTarget(null);
  }

  async function confirmFinish(teamAScore: number, teamBScore: number) {
    if (!finishTarget) return;
    const ok = await run(
      () => gamesApi.finish(finishTarget.id, teamAScore, teamBScore),
      `Game #${finishTarget.id} finished.`,
    );
    if (ok) setFinishTarget(null);
  }
  async function handleAddToQueue(data: {
    name: string;
    phone?: string;
    skill_level?: import("../types").SkillLevel;
    match_type: import("../types").MatchType;
  }) {
    await queueApi.join(data);
    await refreshAll();
  }

  async function handleFormMatchup(
    assignments: { queue_id: number; side: 0 | 1 }[],
    durationMinutes?: number,
  ) {
    const ok = await run(
      () => matchupsApi.form(assignments, durationMinutes),
      "Matchup formed — up next.",
    );
    if (ok) setFormMatchup(false);
  }

  async function handleSmartForm() {
    await run(
      () => matchupsApi.smartForm(4),
      "Balanced matchup formed — up next.",
    );
  }

  async function handleStartMatchup(matchup: Matchup) {
    await run(() => matchupsApi.start(matchup.id), "Matchup started.");
  }

  async function handleCancelMatchup(matchup: Matchup) {
    await run(
      () => matchupsApi.cancel(matchup.id),
      "Matchup cancelled, players back in queue.",
    );
  }

  const refreshError = courts.error ?? queue.error ?? games.error;

  const refreshAll = () =>
    Promise.all([
      courts.refresh(),
      queue.refresh(),
      games.refresh(),
      upNext.refresh(),
    ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            Pickleball Queue · Admin
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/rankings"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View Rankings
            </Link>
            <span className="text-xs text-slate-500">
              Auto-refreshes every 5s
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
        {notice && !assign && (
          <Alert type={notice.type} onDismiss={() => setNotice(null)}>
            {notice.text}
          </Alert>
        )}
        {refreshError && (
          <Alert type="error">Couldn't refresh: {refreshError}</Alert>
        )}

        <CourtsSection
          courts={courts.data}
          loading={courts.loading}
          busy={busy}
          canAssign={canAssign}
          onAssign={openAssign}
          onSetStatus={(court: Court, status) =>
            run(
              () => courtsApi.setStatus(court.id, status),
              status === "maintenance"
                ? `${court.name} is on maintenance.`
                : `${court.name} is available.`,
            )
          }
          onAddCourt={(name) =>
            run(() => courtsApi.create(name), `${name} added.`)
          }
        />
        <UpNextSection
          matchups={upNext.data}
          loading={upNext.loading}
          busy={busy}
          canStart={availableCourts.length > 0}
          onFormMatchup={() => setFormMatchup(true)}
          onSmartForm={handleSmartForm}
          onStart={handleStartMatchup}
          onCancel={handleCancelMatchup}
        />

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Register &amp; Add to Queue
          </p>
          <AddToQueueForm busy={busy} onJoin={handleAddToQueue} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <QueueSection
            entries={queue.data}
            loading={queue.loading}
            busy={busy}
            canAssign={canAssign}
            onCallNext={() =>
              run(() => queueApi.callNext(4), "Next players called.")
            }
            onAssign={() => openAssign(null)}
            onCancel={setCancelTarget}
          />
          <ActiveGamesSection
            games={games.data}
            loading={games.loading}
            busy={busy}
            onFinish={setFinishTarget}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSmartResult(null);
              setSmartAssign({ courtId: availableCourts[0]?.id ?? null });
            }}
            disabled={busy || !canAssign}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            ⚡ Smart Assign (balanced teams)
          </button>
        </div>
      </main>

      {assign && (
        <AssignModal
          courts={availableCourts}
          entries={eligible}
          initialCourtId={assign.courtId}
          busy={busy}
          error={notice?.type === "error" ? notice.text : null}
          onSubmit={handleAssign}
          onClose={() => setAssign(null)}
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        danger
        busy={busy}
        title="Cancel this queue entry?"
        message={`${cancelTarget?.player?.name ?? "This player"} (#${cancelTarget?.queue_number}) will be removed from the queue.`}
        confirmLabel="Cancel queue entry"
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />

      {finishTarget && (
        <FinishGameModal
          game={finishTarget}
          busy={busy}
          error={notice?.type === "error" ? notice.text : null}
          onSubmit={confirmFinish}
          onClose={() => setFinishTarget(null)}
        />
      )}
      {smartAssign && (
        <SmartAssignModal
          courts={availableCourts}
          initialCourtId={smartAssign.courtId}
          busy={busy}
          error={notice?.type === "error" ? notice.text : null}
          result={smartResult}
          onSubmit={handleSmartAssign}
          onClose={() => {
            setSmartAssign(null);
            setSmartResult(null);
          }}
        />
      )}
      {formMatchup && (
        <FormMatchupModal
          entries={eligible}
          busy={busy}
          error={notice?.type === "error" ? notice.text : null}
          onSubmit={handleFormMatchup}
          onClose={() => setFormMatchup(false)}
        />
      )}
    </div>
  );
}
