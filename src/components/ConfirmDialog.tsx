import { Dialog, DialogFooter, Button } from "./index";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: "primary" | "success" | "warning" | "danger";
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  variant = "primary",
  danger = false,
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const buttonVariant = danger ? "danger" : variant;
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnOverlayClick={!busy}
      closeOnEscape={!busy}
    >
      <p className="text-text-secondary">{message}</p>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant={buttonVariant} onClick={onConfirm} disabled={busy} loading={busy}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}