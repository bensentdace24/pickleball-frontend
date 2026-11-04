import { useRef, useState, type FormEvent } from "react";
import type { ApiError } from "../../services/http";
import type { MatchType, Player, PlayerDetail, SkillLevel } from "../../types";
import { Button } from "../Button";
import { MatchTypePicker } from "../MatchTypePicker";
import { PlayerSearchField } from "../PlayerSearchField";
import { PlayerQrCode } from "./PlayerQrCode";
import { Alert } from "../Feedback";
import { Input, Select, Field } from "../form/Input";

interface Props {
  busy: boolean;
  onJoin: (data: {
    player_id?: number;
    name?: string;
    phone?: string;
    skill_level?: SkillLevel;
    match_type: MatchType;
  }) => Promise<{ qr_token?: string; name: string } | void>;
}

export function AddToQueueForm({ busy, onJoin }: Props) {
  const submitLock = useRef(false);
  const [showQr, setShowQr] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState<SkillLevel | "">("");
  const [matchType, setMatchType] = useState<MatchType>("any");
  const [selected, setSelected] = useState<{
    player: Player;
    detail: PlayerDetail;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setPhone("");
    setSkill("");
    setMatchType("any");
    setSelected(null);
    setShowQr(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;

    setError(null);
    try {
      if (selected) {
        await onJoin({ player_id: selected.player.id, match_type: matchType });
      } else {
        await onJoin({
          name: name.trim(),
          phone: phone.trim() || undefined,
          skill_level: skill || undefined,
          match_type: matchType,
        });
      }
      reset();
    } catch (err) {
      setError((err as ApiError).message ?? "Something went wrong.");
    } finally {
      submitLock.current = false;
    }
  }

  const blockedByActiveQueue = selected?.detail.currently_in_queue;

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-48">
          <PlayerSearchField
            disabled={busy}
            onTypingNew={(q) => {
              if (selected && q !== selected.player.name) setSelected(null);
              setName(q);
            }}
            onPickExisting={(player, detail) => setSelected({ player, detail })}
          />
        </div>

        {!selected && (
          <>
            <Field label="Phone (optional)" className="w-32">
              <Input
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                maxLength={30}
              />
            </Field>
            <Field label="Skill (optional)">
              <Select
                value={skill}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSkill(e.target.value as SkillLevel | "")}
                options={[
                  { value: "", label: "—" },
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                ]}
              />
            </Field>
          </>
        )}
      </div>

      {selected && (
        <div className="rounded-lg bg-primary-50 px-3 py-2 text-label text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
          <span className="font-semibold">{selected.player.name}</span>'s
          record: {selected.detail.stats.wins}W-
          {selected.detail.stats.losses}L-{selected.detail.stats.draws}D ·{" "}
          {selected.detail.stats.total_points} pts ·{" "}
          {selected.detail.stats.games_played} games
          {blockedByActiveQueue && (
            <span className="ml-2 font-semibold text-danger dark:text-danger">
              ⚠ Already in queue ({selected.detail.current_status})
            </span>
          )}
          <button type="button" onClick={reset} className="ml-2 underline">
            Not them? Clear
          </button>
          {selected.player.qr_token && (
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="ml-2 font-semibold underline"
            >
              Show QR
            </button>
          )}
        </div>
      )}

      <Field label="Wants to play">
        <div className="mt-1">
          <MatchTypePicker value={matchType} onChange={setMatchType} />
        </div>
      </Field>

      <div>
        <Button type="submit" size="sm" disabled={busy || !name.trim() || blockedByActiveQueue}>
          Add to Queue
        </Button>
        {error && <Alert type="error" className="mt-2">{error}</Alert>}
      </div>

      {showQr && selected?.player.qr_token && (
        <PlayerQrCode
          playerName={selected.player.name}
          qrToken={selected.player.qr_token}
          onClose={() => setShowQr(false)}
        />
      )}
    </form>
  );
}