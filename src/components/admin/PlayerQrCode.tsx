import { QRCodeSVG } from "qrcode.react";
import { Button } from "../Button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../Dialog";

interface Props {
  playerName: string;
  qrToken: string;
  onClose: () => void;
}

export function PlayerQrCode({ playerName, qrToken, onClose }: Props) {
  const url = `${window.location.origin}/status/${qrToken}`;

  return (
    <Dialog open onClose={onClose} title={`${playerName}'s QR Code`} size="md">
      <DialogHeader>
        <DialogTitle>{playerName}'s QR Code</DialogTitle>
        <DialogDescription>Scan with your phone camera to check your status anytime.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg border border-border p-4 bg-surface-card">
          <QRCodeSVG value={url} size={200} />
        </div>
        <p className="break-all text-label text-text-tertiary">{url}</p>

        <DialogFooter>
          <Button className="w-full" onClick={onClose}>Done</Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}