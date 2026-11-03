import type { ReactNode } from "react";

type Variant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"
  | "sky"
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
  default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  /* Court Green — primary brand, success states */
  primary: "bg-court-green-100 text-court-green-800 dark:bg-court-green-900/30 dark:text-court-green-400",
  success: "bg-court-green-100 text-court-green-800 dark:bg-court-green-900/30 dark:text-court-green-400",
  /* Ball Yellow — attention, pending, warning */
  warning: "bg-ball-yellow-100 text-ball-yellow-800 dark:bg-ball-yellow-900/30 dark:text-ball-yellow-400",
  accent: "bg-ball-yellow-100 text-ball-yellow-800 dark:bg-ball-yellow-900/30 dark:text-ball-yellow-400",
  /* Sky Blue — info, secondary actions */
  info: "bg-sky-blue-100 text-sky-blue-800 dark:bg-sky-blue-900/30 dark:text-sky-blue-400",
  sky: "bg-sky-blue-100 text-sky-blue-800 dark:bg-sky-blue-900/30 dark:text-sky-blue-400",
  /* Red — errors, destructive */
  danger: "bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400",

  /* Status-specific aliases */
  pending: "bg-ball-yellow-100 text-ball-yellow-800 dark:bg-ball-yellow-900/30 dark:text-ball-yellow-400",
  waiting: "bg-ball-yellow-100 text-ball-yellow-800 dark:bg-ball-yellow-900/30 dark:text-ball-yellow-400",
  called: "bg-court-green-100 text-court-green-800 dark:bg-court-green-900/30 dark:text-court-green-400",
  playing: "bg-court-green-100 text-court-green-800 dark:bg-court-green-900/30 dark:text-court-green-400",
  completed: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  cancelled: "bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400",
  available: "bg-court-green-100 text-court-green-800 dark:bg-court-green-900/30 dark:text-court-green-400",
  maintenance: "bg-ball-yellow-100 text-ball-yellow-800 dark:bg-ball-yellow-900/30 dark:text-ball-yellow-400",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[0.65rem]",
  md: "px-2.5 py-0.5 text-xs",
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