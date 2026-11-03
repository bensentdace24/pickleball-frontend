import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { authApi } from "../../services/api";
import { clearAuth } from "../../services/auth";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { Flex } from "../layout/Page";

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
    <header className="sticky top-0 z-30 border-b border-border bg-surface-elevated/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand + live pill */}
        <Flex align="center" gap={3}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-600 text-sm font-black text-white">
            P
          </span>
          <span className="hidden text-sm font-bold text-text-primary sm:block">
            MJ Pickle Hub
          </span>
          {activeMatches !== undefined && (
            <Badge variant="playing" dot>
              {activeMatches} live
            </Badge>
          )}
        </Flex>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              aria-current={active === link.id ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                active === link.id
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <Flex align="center" gap={3}>
          {syncIntervalSeconds !== undefined && (
            <Flex align="center" gap={1.5} className="hidden text-xs text-text-tertiary sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" aria-hidden="true" />
              {syncIntervalSeconds}s
            </Flex>
          )}
          {staffName && (
            <span className="hidden max-w-[10ch] truncate text-xs font-semibold text-text-secondary sm:block">
              {staffName}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut className="h-4 w-4" />}
            iconPosition="left"
            onClick={handleLogout}
            className="text-text-secondary hover:text-danger-600 dark:hover:text-danger-400"
          >
            Sign out
          </Button>
        </Flex>
      </div>
    </header>
  );
}