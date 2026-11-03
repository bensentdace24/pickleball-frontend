import type { MatchType } from "../types";
import { Button } from "./Button";

interface Props {
  value: MatchType;
  onChange: (value: MatchType) => void;
}

const options: { value: MatchType; label: string }[] = [
  { value: "any", label: "No preference" },
  { value: "singles", label: "Singles (1v1)" },
  { value: "doubles", label: "Doubles" },
];

export function MatchTypePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant={value === opt.value ? "primary" : "outline"}
          size="sm"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}