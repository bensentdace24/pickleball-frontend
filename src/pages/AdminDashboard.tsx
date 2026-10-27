import { useState } from "react";
import { ActiveGamesSection } from "../components/admin/ActiveGamesSection";
import { AssignModal } from "../components/admin/AssignModal";
import { CourtsSection } from "../components/admin/CourtsSection";
import { QueueSection } from "../components/admin/QueueSection";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Alert } from "../components/Feedback";
import { useAsync } from "../hooks/useAsync";
import {
  analyticsApi,
  courtsApi,
  gamesApi,
  playersApi,
  queueApi,
} from "../services/api";
import type { Court, Game, QueueEntry } from "../types";
import { AddToQueueForm } from "../components/admin/AddToQueueForm";
import { useNavigate } from "react-router-dom";
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
import { AdminHeader } from "../components/admin/AdminHeader";
import { DashboardOverview } from "../components/admin/DashboardOverview";

const POLL_MS = 5000;

interface Notice {
  type: "success" | "error";
  text: string;
}

export default function AdminDashboard() {
  const courts = useAsync(courtsApi.list, POLL_MS);
  const queue = useAsync(queueApi.list, POLL_MS);
  const games = useAsync(() => gamesApi.list("playing"), POLL_MS);
  const players = useAsync(playersApi.list, POLL_MS);
  const analytics = useAsync(analyticsApi.get, POLL_MS);
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

  async function handleStartMatchup(matchup: Matchup, courtId?: number) {
    await run(() => matchupsApi.start(matchup.id, courtId), "Matchup started.");
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

  const refreshError =
    courts.error ??
    queue.error ??
    games.error ??
    players.error ??
    analytics.error;

  const refreshAll = () =>
    Promise.all([
      courts.refresh(),
      queue.refresh(),
      games.refresh(),
      players.refresh(),
      analytics.refresh(),
      upNext.refresh(),
      pending.refresh(),
    ]);

  const navigate = useNavigate();
  const staff = getUser();

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // token may already be invalid, so just clear it locally
    }
    clearAuth();
    navigate("/login", { replace: true });
  }

  const pendingCount = pending.data?.length ?? 0;

  return (
    <div className="min-h-screen bg-ink-950 text-cream-50">
      <AdminHeader
        active="dashboard"
        staffName={staff?.name}
        activeMatches={games.data?.length ?? 0}
        syncIntervalSeconds={5}
        onLogout={logout}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6">
        {notice && !assign && (
          <Alert type={notice.type} onDismiss={() => setNotice(null)}>
            {notice.text}
          </Alert>
        )}
        {refreshError && (
          <Alert type="error">Couldn't refresh: {refreshError}</Alert>
        )}

        {/* Stat strip — the first thing the eye lands on */}
        <DashboardOverview
          players={players.data?.length ?? null}
          waiting={
            queue.data?.filter(
              (e) => e.status === "waiting" || e.status === "called",
            ).length ?? null
          }
          activeGames={games.data?.length ?? null}
          availableCourts={availableCourts.length}
          maintenanceCourts={
            courts.data?.filter((c) => c.status === "maintenance").length ??
            null
          }
          completedGames={analytics.data?.total_games ?? null}
          loading={
            players.loading ||
            analytics.loading ||
            courts.loading ||
            queue.loading ||
            games.loading
          }
        />

        {/* Pending approvals — a single compact banner, not a big card */}
        {pendingCount > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-amber-200 px-1.5 text-xs font-extrabold text-amber-950">
                  {pendingCount}
                </span>
                <h2 className="text-sm font-extrabold text-amber-950">
                  Awaiting approval
                </h2>
              </div>
              <p className="text-xs text-amber-900">
                Check returning members before approving.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {pending.data!.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-cream-50">
                      {entry.player?.name}
                      {entry.player?.phone && (
                        <span className="ml-2 text-xs text-slate-500">
                          {entry.player.phone}
                        </span>
                      )}
                      <span className="ml-2 text-xs text-amber-900">
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
                      <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2">
                        <p className="text-[0.68rem] font-bold uppercase tracking-wider text-sky-800">
                          Possible match
                        </p>
                        <ul className="mt-1.5 space-y-1.5">
                          {entry.possible_matches.map((m) => (
                            <li
                              key={m.id}
                              className="flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900"
                            >
                              <span>
                                {m.name}
                                {m.phone && (
                                  <span className="ml-1 text-sky-700">
                                    ({m.phone})
                                  </span>
                                )}{" "}
                                <span className="text-slate-500">
                                  {m.wins}W-{m.losses}L-{m.draws}D
                                </span>
                                {m.active_status && (
                                    <span className="ml-1 font-semibold text-red-700">
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
          </section>
        )}

        {/* Courts — the hero of the page */}
        <CourtsSection
          courts={courts.data}
          loading={courts.loading}
          busy={busy}
          canAssign={canAssign}
          nextMatchup={upNext.data?.[0] ?? null}
          onAssign={openAssign}
          onStartUpNext={(matchup, courtId) =>
            handleStartMatchup(matchup, courtId)
          }
          onFinishGame={setFinishTarget}
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

        {qrFor && qrFor.qr_token && (
          <PlayerQrCode
            playerName={qrFor.name}
            qrToken={qrFor.qr_token}
            onClose={() => setQrFor(null)}
          />
        )}

        {/* Register — a compact single row instead of a big bordered section */}
        <section
          className="rounded-2xl border border-cyan-100 bg-white p-4 sm:p-5"
          aria-labelledby="register-player-heading"
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="register-player-heading"
              className="text-sm font-extrabold text-slate-900"
            >
              Register player
            </h2>
            <p className="text-xs text-slate-500">Walk-in or returning</p>
          </div>
          <AddToQueueForm busy={busy} onJoin={handleAddToQueue} />
        </section>

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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
