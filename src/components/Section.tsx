import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({
  title,
  action,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      className={
        "rounded-2xl border border-ink-600 bg-ink-800 p-4 sm:p-5 " + className
      }
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-cream-200">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}
