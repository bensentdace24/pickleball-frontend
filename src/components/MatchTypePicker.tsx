import type { MatchType } from "../types";

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
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            value === opt.value
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-300 text-slate-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
