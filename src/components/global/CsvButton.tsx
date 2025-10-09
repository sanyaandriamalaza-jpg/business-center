"use client";

import { Invoice } from "@/src/lib/type";
import { Button } from "@/src/components/ui/button";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface CsvButtonProps {
  invoices: Invoice[];
}

export function CsvButton({ invoices }: CsvButtonProps) {
  const hasData = invoices && invoices.length > 0;

  const convertToCSV = (data: Invoice[]): string => {
    if (data.length === 0) return "";

    // En-têtes plus détaillés et organisés
    const headers = [
      // Informations facture
      "Référence facture",
      "Numéro de référence",

      // Informations client
      "Nom du client",
      "Prénom du client",
      "Email du client",

      // Informations réservation
      "Type de bureau",
      "Statut d'abonnement",
      "Type de durée",
      "Date de début",
      "Date de fin",

      // Informations financières
      "Montant total (€)",
      "Devise",

      // Statut et dates
      "Nouvelle réservation",
    ];

    // Convertir les données avec plus de détails
    const rows = data.map((invoice) => {
      return [
        // Informations facture
        invoice.reference || "Non renseigné",
        invoice.referenceNum || "Non renseigné",

        // Informations client
        invoice.user?.name || "Non renseigné",
        invoice.user?.firstName || "Non renseigné",
        invoice.user?.email || "Non renseigné",

        // Informations réservation
        getOfficeTypeLabel(invoice.office?.coworkingOffer?.type),
        getStatusLabel(invoice.subscriptionStatus || ""),
        getDurationTypeLabel(invoice.durationType || ""),
        formatDate(invoice.startSubscription),

        // Informations financières
        invoice.totalAmount?.toString() || "0",
        invoice.currency || "EUR",

        // Statut et dates
        invoice.isProcessed === false ? "Oui" : "Non",
        formatDate(invoice.createdAt),
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

  const getOfficeTypeLabel = (type: string | undefined): string => {
    const typeMap: { [key: string]: string } = {
      privateOffice: "Bureau privé",
      coworkingSpace: "Espace coworking",
      meetingRoom: "Salle de réunion",
      "": "Non défini",
    };
    return typeMap[type || ""] || type || "Non renseigné";
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      confirmed: "Confirmé",
      pending: "En attente",
      canceled: "Annulé",
      "": "Non défini",
    };
    return statusMap[status] || status;
  };

  const getDurationTypeLabel = (type: string): string => {
    const durationMap: { [key: string]: string } = {
      hourly: "Horaire",
      daily: "Journalier",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      "": "Non défini",
    };
    return durationMap[type] || type;
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return "Non renseigné";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  const downloadCSV = () => {
    if (!hasData) return;

    try {
      const csvContent = convertToCSV(invoices);

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
      const fileName = `Export_Reservations_${dateStr}_${timeStr}.csv`;

      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer
      URL.revokeObjectURL(url);

      console.log(
        `Export CSV réussi: ${fileName} (${invoices.length} enregistrements)`
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
              ? `Télécharger ${invoices.length} réservation${invoices.length > 1 ? "s" : ""} en CSV`
              : "Aucune donnée à télécharger"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
