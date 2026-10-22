import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "success" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-xl",
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-lemon-400 text-ink-950 font-extrabold hover:bg-lemon-300 active:bg-lemon-500 " +
    "shadow-[0_0_0_1px_rgba(250,204,21,.35),0_6px_18px_-8px_rgba(250,204,21,.6)] " +
    "disabled:hover:bg-lemon-400 disabled:shadow-none",
  success:
    "bg-lime-400/15 text-lime-400 font-bold border border-lime-400/35 " +
    "hover:bg-lime-400/25 hover:border-lime-400/60 active:bg-lime-400/30 " +
    "disabled:hover:bg-lime-400/15",
  secondary:
    "bg-ink-700 text-cream-100 font-bold border border-ink-600 " +
    "hover:bg-ink-600 hover:border-ink-500 active:bg-ink-700 " +
    "disabled:hover:bg-ink-700",
  danger:
    "bg-rose-400/15 text-rose-400 font-bold border border-rose-400/35 " +
    "hover:bg-rose-400/25 hover:border-rose-400/60 active:bg-rose-400/30 " +
    "disabled:hover:bg-rose-400/15",
  ghost:
    "bg-transparent text-cream-200 font-bold hover:bg-ink-700 " +
    "hover:text-cream-50 active:bg-ink-800",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={
        "inline-flex items-center justify-center gap-1.5 font-semibold " +
        "transition-colors focus-visible:outline-2 focus-visible:outline-lemon-400 " +
        "focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45 " +
        sizeClass[size] +
        " " +
        variantClass[variant] +
        (className ? " " + className : "")
      }
      {...rest}
    >
      {children}
    </button>
  );
}
