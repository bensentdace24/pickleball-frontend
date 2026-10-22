import type { ReactNode } from "react";

export function Alert({
  type,
  children,
  onDismiss,
}: {
  type: "success" | "error" | "info";
  children: ReactNode;
  onDismiss?: () => void;
}) {
  const styles = {
    success: "border-lime-400/35 bg-lime-400/[0.06] text-lime-300",
    error: "border-rose-400/35 bg-rose-400/[0.06] text-rose-300",
    info: "border-sky-400/35 bg-sky-400/[0.06] text-sky-300",
  }[type];

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${styles}`}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold opacity-70 hover:bg-ink-950/40 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-8" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-lemon-400" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-600 px-4 py-10 text-center">
      <p className="text-sm font-bold text-cream-100">{title}</p>
      {hint && <p className="mt-1 text-xs text-mist-400">{hint}</p>}
    </div>
  );
}
