import { useRef, useState, type FormEvent } from "react";
import type { ApiError } from "../../services/http";
import type { SkillLevel } from "../../types";
import { Button } from "../Button";
import { Alert } from "../Feedback";
import { MatchTypePicker } from "../MatchTypePicker";
import { Card } from "../Card";
import { Input, Select, Field } from "../form/Input";
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
  const submitLock = useRef(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;

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
    } finally {
      submitLock.current = false;
    }
  }

  return (
    <Card variant="elevated" className="max-w-md mx-auto p-6">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label="Full name"
          error={fieldErrors.name?.[0]}
          required
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            required
            placeholder="Juan Dela Cruz"
            error={!!fieldErrors.name?.[0]}
          />
        </Field>

        <Field label="Phone (optional)" error={fieldErrors.phone?.[0]}>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            placeholder="09171234567"
            error={!!fieldErrors.phone?.[0]}
          />
        </Field>

        <Field label="Skill level (optional)" error={fieldErrors.skill_level?.[0]}>
          <Select
            value={skill}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSkill(e.target.value as SkillLevel | "")}
            error={!!fieldErrors.skill_level?.[0]}
            options={[
              { value: "", label: "Not specified" },
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
          />
        </Field>

        {formError && <Alert type="error">{formError}</Alert>}

        <Field label="What do you want to play?">
          <div className="mt-1">
            <MatchTypePicker value={matchType} onChange={setMatchType} />
          </div>
        </Field>

        <Button type="submit" variant="primary" size="lg" disabled={busy || !name.trim()} className="w-full">
          {busy ? "Joining…" : "Join Queue"}
        </Button>
      </form>
    </Card>
  );
}