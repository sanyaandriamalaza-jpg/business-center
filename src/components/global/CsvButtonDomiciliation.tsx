"use client";

import { VirtualOfficeData } from "@/src/lib/type";
import { Button } from "@/src/components/ui/button";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface CsvButtonDomiciliationProps {
  domiciliations: VirtualOfficeData[];
}

export function CsvButtonDomiciliation({
  domiciliations,
}: CsvButtonDomiciliationProps) {
  const hasData = domiciliations && domiciliations.length > 0;

  const convertToCSV = (data: VirtualOfficeData[]): string => {
    if (data.length === 0) return "";

    // En-têtes plus détaillés et organisés
    const headers = [
      // Informations entreprise
      "Nom de l'entreprise",
      "Forme juridique",
      "SIRET",

      // Informations représentant
      "Nom du représentant",
      "Prénom du représentant",
      "Email du représentant",

      // Informations plan et facturation
      "Plan souscrit",
      "Montant mensuel (€)",

      // Statut
      "Statut de la domiciliation",

      // Documents client détaillés
      "Total documents client",
      "Documents validés",
      "Documents rejetés",
      "Documents en attente de validation",
      "Progression validation (%)",

      // Documents contractuels
      "Contrats générés",
      "Contrats signés par le client",
      "Contrats en attente signature admin",
      "Statut contractuel",
    ];

    // Convertir les données avec plus de détails
    const rows = data.map((dom) => {
      // Calculer le pourcentage de validation des documents
      const totalDocs = dom.userFiles?.total || 0;
      const validatedDocs = dom.userFiles?.stats?.validated || 0;
      const validationProgress =
        totalDocs > 0 ? Math.round((validatedDocs / totalDocs) * 100) : 0;

      // Analyser les contrats
      const contractFiles = dom.contractFiles || [];
      const contractsSignedByUser = contractFiles.filter(
        (file: any) => file.isContractSignedByUser === true
      ).length;
      const contractsPendingAdminSignature = contractFiles.filter(
        (file: any) =>
          file.isContractSignedByUser === true &&
          file.isContractSignedByAdmin === false
      ).length;

      // Déterminer le statut contractuel
      let contractStatus = "Aucun contrat";
      if (contractFiles.length === 0 && validatedDocs === 4) {
        contractStatus = "En attente de génération";
      } else if (contractFiles.length > 0) {
        if (contractsPendingAdminSignature > 0) {
          contractStatus = "En attente signature admin";
        } else if (contractsSignedByUser === contractFiles.length) {
          contractStatus = "Tous contrats signés";
        } else {
          contractStatus = "En cours de signature";
        }
      }

      return [
        // Entreprise
        dom.company?.companyName || "Non renseigné",
        dom.company?.legalForm || "Non renseigné",
        dom.company?.siret || "Non renseigné",

        // Représentant
        dom.user?.name || "Non renseigné",
        dom.user?.firstName || "Non renseigné",
        dom.user?.email || "Non renseigné",

        // Plan et facturation
        dom.virtualOfficeOffer?.offerName || "Non renseigné",
        dom.amount?.toString() || "0",

        // Statut
        getStatusLabel(dom.status || ""),

        // Documents client
        totalDocs.toString(),
        (dom.userFiles?.stats?.validated || 0).toString(),
        (dom.userFiles?.stats?.rejected || 0).toString(),
        (dom.userFiles?.stats?.pending || 0).toString(),
        `${validationProgress}%`,

        // Documents contractuels
        contractFiles.length.toString(),
        contractsSignedByUser.toString(),
        contractsPendingAdminSignature.toString(),
        contractStatus,
      ];
    });

    // Générer le CSV avec BOM UTF-8 pour Excel
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((field) => {
            // Nettoyer et échapper les champs
            const cleanField = field.toString().trim();
            // Échapper les guillemets et encapsuler si nécessaire
            if (
              cleanField.includes(",") ||
              cleanField.includes('"') ||
              cleanField.includes("\n")
            ) {
              return `"${cleanField.replace(/"/g, '""')}"`;
            }
            return cleanField;
          })
          .join(",")
      )
      .join("\n");

    // Ajouter le BOM UTF-8 pour assurer la compatibilité Excel
    return "\uFEFF" + csvContent;
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      confirmed: "Actif",
      pending: "En attente",
      canceled: "Archivé",
      "": "Non défini",
    };
    return statusMap[status] || status;
  };

  const downloadCSV = () => {
    if (!hasData) return;

    try {
      const csvContent = convertToCSV(domiciliations);

      // Créer le blob avec le bon type MIME et encoding
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      // Nom de fichier plus descriptif
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const timeStr = now.toTimeString().slice(0, 5).replace(":", "h"); // HHhMM
      const fileName = `Export_Domiciliations_${dateStr}_${timeStr}.csv`;

      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer
      URL.revokeObjectURL(url);

      console.log(
        `Export CSV réussi: ${fileName} (${domiciliations.length} enregistrements)`
      );
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            disabled={!hasData}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {hasData
              ? `Télécharger ${domiciliations.length} domiciliation${domiciliations.length > 1 ? "s" : ""} en CSV`
              : "Aucune donnée à télécharger"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
