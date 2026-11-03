import { Badge } from "./Badge";

const tierVariants: Record<string, "default" | "warning" | "success" | "primary" | "info" | "danger"> = {
  Rookie: "default",
  Warrior: "warning",
  Elite: "success",
  Master: "primary",
  Grandmaster: "info",
  Epic: "info",
  Legend: "danger",
  Mythic: "warning",
};

export function TierBadge({ tier }: { tier: string }) {
  return (
    <Badge variant={tierVariants[tier] ?? "default"} size="sm">
      {tier}
    </Badge>
  );
}