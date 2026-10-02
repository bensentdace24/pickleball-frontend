import { useState, type FormEvent } from "react";
import type { ApiError } from "../../services/http";
import type { SkillLevel } from "../../types";
import { Button } from "../Button";

interface Props {
  busy: boolean;
  onJoin: (data: {
    name: string;
    phone?: string;
    skill_level?: SkillLevel;
  }) => Promise<void>;
}

export function AddToQueueForm({ busy, onJoin }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState<SkillLevel | "">("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onJoin({
        name: name.trim(),
        phone: phone.trim() || undefined,
        skill_level: skill || undefined,
      });
      setName("");
      setPhone("");
      setSkill("");
    } catch (err) {
      setError((err as ApiError).message ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-xs font-medium text-slate-600">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          maxLength={255}
          className="mt-1 w-40 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm sm:w-48"
        />
      </div>
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
      <Button type="submit" size="sm" disabled={busy || !name.trim()}>
        Add to Queue
      </Button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
