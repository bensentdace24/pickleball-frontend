import { useState } from "react";
import type { Court, Game } from "../../types";
import { Button } from "../Button";
import { Alert } from "../Feedback";

interface Props {
  courts: Court[];
  initialCourtId: number | null;
  busy: boolean;
  error: string | null;
  result: Game | null;
  onSubmit: (
    courtId: number,
    matchSize: 2 | 4,
    durationMinutes?: number,
  ) => void;
  onClose: () => void;
}

export function SmartAssignModal({
  courts,
  initialCourtId,
  busy,
  error,
  result,
  onSubmit,
  onClose,
}: Props) {
  const [courtId, setCourtId] = useState<number | "">(
    initialCourtId ?? courts[0]?.id ?? "",
  );
  const [matchSize, setMatchSize] = useState<2 | 4>(4);
  const [duration, setDuration] = useState<number | "">("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Smart Assign (balanced by skill)
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Picks the longest-waiting eligible players and splits them into
          balanced teams automatically.
        </p>

        {!result && (
          <>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">Match type</p>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMatchSize(4)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    matchSize === 4
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  Doubles (4)
                </button>
                <button
                  type="button"
                  onClick={() => setMatchSize(2)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    matchSize === 2
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  Singles (2)
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">Time limit</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {[
                  { label: "No limit", value: "" as const },
                  { label: "30 min", value: 30 },
                  { label: "1 hr", value: 60 },
                  { label: "1.5 hr", value: 90 },
                  { label: "2 hr", value: 120 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                      duration === opt.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 text-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Court
              <select
                value={courtId}
                onChange={(e) => setCourtId(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {result && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="font-semibold text-blue-900">Team A</p>
              <p className="text-blue-800">
                {result.team_a?.players?.map((p) => p.name).join(", ")}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="font-semibold text-amber-900">Team B</p>
              <p className="text-amber-800">
                {result.team_b?.players?.map((p) => p.name).join(", ")}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {result ? "Done" : "Cancel"}
          </Button>
          {!result && (
            <Button
              disabled={busy || courtId === ""}
              onClick={() =>
                onSubmit(Number(courtId), matchSize, duration || undefined)
              }
            >
              {busy ? "Assigning…" : "Smart Assign"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
