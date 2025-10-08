import { Badge } from "@/src/components/ui/badge";
import { CoworkingOfferType } from "@/src/lib/type";

export default function FormatCoworkingOfferStatus({
  type,
}: {
  type: CoworkingOfferType;
}) {
  const typeMap: Record<CoworkingOfferType, { text: string; color: string }> = {
    privateOffice: { text: "Bureau privé", color: "#7f2afe" },
    coworkingSpace: { text: "Espace coworking", color: "#c6145a" },
    meetingRoom: { text: "Salle de réunion", color: "#0d7b55" },
  };

  const { text, color } = typeMap[type] ?? {
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
