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
    <div className="min-h-screen px-4 py-8 sm:py-14">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <section className="px-1 sm:px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Pickleball · Queue check-in
          </div>
          <h1 className="mt-5 max-w-lg text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Get in line.
            <span className="block text-sky-700">Get on court.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            Join the queue and keep your spot handy. The front desk will confirm your registration, then your player page will show your place and match updates.
          </p>
          <div className="mt-7 grid max-w-md gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white bg-white/75 p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Choose your format</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Singles, doubles, or either format.</p>
            </div>
            <div className="rounded-xl border border-white bg-white/75 p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Track your turn</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Follow your queue position and upcoming match.</p>
            </div>
          </div>
        </section>
        <section>
          <div className="mb-3 px-1">
            <p className="text-sm font-semibold text-slate-900">Join the queue</p>
            <p className="mt-1 text-xs text-slate-500">A few details help staff confirm your spot.</p>
          </div>
          <JoinForm busy={busy} onJoin={handleJoin} />
        </section>
      </div>
    </div>
  );
}
