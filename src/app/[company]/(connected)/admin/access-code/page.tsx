import { AccessCode } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { AccessCodesTable } from "./AccessCodesTable";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { AddAccessCodeDialog } from "./AddAccessCodeDialog";

const fetchAccessCode = async (): Promise<AccessCode[] | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/access-code`, {
      method: "GET",
      next: { revalidate: 10 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? (data.data as AccessCode[]) : null;
  } catch (error) {
    console.error("Erreur récupération code d'accès :", error);
    return null;
  }
};

export default async function CodePage() {
  const accessCodes = await fetchAccessCode();
  if (!accessCodes) throw new Error("Impossible de récupérer les factures")
  return (
    <div className="py-8 px-4">
      <div className="flex md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Codes d'Accès
        </h1>
        {/* <AddAccessCodeDialog/> */}
      </div>
      <AccessCodesTable accessCodes={accessCodes}/>
    </div>
  );
}
