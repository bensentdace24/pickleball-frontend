import { useState, type FormEvent } from "react";
import type { ApiError } from "../../services/http";
import type { SkillLevel } from "../../types";
import { Button } from "../Button";
import { Alert } from "../Feedback";
import { MatchTypePicker } from "../MatchTypePicker";
import type { MatchType } from "../../types";

interface Props {
  busy: boolean;
  onJoin: (data: {
    name: string;
    phone?: string;
    skill_level?: SkillLevel;
    match_type: MatchType;
  }) => Promise<void>;
}

export function JoinForm({ busy, onJoin }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState<SkillLevel | "">("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<MatchType>("any");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    try {
      await onJoin({
        name: name.trim(),
        phone: phone.trim() || undefined,
        skill_level: skill || undefined,
        match_type: matchType,
      });
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors) setFieldErrors(apiErr.errors);
      else setFormError(apiErr.message ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Juan Dela Cruz"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Phone (optional)
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={30}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="09171234567"
        />
        {fieldErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.phone[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Skill level (optional)
        </label>
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value as SkillLevel | "")}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Not specified</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {fieldErrors.skill_level && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.skill_level[0]}
          </p>
        )}
      </div>

      {formError && <Alert type="error">{formError}</Alert>}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          What do you want to play?
        </label>
        <div className="mt-1">
          <MatchTypePicker value={matchType} onChange={setMatchType} />
        </div>
      </div>

      <Button type="submit" disabled={busy || !name.trim()} className="w-full">
        {busy ? "Joining…" : "Join Queue"}
      </Button>
    </form>
  );
}
