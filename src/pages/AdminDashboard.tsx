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
import { Link, useNavigate } from "react-router-dom";
import { FinishGameModal } from "../components/admin/FinishGameModal";
import { UpNextSection } from "../components/admin/UpNextSection";
import { FormMatchupModal } from "../components/admin/FormMatchupModal";
import { matchupsApi } from "../services/api";
import { PlayerQrCode } from "../components/admin/PlayerQrCode";
import type { Player } from "../types";
import type { Matchup } from "../types";
import { Button } from "../components/Button";
import { authApi } from "../services/api";
import { clearAuth, getUser } from "../services/auth";

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

  const [approveTarget, setApproveTarget] = useState<QueueEntry | null>(null);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [assign, setAssign] = useState<{ courtId: number | null } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<QueueEntry | null>(null);
  const [finishTarget, setFinishTarget] = useState<Game | null>(null);
  const [formMatchup, setFormMatchup] = useState(false);

  const [qrFor, setQrFor] = useState<Player | null>(null);
  const pending = useAsync(queueApi.pending, POLL_MS);

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

  async function confirmFinish(
    teamAScore: number,
    teamBScore: number,
    requeuePlayerIds: number[],
  ) {
    if (!finishTarget) return;
    const ok = await run(
      () =>
        gamesApi.finish(
          finishTarget.id,
          teamAScore,
          teamBScore,
          requeuePlayerIds,
        ),
      requeuePlayerIds.length > 0
        ? `Game #${finishTarget.id} finished. ${requeuePlayerIds.length} back in the queue.`
        : `Game #${finishTarget.id} finished.`,
    );
    if (ok) setFinishTarget(null);
  }

  async function handleAddToQueue(data: {
    player_id?: number;
    name?: string;
    phone?: string;
    skill_level?: import("../types").SkillLevel;
    match_type: import("../types").MatchType;
  }) {
    const entry = await queueApi.join(
      data as import("../types").JoinQueuePayload,
    );
    await refreshAll();
    if (entry.player) setQrFor(entry.player);
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

  async function handleApprove(entryId: number) {
    await run(
      () => queueApi.approve(entryId),
      "Approved — added to the queue.",
    );
  }
  function requestApprove(entry: QueueEntry) {
    if (entry.possible_matches && entry.possible_matches.length > 0) {
      setApproveTarget(entry);
    } else {
      handleApprove(entry.id);
    }
  }

  async function handleReject(entryId: number) {
    await run(() => queueApi.reject(entryId), "Registration rejected.");
  }

  async function handleSmartForm(matchSize: 2 | 4) {
    await run(
      () => matchupsApi.smartForm(matchSize),
      "Balanced matchup formed.",
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

  async function handleLink(entryId: number, playerId: number) {
    await run(
      () => queueApi.linkPlayer(entryId, playerId),
      "Linked to the existing player. You can approve now.",
    );
  }

  const refreshError = courts.error ?? queue.error ?? games.error;

  const refreshAll = () =>
    Promise.all([
      courts.refresh(),
      queue.refresh(),
      games.refresh(),
      upNext.refresh(),
      pending.refresh(),
    ]);

  const navigate = useNavigate();
  const staff = getUser();

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // the token may already be invalid, so just clear it locally
    }
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            Pickleball Queue · Admin
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to="/admin/rankings"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View Rankings
            </Link>
            <Link
              to="/admin/history"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              History
            </Link>
            <Link
              to="/admin/analytics"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Analytics
            </Link>
            <span className="text-xs text-slate-500">
              Auto-refreshes every 5s
            </span>
            {staff && (
              <span className="text-xs font-medium text-slate-600">
                {staff.name}
              </span>
            )}
            <Button size="sm" variant="secondary" onClick={logout}>
              Log out
            </Button>
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
        {pending.data && pending.data.length > 0 && (
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-semibold text-amber-900">
              Pending Approvals ({pending.data.length})
            </p>
            <ul className="space-y-2">
              {pending.data.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg bg-white px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {entry.player?.name}
                      {entry.player?.phone && (
                        <span className="ml-2 text-xs text-slate-400">
                          {entry.player.phone}
                        </span>
                      )}
                      <span className="ml-2 text-xs text-slate-400">
                        {entry.match_type === "any"
                          ? "Either"
                          : entry.match_type}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={busy}
                        onClick={() => requestApprove(entry)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => handleReject(entry.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>

                  {entry.possible_matches &&
                    entry.possible_matches.length > 0 && (
                      <div className="mt-2 rounded-md bg-blue-50 px-2 py-2">
                        <p className="text-xs font-semibold text-blue-900">
                          Already registered? Possible match:
                        </p>
                        <ul className="mt-1 space-y-1">
                          {entry.possible_matches.map((m) => (
                            <li
                              key={m.id}
                              className="flex flex-wrap items-center justify-between gap-2 text-xs text-blue-800"
                            >
                              <span>
                                {m.name}
                                {m.phone && (
                                  <span className="ml-1 text-blue-600">
                                    ({m.phone})
                                  </span>
                                )}{" "}
                                · {m.wins}W-{m.losses}L-{m.draws}D
                                {m.active_status && (
                                  <span className="ml-1 font-semibold text-red-600">
                                    · already {m.active_status}
                                  </span>
                                )}
                              </span>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busy || !!m.active_status}
                                onClick={() => handleLink(entry.id, m.id)}
                              >
                                Same person
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {qrFor && qrFor.qr_token && (
          <PlayerQrCode
            playerName={qrFor.name}
            qrToken={qrFor.qr_token}
            onClose={() => setQrFor(null)}
          />
        )}
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <QueueSection
            entries={queue.data}
            loading={queue.loading}
            busy={busy}
            canAssign={canAssign}
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

      {formMatchup && (
        <FormMatchupModal
          entries={eligible}
          busy={busy}
          error={notice?.type === "error" ? notice.text : null}
          onSubmit={handleFormMatchup}
          onClose={() => setFormMatchup(false)}
        />
      )}
      <ConfirmDialog
        open={!!approveTarget}
        busy={busy}
        title="This might be an existing player"
        message={
          approveTarget?.possible_matches?.[0]
            ? `${approveTarget.player?.name} looks like ${approveTarget.possible_matches[0].name} (${approveTarget.possible_matches[0].wins}W-${approveTarget.possible_matches[0].losses}L). Approving creates a separate new player and splits their record. Use "Same person" if it's them.`
            : ""
        }
        confirmLabel="Approve as new player"
        onConfirm={async () => {
          if (approveTarget) await handleApprove(approveTarget.id);
          setApproveTarget(null);
        }}
        onCancel={() => setApproveTarget(null)}
      />
    </div>
  );
}