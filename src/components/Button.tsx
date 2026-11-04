import type { ButtonHTMLAttributes, ReactNode, ForwardRefExoticComponent, RefAttributes } from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning"
  | "sky"
  | "team-a"
  | "team-b";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  asChild?: boolean;
  children: ReactNode;
}

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[40px]",
  md: "px-4 py-2 text-sm rounded-xl gap-1.5 min-h-[44px]",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2 min-h-[48px]",
};

const variantStyles: Record<Variant, string> = {
  /* Primary — Court Green: PRIMARY ACTIONS ONLY (CTAs, start game, approve, save) */
  primary: `
    bg-[var(--color-interactive-bg)] text-[var(--color-interactive-text)]
    hover:bg-[var(--color-interactive-bg-hover)] active:bg-[var(--color-interactive-bg-active)]
    shadow-sm
    focus-visible:ring-[var(--color-border-focus)]
  `,
  /* Secondary — Sky Blue: SECONDARY ACTIONS (form matchup, smart form, cancel matchup) */
  secondary: `
    bg-[var(--color-interactive-sky-bg)] text-[var(--color-interactive-sky-text)]
    hover:bg-[var(--color-interactive-sky-bg-hover)] active:bg-[var(--color-interactive-sky-bg-active)]
    shadow-sm
    focus-visible:ring-[var(--color-sky-500)]
  `,
  /* Sky Blue alias for secondary */
  sky: `
    bg-[var(--color-interactive-sky-bg)] text-[var(--color-interactive-sky-text)]
    hover:bg-[var(--color-interactive-sky-bg-hover)] active:bg-[var(--color-interactive-sky-bg-active)]
    shadow-sm
    focus-visible:ring-[var(--color-sky-500)]
  `,
  /* Team A — Sky Blue: Team A assignment buttons */
  "team-a": `
    bg-[var(--color-team-a-bg)] text-[var(--color-team-a-text)] border border-[var(--color-team-a-border)]
    hover:bg-[var(--color-team-a-bg)] hover:border-[var(--color-team-a)] hover:text-[var(--color-team-a)]
    active:bg-[var(--color-team-a)] active:text-white
    focus-visible:ring-[var(--color-sky-500)]
  `,
  /* Team B — Ball Amber: Team B assignment buttons */
  "team-b": `
    bg-[var(--color-team-b-bg)] text-[var(--color-team-b-text)] border border-[var(--color-team-b-border)]
    hover:bg-[var(--color-team-b-bg)] hover:border-[var(--color-team-b)] hover:text-[var(--color-team-b)]
    active:bg-[var(--color-team-b)] active:text-[var(--color-text-on-amber)]
    focus-visible:ring-[var(--color-amber-500)]
  `,
  /* Subtle elevated surface — Ghost/outline style */
  outline: `
    bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)]
    hover:bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-strong)]
    active:bg-[var(--color-border)]
    focus-visible:ring-[var(--color-border-focus)]
  `,
  ghost: `
    bg-transparent text-[var(--color-text-primary)]
    hover:bg-[var(--color-surface-sunken)]
    active:bg-[var(--color-border)]
    focus-visible:ring-[var(--color-border-focus)]
  `,
  /* Danger — Red: DESTRUCTIVE ACTIONS ONLY (cancel, reject, remove, delete) */
  danger: `
    bg-[var(--color-interactive-danger-bg)] text-[var(--color-interactive-danger-text)]
    hover:bg-[var(--color-interactive-danger-bg-hover)] active:bg-[var(--color-interactive-danger-bg-active)]
    shadow-sm
    focus-visible:ring-[var(--color-danger-500)]
  `,
  /* Success — Court Green: Success confirmations (finish game, approve) */
  success: `
    bg-[var(--color-interactive-bg)] text-[var(--color-interactive-text)]
    hover:bg-[var(--color-interactive-bg-hover)] active:bg-[var(--color-interactive-bg-active)]
    shadow-sm
    focus-visible:ring-[var(--color-border-focus)]
  `,
  /* Warning — Ball Amber: Attention needed (not destructive) */
  warning: `
    bg-[var(--color-interactive-amber-bg)] text-[var(--color-interactive-amber-text)]
    hover:bg-[var(--color-interactive-amber-bg-hover)] active:bg-[var(--color-interactive-amber-bg-active)]
    shadow-sm
    focus-visible:ring-[var(--color-amber-500)]
  `,
};

const baseStyles = `
  inline-flex items-center justify-center font-semibold
  transition-colors duration-fast
  disabled:cursor-not-allowed disabled:opacity-50
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  font-family: var(--font-sans)
`;

const Button = ((
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    iconPosition = "left",
    fullWidth = false,
    asChild = false,
    className = "",
    disabled,
    children,
    ...props
  }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) => {
  const isDisabled = disabled || loading;
  const Comp = asChild ? Slot : "button";
  const buttonClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={buttonClassName}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <Comp
      ref={ref}
      type={props.type || "button"}
      disabled={isDisabled}
      className={buttonClassName}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {!loading && icon && iconPosition === "left" && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && <span aria-hidden="true">{icon}</span>}
    </Comp>
  );
}) as ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;

Button.displayName = "Button";

export { Button };

/* Icon button variant */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  "aria-label": string;
  children: ReactNode;
  className?: string;
}

const iconButtonSizeStyles = {
  sm: "h-9 w-9 min-w-[40px]",
  md: "h-10 w-10 min-w-[44px]",
  lg: "h-12 w-12 min-w-[48px]",
};

export function IconButton({
  size = "md",
  variant = "ghost",
  "aria-label": ariaLabel,
  children,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors duration-fast
        disabled:cursor-not-allowed disabled:opacity-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2
        ${iconButtonSizeStyles[size]}
        ${variant === "default" ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-sunken)]" : ""}
        ${variant === "outline" ? "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-sunken)]" : ""}
        ${variant === "ghost" ? "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]" : ""}
        ${className}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}
