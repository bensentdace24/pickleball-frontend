import type { ReactNode, HTMLAttributes } from "react";

interface PageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  /** Apply the sporty background mesh/grid/noise system */
  withBackground?: boolean;
}

export function Page({ children, className = "", withBackground = true, ...props }: PageProps) {
  return (
    <div className={`min-h-screen ${withBackground ? "bg-mesh" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = "",
  ...props
}: PageHeaderProps) {
  return (
    <header className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`} {...props}>
      <div className="flex flex-col gap-1">
        {breadcrumbs && <nav className="text-sm text-text-secondary" aria-label="Breadcrumb">{breadcrumbs}</nav>}
        <h1 className="text-2xl font-bold text-text-primary tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-base text-text-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Use elevated surface with subtle mesh gradient */
  elevated?: boolean;
}

export function Section({ children, title, subtitle, action, className = "", elevated = false, ...props }: SectionProps) {
  return (
    <section className={`rounded-xl border border-border ${elevated ? "bg-surface-elevated" : "bg-surface"} p-4 sm:p-5 ${className}`} {...props}>
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-text-tertiary">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeStyles = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
  full: "max-w-full",
};

export function Container({ children, size = "lg", className = "", ...props }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: number;
  className?: string;
}

export function Grid({ children, cols = 1, gap = 4, className = "", ...props }: GridProps) {
  return (
    <div
      className={`
        grid gap-${gap}
        sm:grid-cols-${Math.min(cols, 2)}
        lg:grid-cols-${cols}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  gap?: number;
  wrap?: boolean;
  className?: string;
}

const alignStyles = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyStyles = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export function Flex({
  children,
  direction = "row",
  align = "stretch",
  justify = "start",
  gap = 3,
  wrap = false,
  className = "",
  ...props
}: FlexProps) {
  return (
    <div
      className={`
        flex ${direction === "col" ? "flex-col" : ""}
        ${alignStyles[align]}
        ${justifyStyles[justify]}
        gap-${gap}
        ${wrap ? "flex-wrap" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: number;
  className?: string;
}

export function Stack({ children, gap = 4, className = "", ...props }: StackProps) {
  return (
    <div className={`flex flex-col gap-${gap} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface InlineProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: number;
  className?: string;
}

export function Inline({ children, gap = 2, className = "", ...props }: InlineProps) {
  return (
    <div className={`inline-flex flex-wrap items-center gap-${gap} ${className}`} {...props}>
      {children}
    </div>
  );
}