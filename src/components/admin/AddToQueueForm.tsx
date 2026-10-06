import { useState, type FormEvent } from "react";
import type { ApiError } from "../../services/http";
import type { MatchType, Player, PlayerDetail, SkillLevel } from "../../types";
import { Button } from "../Button";
import { MatchTypePicker } from "../MatchTypePicker";
import { PlayerSearchField } from "../PlayerSearchField";

interface Props {
  busy: boolean;
  onJoin: (data: {
    player_id?: number;
    name?: string;
    phone?: string;
    skill_level?: SkillLevel;
    match_type: MatchType;
  }) => Promise<void>;
}

export function AddToQueueForm({ busy, onJoin }: Props) {
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
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
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
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Phone (optional)
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                maxLength={30}
                className="mt-1 w-32 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Skill (optional)
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as SkillLevel | "")}
                className="mt-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
              >
                <option value="">—</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </>
        )}
      </div>

      {selected && (
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <span className="font-semibold">{selected.player.name}</span>'s
          record: {selected.detail.stats.wins}W-
          {selected.detail.stats.losses}L-{selected.detail.stats.draws}D ·{" "}
          {selected.detail.stats.total_points} pts ·{" "}
          {selected.detail.stats.games_played} games
          {blockedByActiveQueue && (
            <span className="ml-2 font-semibold text-red-600">
              ⚠ Already in queue ({selected.detail.current_status})
            </span>
          )}
          <button type="button" onClick={reset} className="ml-2 underline">
            Not them? Clear
          </button>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-600">
          Wants to play
        </label>
        <div className="mt-1">
          <MatchTypePicker value={matchType} onChange={setMatchType} />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          size="sm"
          disabled={busy || !name.trim() || blockedByActiveQueue}
        >
          Add to Queue
        </Button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
