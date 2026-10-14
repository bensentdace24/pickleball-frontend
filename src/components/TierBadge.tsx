const styles: Record<string, string> = {
  Rookie: "bg-slate-200 text-slate-700",
  Warrior: "bg-amber-100 text-amber-800",
  Elite: "bg-emerald-100 text-emerald-800",
  Master: "bg-blue-100 text-blue-800",
  Grandmaster: "bg-indigo-100 text-indigo-800",
  Epic: "bg-purple-100 text-purple-800",
  Legend: "bg-rose-100 text-rose-800",
  Mythic: "bg-yellow-200 text-yellow-900 ring-1 ring-yellow-400",
};

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[tier] ?? "bg-slate-200 text-slate-700"}`}
    >
      {tier}
    </span>
  );
}
