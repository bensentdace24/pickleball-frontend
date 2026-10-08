import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JoinForm } from "../components/player/JoinForm";
import { queueApi } from "../services/api";
import type { MatchType, SkillLevel } from "../types";

export default function PlayerView() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleJoin(data: {
    name: string;
    phone?: string;
    skill_level?: SkillLevel;
    match_type: MatchType;
  }) {
    setBusy(true);
    try {
      const entry = await queueApi.selfRegister(data);
      const token = entry.player?.qr_token;
      if (token) navigate(`/status/${token}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <h1 className="mb-8 text-center text-2xl font-bold text-slate-900">
        Pickleball Queue
      </h1>
      <p className="mx-auto mb-6 max-w-md text-center text-sm text-slate-600">
        Enter your details to register. The front desk will confirm your spot.
      </p>
      <JoinForm busy={busy} onJoin={handleJoin} />
    </div>
  );
}
