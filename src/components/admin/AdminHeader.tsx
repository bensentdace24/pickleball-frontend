import { Link } from "react-router-dom";
import { Button } from "../Button";

type AdminPage = "dashboard" | "rankings" | "history" | "analytics";

const links: { page: AdminPage; label: string; to: string }[] = [
  { page: "dashboard", label: "Court Floor", to: "/admin" },
  { page: "rankings", label: "Rankings", to: "/admin/rankings" },
  { page: "history", label: "History", to: "/admin/history" },
  { page: "analytics", label: "Analytics", to: "/admin/analytics" },
];

export function AdminHeader({
  active,
  staffName,
  activeMatches,
  syncIntervalSeconds,
  onLogout,
}: {
  active: AdminPage;
  staffName?: string;
  activeMatches?: number;
  syncIntervalSeconds?: number;
  onLogout?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/admin" className="flex items-center gap-3 rounded-lg" aria-label="Pickleball Queue admin home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 shadow-sm">
            <svg viewBox="0 0 28 28" className="h-6 w-6" aria-hidden="true">
              <circle cx="14" cy="14" r="10" fill="#FACC15" />
              <circle cx="11" cy="11" r="1.4" fill="#0F172A" />
              <circle cx="17" cy="11" r="1.4" fill="#0F172A" />
              <circle cx="14" cy="15" r="1.4" fill="#0F172A" />
              <circle cx="10.5" cy="17.5" r="1.3" fill="#0F172A" />
              <circle cx="17.5" cy="17.5" r="1.3" fill="#0F172A" />
            </svg>
          </span>
          <span>
            <span className="block text-base font-extrabold tracking-tight text-slate-950 sm:text-lg">Pickleball Queue · Admin</span>
            <span className="block text-[11px] text-slate-500">Live court rally telemetry &amp; queue operations</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {syncIntervalSeconds !== undefined && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
              Syncs every {syncIntervalSeconds}s
            </span>
          )}
          {activeMatches !== undefined && (
            <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex">
              <span className="relative flex h-2 w-2">
                {activeMatches > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              {activeMatches} live {activeMatches === 1 ? "match" : "matches"}
            </span>
          )}
          <nav aria-label="Admin navigation" className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            {links.map((link) => (
              <Link
                key={link.page}
                to={link.to}
                aria-current={active === link.page ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${active === link.page ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {staffName && (
            <span className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm md:inline-flex">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-100 font-bold text-sky-800">{staffName.slice(0, 1).toUpperCase()}</span>
              <span><span className="block text-[10px] text-slate-500">Signed in</span><span className="font-semibold">{staffName}</span></span>
            </span>
          )}
          {onLogout && <Button size="sm" variant="secondary" onClick={onLogout}>Log out</Button>}
        </div>
      </div>
    </header>
  );
}
