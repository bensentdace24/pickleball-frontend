import { useEffect, useRef, useState } from "react";
import { playersApi } from "../services/api";
import type { Player, PlayerDetail } from "../types";
import { Card } from "./Card";

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
      <label className="block text-sm font-medium text-text-secondary">
        Full name
      </label>
      <input
        value={query}
        onChange={(e) => {
          const nextQuery = e.target.value;
          setQuery(nextQuery);
          if (nextQuery.trim().length < 2) {
            setResults([]);
            setOpen(false);
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        maxLength={255}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-surface-sunken disabled:text-text-tertiary"
        placeholder="Start typing a name…"
        autoComplete="off"
      />

      {open && (
        <Card variant="elevated" className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto">
          <ul>
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => pick(p)}
                  disabled={checking === p.id}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-sunken disabled:opacity-50"
                >
                  <span>
                    {p.name}
                    {p.phone && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        {p.phone}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-primary-600 dark:text-primary-400">
                    {checking === p.id ? "Checking…" : "Use this player"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}