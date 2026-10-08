import { QRCodeSVG } from "qrcode.react";
import { Button } from "../Button";

interface Props {
  playerName: string;
  qrToken: string;
  onClose: () => void;
}

export function PlayerQrCode({ playerName, qrToken, onClose }: Props) {
  const url = `${window.location.origin}/status/${qrToken}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          {playerName}'s QR Code
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Scan with your phone camera to check your status anytime.
        </p>

        <div className="mt-4 flex justify-center">
          <div className="rounded-lg border border-slate-200 p-4">
            <QRCodeSVG value={url} size={200} />
          </div>
        </div>

        <p className="mt-3 break-all text-xs text-slate-400">{url}</p>

        <Button className="mt-5 w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
