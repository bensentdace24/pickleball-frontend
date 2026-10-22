import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import { clearAuth } from "../../services/auth";

interface Props {
  active: "dashboard" | "rankings" | "history" | "analytics";
  staffName?: string;
  activeMatches?: number;
  syncIntervalSeconds?: number;
  onLogout?: () => void;
}

const links: { id: Props["active"]; label: string; href: string }[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin" },
  { id: "rankings", label: "Rankings", href: "/admin/rankings" },
  { id: "history", label: "History", href: "/admin/history" },
  { id: "analytics", label: "Analytics", href: "/admin/analytics" },
];

export function AdminHeader({
  active,
  staffName,
  activeMatches,
  syncIntervalSeconds,
  onLogout,
}: Props) {
  const navigate = useNavigate();

  async function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await authApi.logout();
    } catch {
      // Clear local credentials even when the session has expired.
    }
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-600 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand + live pill */}
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-lemon-400 text-sm font-black text-ink-950">
            P
          </span>
          <span className="hidden text-sm font-extrabold text-cream-50 sm:block">
            Pickleball
          </span>
          {activeMatches !== undefined && (
            <span className="flex items-center gap-1.5 rounded-full border border-lemon-400/30 bg-lemon-400/[0.08] px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-lemon-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lemon-400" />
              {activeMatches} live
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              aria-current={active === link.id ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                active === link.id
                  ? "bg-lemon-400/15 text-lemon-300"
                  : "text-cream-200/70 hover:bg-ink-800 hover:text-cream-50"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {syncIntervalSeconds !== undefined && (
            <span className="hidden items-center gap-1.5 text-[0.7rem] text-mist-400 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
              {syncIntervalSeconds}s
            </span>
          )}
          {staffName && (
            <span className="hidden max-w-[10ch] truncate text-xs font-semibold text-cream-200 sm:block">
              {staffName}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs font-bold text-cream-200 transition-colors hover:border-rose-400/40 hover:bg-rose-400/[0.08] hover:text-rose-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
