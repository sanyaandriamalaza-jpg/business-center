import { Badge } from "@/src/components/ui/badge";
import React from "react";

export type SubscriptionStatus = "confirmed" | "canceled" | "pending";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
}

const statusMap: Record<SubscriptionStatus, { text: string; color: string }> = {
  confirmed: { text: "Confirmé", color: "#22c55e" }, // vert
  canceled: { text: "Annulé", color: "#ef4444" },    // rouge
  pending: { text: "En attente", color: "#f59e0b" }, // orange
};

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const { text, color } = statusMap[status] ?? { text: "Inconnu", color: "#6b7280" };

  return (
    <Badge
      variant="default"
      style={{
        color,
        backgroundColor: `${color}20`,
      }}
      className="shadow-none"
    >
      {text}
    </Badge>
  );
}