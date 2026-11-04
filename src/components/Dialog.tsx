import type { ReactNode, HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw]",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className = "",
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: DialogProps) {
  if (!open) return null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && closeOnEscape) {
      onClose();
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  }

  const dialogContent = (
    <div
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
      aria-describedby={description ? "dialog-description" : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* Sporty backdrop with mesh */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity
          [background-image:_radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-bg-mesh-primary)_0%,transparent_50%),
          radial-gradient(ellipse_60%_40%_at_80%_100%,var(--color-bg-mesh-accent)_0%,transparent_50%),
          radial-gradient(ellipse_50%_30%_at_10%_60%,var(--color-bg-mesh-sky)_0%,transparent_50%)]"
        aria-hidden="true"
        onClick={handleOverlayClick}
      />
      <div
        className={`
          relative z-[var(--z-modal)] w-full ${sizeStyles[size]}
          rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xl
          max-h-[90vh] overflow-hidden flex flex-col
          animate-modal-in
          ${className}
        `}
        {...{ "data-dialog-content": "" }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] p-4 sm:p-5 bg-[var(--color-surface-elevated)/50]">
          <div>
            <h2 id="dialog-title" className="text-h3 text-[var(--color-text-primary)]">
              {title}
            </h2>
            {description && (
              <p id="dialog-description" className="mt-1 text-small text-[var(--color-text-secondary)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`
              flex-shrink-0 rounded-md p-1.5 text-[var(--color-text-tertiary)]
              hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]
              transition-colors duration-fast
            `}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialogContent, document.body);
}

interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className = "", ...props }: DialogFooterProps) {
  return (
    <footer
      className={`
        flex flex-wrap items-center justify-end gap-3
        border-t border-[var(--color-border)] p-4 sm:p-5 bg-[var(--color-surface-elevated)/50]
        ${className}
      `}
      {...props}
    >
      {children}
    </footer>
  );
}

interface DialogTriggerProps {
  children: ReactNode;
  onOpen: () => void;
}

export function DialogTrigger({ children, onOpen }: DialogTriggerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
    >
      {children}
    </button>
  );
}

/* Named exports for composite dialog pattern */
export function DialogHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <header className={`flex items-start justify-between gap-4 border-b border-[var(--color-border)] p-4 sm:p-5 ${className}`}>{children}</header>;
}

export function DialogTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 id="dialog-title" className={`text-h3 text-[var(--color-text-primary)] ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p id="dialog-description" className={`mt-1 text-small text-[var(--color-text-secondary)] ${className}`}>{children}</p>;
}

export function DialogClose({ onClose, className = "" }: { onClose: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={`
        flex-shrink-0 rounded-md p-1.5 text-[var(--color-text-tertiary)]
        hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]
        transition-colors duration-fast
        ${className}
      `}
      aria-label="Close dialog"
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}