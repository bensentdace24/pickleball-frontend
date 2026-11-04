import { useState } from "react";
import { ActiveGamesSection } from "../components/admin/ActiveGamesSection";
import { AssignModal } from "../components/admin/AssignModal";
import { CourtsSection } from "../components/admin/CourtsSection";
import { QueueSection } from "../components/admin/QueueSection";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Alert } from "../components/Feedback";
import { useAsync } from "../hooks/useAsync";
import {
  courtsApi,
  dashboardApi,
  gamesApi,
  queueApi,
} from "../services/api";
import type { Game, QueueEntry } from "../types";
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
import { Page, Container, Section, Flex, Badge } from "../components";

const POLL_MS = 30000; // 30 seconds for real-time admin dashboard

interface Notice {
  type: "success" | "error";
  text: string;
}

export default function AdminDashboard() {
  const dashboard = useAsync(dashboardApi.get, POLL_MS);
  const snapshot = dashboard.data;
  const courts = snapshot?.courts ?? null;
  const queue = snapshot?.queue ?? null;
  const games = snapshot?.games ?? null;
  const players = snapshot?.players ?? null;
  const matchups = snapshot?.matchups ?? null;
  const pending = snapshot?.pending ?? null;

  const [approveTarget, setApproveTarget] = useState<QueueEntry | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [assign, setAssign] = useState<{ courtId: number | null } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<QueueEntry | null>(null);
  const [finishTarget, setFinishTarget] = useState<Game | null>(null);
  const [formMatchup, setFormMatchup] = useState(false);
  const [qrFor, setQrFor] = useState<Player | null>(null);

  const availableCourts = (courts ?? []).filter(
    (c) => c.status === "available",
  );
  const eligible = queue ?? [];
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
      void refreshAll();
      return true;
    } catch (e) {
      setNotice({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong.",
      });
      void refreshAll();
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

  const refreshError = dashboard.error;

  const refreshAll = () => dashboard.refresh();

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

  const pendingCount = pending?.length ?? 0;

  return (
    <Page withBackground>
      <AdminHeader
        active="dashboard"
        staffName={staff?.name}
        activeMatches={games?.length ?? 0}
        syncIntervalSeconds={POLL_MS / 1000}
        onLogout={logout}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Container size="full">
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
            players={players?.length ?? null}
            waiting={
              queue?.filter(
                (e) => e.status === "waiting" || e.status === "called",
              ).length ?? null
            }
            activeGames={games?.length ?? null}
            availableCourts={availableCourts.length}
            maintenanceCourts={
              courts?.filter((c) => c.status === "maintenance").length ??
              null
            }
            completedGames={snapshot?.completed_games ?? null}
            loading={dashboard.loading}
          />

          {/* Pending approvals */}
          {pendingCount > 0 && (
            <Section
              title="Awaiting approval"
              subtitle="Check returning members before approving."
              className="border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20"
            >
              <ul className="grid gap-2 sm:grid-cols-2">
                {pending!.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-xl border border-warning-200 bg-surface-card p-3 sm:p-4 dark:border-warning-800 dark:bg-neutral-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-text-primary">
                        {entry.player?.name}
                        {entry.player?.phone && (
                          <span className="ml-2 text-label text-text-tertiary">
                            {entry.player.phone}
                          </span>
                        )}
                        <Badge variant="info" size="sm" className="ml-2">
                          {entry.match_type === "any" ? "Either" : entry.match_type}
                        </Badge>
                      </span>
                      <Flex gap={2}>
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
                      </Flex>
                    </div>

                    {entry.possible_matches &&
                      entry.possible_matches.length > 0 && (
                        <div className="mt-2 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-2 dark:border-primary-800 dark:bg-primary-900/20">
                          <p className="text-label font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                            Possible match
                          </p>
                          <ul className="mt-1.5 space-y-1.5">
                            {entry.possible_matches.map((m) => (
                              <li
                                key={m.id}
                                className="flex flex-wrap items-center justify-between gap-2 text-body text-primary-900 dark:text-primary-300"
                              >
                                <span>
                                  {m.name}
                                  {m.phone && (
                                    <span className="ml-1 text-primary-600 dark:text-primary-500">
                                      ({m.phone})
                                    </span>
                                  )}{" "}
                                  <span className="text-text-tertiary">
                                    {m.wins}W-{m.losses}L-{m.draws}D
                                  </span>
                                  {m.active_status && (
                                    <span className="ml-1 font-semibold text-danger dark:text-danger">
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
            </Section>
          )}

          {/* Courts — the hero of the page */}
          <CourtsSection
            courts={courts}
            loading={dashboard.loading}
            busy={busy}
            canAssign={canAssign}
            onAssign={openAssign}
            onScoreChange={(gameId, side, change) =>
              run(
                () => gamesApi.updateScore(gameId, side, change),
                "Score updated.",
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

          {/* Register player */}
          <Section
            title="Register player"
            subtitle="Walk-in or returning"
            className="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20"
          >
            <AddToQueueForm busy={busy} onJoin={handleAddToQueue} />
          </Section>

          <UpNextSection
            matchups={matchups}
            loading={dashboard.loading}
            busy={busy}
            canStart={availableCourts.length > 0}
            onFormMatchup={() => setFormMatchup(true)}
            onSmartForm={handleSmartForm}
            onStart={handleStartMatchup}
            onCancel={handleCancelMatchup}
          />

          <Section className="grid gap-5 lg:grid-cols-2">
            <QueueSection
              entries={queue}
              loading={dashboard.loading}
              busy={busy}
              canAssign={canAssign}
              onAssign={() => openAssign(null)}
              onCancel={setCancelTarget}
            />
            <ActiveGamesSection
              games={games}
              loading={dashboard.loading}
              busy={busy}
              onFinish={setFinishTarget}
            />
          </Section>
        </Container>
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
    </Page>
  );
}
