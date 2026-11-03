import type { ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const alertIcons: Record<AlertType, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-court-green-600 dark:text-court-green-400" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-400" aria-hidden="true" />,
  warning: <AlertCircle className="h-5 w-5 text-ball-yellow-600 dark:text-ball-yellow-400" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-sky-blue-600 dark:text-sky-blue-400" aria-hidden="true" />,
};

const alertStyles: Record<AlertType, string> = {
  success: "bg-court-green-50 border-court-green-200 text-court-green-800 dark:bg-court-green-900/20 dark:border-court-green-800 dark:text-court-green-400",
  error: "bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-400",
  warning: "bg-ball-yellow-50 border-ball-yellow-200 text-ball-yellow-800 dark:bg-ball-yellow-900/20 dark:border-ball-yellow-800 dark:text-ball-yellow-400",
  info: "bg-sky-blue-50 border-sky-blue-200 text-sky-blue-800 dark:bg-sky-blue-900/20 dark:border-sky-blue-800 dark:text-sky-blue-400",
};

const alertRoles: Record<AlertType, "alert" | "status"> = {
  success: "status",
  error: "alert",
  warning: "alert",
  info: "status",
};

export function Alert({ type, title, children, onDismiss, className = "" }: AlertProps) {
  return (
    <div
      role={alertRoles[type]}
      className={`
        flex gap-3 rounded-lg border p-4
        ${alertStyles[type]}
        ${className}
      `}
    >
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">{alertIcons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold">{title}</h4>}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 rounded p-1 text-current opacity-50 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

interface SpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ label = "Loading…", size = "md", className = "" }: SpinnerProps) {
  const sizeStyles = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-10 w-10 border-3",
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} role="status">
      <svg className={sizeStyles[size]} viewBox="0 0 24 24" aria-hidden="true">
        <circle
          className="text-border"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
          fill="none"
        />
        <circle
          className="text-court-green-600 animate-spin"
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="sr-only">{label}</span>
      {label && !className.includes("sr-only") && <span className="text-sm text-text-secondary">{label}</span>}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface-card p-8 text-center ${className}`}>
      {icon && <div className="text-text-tertiary" aria-hidden="true">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* Toast system */
import { createContext, useContext, useState, useCallback } from "react";

interface Toast {
  id: string;
  type: AlertType;
  title?: string;
  message: ReactNode;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.duration !== 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.duration ?? 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

function ToastViewport() {
  const { toasts, removeToast } = useContext(ToastContext)!;

  return (
    <div
      className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  return (
    <div
      className={`
        pointer-events-auto flex gap-3 rounded-lg border p-4 min-w-[300px] max-w-md shadow-xl
        animate-in slide-in-from-right duration-fast
        ${alertStyles[toast.type]}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">{alertIcons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold">{toast.title}</p>}
        <p className={toast.title ? "mt-1" : ""} text-sm>{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 rounded p-1 text-current opacity-50 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}