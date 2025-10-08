import { Badge } from "@/src/components/ui/badge";
import { InvoiceStatus } from "@/src/lib/type";
import { cn } from "@/src/lib/utils";

export default function FormatInvoiceStatus({
  status,
}: {
  status: InvoiceStatus;
}) {
  const statusMap: Record<InvoiceStatus, { text: string; color: string }> = {
    paid: { text: "Payé", color: "#22c55e" },
    sent: { text: "Envoyé", color: "#3b82f6" },
    pending: { text: "En attente", color: "#f59e0b" },
    overdue: { text: "En retard", color: "#9ca3af" },
    canceled: { text: "Annulé", color: "#ef4444" },
  };

  const { text, color } = statusMap[status] ?? {
    text: "Inconnu",
    color: "#6b7280",
  };

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
