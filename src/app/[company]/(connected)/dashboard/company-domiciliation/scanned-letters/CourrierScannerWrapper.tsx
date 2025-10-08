"use client";

import { useMemo, useState } from "react";
import MailTable from "./MailTable";
import StatsCard from "./StatsCard";
import { Filter, Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { MailItem, ReceivedFile } from "@/src/lib/type";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { useToast } from "@/src/hooks/use-toast";

export default function CourrierScannerWrapper({
  mails,
}: {
  mails: ReceivedFile[];
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteMailId, setDeleteMailId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    type: "",
    important: false,
    unread: false,
  });

  const toast = useToast();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Début de la semaine
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const nonLuCount = mails.filter((mail) => mail.status === "not-scanned").length;

    const thisMonthCount = mails.filter((mail) => {
      const mailDate = mail.send_at ?  new Date(mail.send_at) : null;
      return mailDate ?  (
        mailDate.getMonth() === currentMonth &&
        mailDate.getFullYear() === currentYear
      ) : null;
    }).length;

    const thisWeekCount = mails.filter((mail) => {
      const mailDate = mail.send_at ?  new Date(mail.send_at) : null;
      return mailDate ? mailDate >= startOfWeek && mailDate <= now : null;
    }).length;

    return [
      { label: "Non lu", value: nonLuCount, color: "orange" as const },
      { label: "Ce mois-ci", value: thisMonthCount, color: "green" as const },
      {
        label: "Cette semaine",
        value: thisWeekCount,
        color: "purple" as const,
      },
    ];
  }, [mails]);

  const determineMailType = (
    courrielObject: string | null | undefined
  ): string => {
    if (!courrielObject) return "Courrier";

    const objectLower = courrielObject.toLowerCase();

    if (objectLower.includes("rapport")) {
      return "Rapport";
    }

    if (
      objectLower.includes("facture") ||
      objectLower.includes("invoice") ||
      objectLower.includes("bill") ||
      objectLower.includes("paiement") ||
      objectLower.includes("règlement")
    ) {
      return "Facture";
    }

    // Vérification pour publicité
    if (
      objectLower.includes("promo") ||
      objectLower.includes("offre") ||
      objectLower.includes("reduction") ||
      objectLower.includes("solde") ||
      objectLower.includes("newsletter") ||
      objectLower.includes("marketing") ||
      objectLower.includes("pub")
    ) {
      return "Publicité";
    }

    return "Courrier";
  };

  const availableTypes = useMemo(() => {
    const types = new Set(
      mails.map((mail) => determineMailType(mail.courriel_object))
    );
    return Array.from(types).sort();
  }, [mails]);

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleFilterClick = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  const handleFilter = (filterType: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      date: "",
      type: "",
      important: false,
      unread: false,
    });
  };

  console.log(mails)

  const withTypeMails = useMemo(() => {
    return mails.map((mail) => ({
      ...mail,
      type: determineMailType(mail.courriel_object),
    }));
  }, [mails]);

  const filteredMails = withTypeMails.filter((mail) => {
    const searchMatch =
      mail.received_from_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      mail.courriel_object?.toLowerCase().includes(searchValue.toLowerCase());

    const dateMatch = filters.date ? String(mail.send_at) === filters.date : true;
    const typeMatch = filters.type ? mail.type === filters.type : true;
    const unreadMatch = filters.unread ? mail.status === "not-scanned" : true;

    return searchMatch && typeMatch && dateMatch && unreadMatch;
  });

  const handleEmailClick = (id: string) => {
    const mail = withTypeMails.find((m) => m.id_received_file === Number(id));
    if (mail && mail.file_url) {
      setSelectedPdfUrl(mail.file_url);
      setIsModalOpen(true);
    } else {
      toast.toast({
        title: "Non terminé",
        description: `Fichier non disponible`,
        variant: "default",
      });
    }
  };

  const handleDownloadClick = async (id: string) => {
    try {
      const mail = withTypeMails.find((m) => m.id_received_file === Number(id));
      if (!mail || !mail.file_url) {
        toast.toast({
          title: "Téléchargement non terminé",
          description: `Fichier non disponble pour le téléchargement`,
          variant: "default",
        });
        return;
      }

      const response = await fetch(mail.file_url);
      if (!response.ok) {
        toast.toast({
          title: "Error",
          description: `Erreur lors de la téléchargement du fichier.`,
          variant: "destructive",
        });
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${mail.courriel_object || "courrier"}_${mail.received_from_name || "expediteur"}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.toast({
        title: "Error",
        description: `Erreur lors de la téléchargement du fichier.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteMailId(id);
  };

  const confirmDelete = async () => {
    if (!deleteMailId) return;

    try {
      setIsDeleting(true);

      //  met à jour is_Archived à true
      const response = await fetch(`/api/received-file/${deleteMailId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isArchived: true,
        }),
      });

      if (!response.ok) {
        toast.toast({
          title: "Error",
          description: `Erreur lors de l'archivage.`,
          variant: "destructive",
        });
      }

      toast.toast({
        title: "Success",
        description: `Fichier archivé avec succès.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Erreur lors de l'archivage:", error);
      toast.toast({
        title: "Error",
        description: `Erreur lors de l'archivage du courrier.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteMailId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteMailId(null);
  };

  const closePdfModal = () => {
    setIsModalOpen(false);
    setSelectedPdfUrl(null);
  };

  return (
    <div className="container mx-auto pt-6 px-4">
      <div className="mb-8 py-3">
        <h1 className="text-xl md:text-3xl font-bold text-cStandard mb-2">
          Courriers scannés
        </h1>
        <p className="text-cStandard/90 text-sm md:text-base">
          Consultez le courrier reçu à l'adresse de domiciliation.
        </p>
      </div>
      <div className="bg-cBackground/70 py-8 px-3 md:px-16 w-full rounded-2xl shadow-sm">
        <div className=" md:w-1/2 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>
        <div className="flex items-center justify-between space-x-4 mb-6">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cStandard/70 w-5 h-5" />
            <Input
              type="text"
              placeholder="Filtrer par expéditeur ou objet..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 border-cStandard/70"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleFilterClick}
            className="border-none bg-cStandard/50 hover:bg-cStandard/90"
          >
            <Filter />
          </Button>
        </div>
        {showFilterPanel && (
          <div className="bg-cBackground/90 p-4 rounded-lg shadow-md mb-6 border border-cStandard/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date-filter">Date</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilter("date", e.target.value)}
                  className="border border-cStandard/10 text-cStandard/70"
                />
              </div>
              {/* <div>
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilter("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="types" className="text-cStandard">
                      Tous types
                    </SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="unread-filter"
                  checked={filters.unread}
                  onCheckedChange={(checked) => handleFilter("unread", checked)}
                />
                <Label htmlFor="unread-filter">Non lus seulement</Label>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="mr-2 bg-cPrimary/90 text-cForeground hover:bg-cPrimaryHover hover:text-cForeground"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
        <MailTable
          mails={filteredMails}
          onEmailClick={handleEmailClick}
          onDownloadClick={handleDownloadClick}
          onDeleteClick={handleDeleteClick}
        />

        <AlertDialog open={deleteMailId !== null} onOpenChange={cancelDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archiver le courrier</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir archiver ce courrier ? Cette action ne
                peut pas être annulée. Le courrier sera déplacé vers les
                archives.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-cForeground hover:text-cForeground"
              >
                {isDeleting ? "Archivage en cours..." : "Archiver"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isModalOpen && selectedPdfUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-cBackground bg-opacity-75">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-cBackground rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-cStandard">
                  Visualisation du courrier
                </h3>
                <Button
                  variant="ghost"
                  onClick={closePdfModal}
                  className="text-cStandard hover:bg-cStandard/10"
                >
                  ✕
                </Button>
              </div>

              {/* TODO : utiliser baseURL pour les url fichier */}

              <div className="p-4 h-[calc(90vh-80px)]">
                <iframe
                  src={selectedPdfUrl}
                  className="w-full h-full border-0 rounded"
                  title="Visualisation PDF"
                >
                  <p>
                    Votre navigateur ne supporte pas l'affichage des PDF.
                    <a
                      href={selectedPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Télécharger le fichier
                    </a>
                  </p>
                </iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
