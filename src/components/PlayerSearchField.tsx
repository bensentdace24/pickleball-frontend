import { useEffect, useRef, useState } from "react";
import { playersApi } from "../services/api";
import type { Player, PlayerDetail } from "../types";

interface Props {
  onPickExisting: (player: Player, detail: PlayerDetail) => void;
  onTypingNew: (name: string) => void;
  disabled?: boolean;
}

export function PlayerSearchField({
  onPickExisting,
  onTypingNew,
  disabled,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTypingNew(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const matches = await playersApi.list(query.trim());
        setResults(matches);
        setOpen(matches.length > 0);
      } catch {
        // silent — search is a convenience, not critical
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function pick(player: Player) {
    setChecking(player.id);
    try {
      const detail = await playersApi.get(player.id);
      onPickExisting(player, detail);
      setQuery(player.name);
      setOpen(false);
    } finally {
      setChecking(null);
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700">
        Full name
      </label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        maxLength={255}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        placeholder="Start typing a name…"
        autoComplete="off"
      />

      {open && (
        <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p)}
                disabled={checking === p.id}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <span>
                  {p.name}
                  {p.phone && (
                    <span className="ml-2 text-xs text-slate-400">
                      {p.phone}
                    </span>
                  )}
                </span>
                <span className="text-xs text-blue-600">
                  {checking === p.id ? "Checking…" : "Use this player"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
