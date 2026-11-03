import type { ReactNode, HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "sunken" | "bordered" | "mesh";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const variantStyles = {
  default: "bg-surface-card border border-border",
  elevated: "bg-surface-elevated shadow-lg border border-border",
  sunken: "bg-surface-sunken shadow-md border border-border",
  bordered: "bg-surface-card border-2 border-border-strong",
  /* Mesh gradient background for premium sporty feel */
  mesh: "bg-gradient-to-br from-surface-card via-surface-card-hover to-surface-elevated shadow-xl border border-border/50",
};

const paddingStyles = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

const hoverStyles = "transition-all duration-normal hover:shadow-lg hover:border-border-strong hover:-translate-y-0.5";

export function Card({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? hoverStyles : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ children, action, className = "", ...props }: CardHeaderProps) {
  return (
    <header className={`mb-4 flex flex-wrap items-center justify-between gap-3 ${className}`} {...props}>
      <div>{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export function CardTitle({ children, subtitle, className = "", ...props }: CardTitleProps) {
  return (
    <div {...props}>
      <h3 className={`text-lg font-semibold text-text-primary ${className}`}>{children}</h3>
      {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "", ...props }: CardContentProps) {
  return <div className={className} {...props}>{children}</div>;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "", ...props }: CardFooterProps) {
  return (
    <footer className={`mt-4 flex flex-wrap items-center justify-end gap-3 ${className}`} {...props}>
      {children}
    </footer>
  );
}