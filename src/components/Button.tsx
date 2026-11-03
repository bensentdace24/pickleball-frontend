import type { ButtonHTMLAttributes, ReactNode, ForwardRefExoticComponent, RefAttributes } from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning" | "accent" | "sky";
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
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-1.5",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
};

const variantStyles: Record<Variant, string> = {
  /* Court Green — primary actions, CTAs */
  primary: `
    bg-court-green-600 text-white
    hover:bg-court-green-700 active:bg-court-green-800
    shadow-sm
    focus-visible:ring-court-green-500
  `,
  /* Ball Yellow — high-energy actions, attention */
  accent: `
    bg-ball-yellow-600 text-white
    hover:bg-ball-yellow-700 active:bg-ball-yellow-800
    shadow-sm
    focus-visible:ring-ball-yellow-500
  `,
  /* Sky Blue — secondary actions, info */
  sky: `
    bg-sky-blue-600 text-white
    hover:bg-sky-blue-700 active:bg-sky-blue-800
    shadow-sm
    focus-visible:ring-sky-blue-500
  `,
  /* Subtle elevated surface */
  secondary: `
    bg-surface-elevated text-text-primary border border-border
    hover:bg-surface-sunken hover:border-border-strong
    active:bg-border
    focus-visible:ring-border-focus
  `,
  outline: `
    bg-transparent text-text-primary border border-border
    hover:bg-surface-sunken hover:border-border-strong
    active:bg-border
    focus-visible:ring-border-focus
  `,
  ghost: `
    bg-transparent text-text-primary
    hover:bg-surface-sunken
    active:bg-border
    focus-visible:ring-border-focus
  `,
  danger: `
    bg-danger-600 text-white
    hover:bg-danger-700 active:bg-danger-800
    shadow-sm
    focus-visible:ring-danger-500
  `,
  success: `
    bg-court-green-600 text-white
    hover:bg-court-green-700 active:bg-court-green-800
    shadow-sm
    focus-visible:ring-court-green-500
  `,
  warning: `
    bg-ball-yellow-600 text-white
    hover:bg-ball-yellow-700 active:bg-ball-yellow-800
    shadow-sm
    focus-visible:ring-ball-yellow-500
  `,
};

const baseStyles = `
  inline-flex items-center justify-center font-semibold
  transition-colors duration-fast
  disabled:cursor-not-allowed disabled:opacity-50
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
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

  return (
    <Comp
      ref={ref}
      type={props.type || "button"}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
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
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
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
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2
        ${iconButtonSizeStyles[size]}
        ${variant === "default" ? "bg-surface-elevated text-text-primary border border-border hover:bg-surface-sunken" : ""}
        ${variant === "outline" ? "bg-transparent text-text-primary border border-border hover:bg-surface-sunken" : ""}
        ${variant === "ghost" ? "bg-transparent text-text-secondary hover:bg-surface-sunken hover:text-text-primary" : ""}
        ${className}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}