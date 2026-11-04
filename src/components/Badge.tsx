import type { ReactNode } from "react";

type Variant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "sky"
  | "accent"
  | "team-a"
  | "team-b"
  | "pending"
  | "waiting"
  | "called"
  | "playing"
  | "completed"
  | "cancelled"
  | "available"
  | "maintenance";

type Size = "sm" | "md";

export interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  dot?: boolean;
  dotColor?: string;
}

const variantStyles: Record<Variant, string> = {
  /* Default — neutral */
  default: "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]",

  /* Primary — Court Green: primary brand, success states */
  primary: "bg-[var(--color-primary-100)] text-[var(--color-primary-800)] dark:bg-[var(--color-primary-900/30)] dark:text-[var(--color-primary-400)]",
  success: "bg-[var(--color-primary-100)] text-[var(--color-primary-800)] dark:bg-[var(--color-primary-900/30)] dark:text-[var(--color-primary-400)]",

  /* Warning — Ball Amber: attention, pending, warning */
  warning: "bg-[var(--color-amber-100)] text-[var(--color-amber-800)] dark:bg-[var(--color-amber-900/30)] dark:text-[var(--color-amber-400)]",
  accent: "bg-[var(--color-amber-100)] text-[var(--color-amber-800)] dark:bg-[var(--color-amber-900/30)] dark:text-[var(--color-amber-400)]",

  /* Sky Blue — info, secondary actions, Team A */
  info: "bg-[var(--color-sky-100)] text-[var(--color-sky-800)] dark:bg-[var(--color-sky-900/30)] dark:text-[var(--color-sky-400)]",
  sky: "bg-[var(--color-sky-100)] text-[var(--color-sky-800)] dark:bg-[var(--color-sky-900/30)] dark:text-[var(--color-sky-400)]",
  "team-a": "bg-[var(--color-team-a-bg)] text-[var(--color-team-a-text)] dark:bg-[var(--color-team-a-bg-dark)] dark:text-[var(--color-team-a-text-dark)]",

  /* Team B — Ball Amber */
  "team-b": "bg-[var(--color-team-b-bg)] text-[var(--color-team-b-text)] dark:bg-[var(--color-team-b-bg-dark)] dark:text-[var(--color-team-b-text-dark)]",

  /* Red — errors, destructive */
  danger: "bg-[var(--color-danger-100)] text-[var(--color-danger-800)] dark:bg-[var(--color-danger-900/30)] dark:text-[var(--color-danger-400)]",

  /* Status-specific aliases */
  pending: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-text)]",
  waiting: "bg-[var(--color-status-waiting-bg)] text-[var(--color-status-waiting-text)]",
  called: "bg-[var(--color-status-called-bg)] text-[var(--color-status-called-text)]",
  playing: "bg-[var(--color-status-playing-bg)] text-[var(--color-status-playing-text)]",
  completed: "bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed-text)]",
  cancelled: "bg-[var(--color-status-cancelled-bg)] text-[var(--color-status-cancelled-text)]",
  available: "bg-[var(--color-status-available-bg)] text-[var(--color-status-available-text)]",
  maintenance: "bg-[var(--color-status-maintenance-bg)] text-[var(--color-status-maintenance-text)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[0.6875rem] min-h-[24px]", /* 11px -> 12px for readability */
  md: "px-2.5 py-0.5 text-[0.75rem] min-h-[26px]", /* 12px -> 13px for readability */
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  dot,
  dotColor,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor || "currentColor" }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/* Convenience: status badge with proper label mapping */
const statusLabels: Record<string, string> = {
  pending: "Pending",
  waiting: "Waiting",
  called: "Called",
  playing: "In Play",
  completed: "Completed",
  cancelled: "Cancelled",
  available: "Available",
  maintenance: "Maintenance",
};

export function StatusBadge({
  status,
  size = "md",
  className = "",
}: { status: string; size?: Size; className?: string }) {
  const label = statusLabels[status] || status;
  return <Badge variant={status as Variant} size={size} className={className}>{label}</Badge>;
}

/* Convenience: court status badge with dot */
export function CourtStatusBadge({
  status,
  size = "md",
  className = "",
}: { status: "playing" | "available" | "maintenance"; size?: Size; className?: string }) {
  const config = {
    playing: { label: "Live", dotColor: "var(--color-primary-500)" },
    available: { label: "Open", dotColor: "var(--color-success-500)" },
    maintenance: { label: "Maint.", dotColor: "var(--color-warning-500)" },
  }[status];

  return (
    <Badge
      variant={status}
      size={size}
      className={className}
      dot
      dotColor={config.dotColor}
    >
      {config.label}
    </Badge>
  );
}