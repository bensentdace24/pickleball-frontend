import type { ReactNode, HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "sunken" | "bordered" | "court-available" | "court-playing" | "court-maintenance";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const variantStyles = {
  default: "bg-[var(--color-surface-card)] border border-[var(--color-border)]",
  elevated: "bg-[var(--color-surface-elevated)] shadow-lg border border-[var(--color-border)]",
  sunken: "bg-[var(--color-surface-sunken)] shadow-md border border-[var(--color-border)]",
  bordered: "bg-[var(--color-surface-card)] border-2 border-[var(--color-border-strong)]",
  /* Court-specific variants with semantic colors */
  "court-available": "bg-[var(--color-court-available-bg)] border border-[var(--color-court-available-border)]",
  "court-playing": "bg-[var(--color-court-playing-bg)] border border-[var(--color-court-playing-border)]",
  "court-maintenance": "bg-[var(--color-court-maintenance-bg)] border border-[var(--color-court-maintenance-border)]",
};

const paddingStyles = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

const hoverStyles = "transition-all duration-normal hover:shadow-lg hover:border-[var(--color-primary-300)] hover:-translate-y-0.5";

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
      <h3 className={`text-h3 text-[var(--color-text-primary)] ${className}`}>{children}</h3>
      {subtitle && <p className="mt-1 text-small text-[var(--color-text-secondary)]">{subtitle}</p>}
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