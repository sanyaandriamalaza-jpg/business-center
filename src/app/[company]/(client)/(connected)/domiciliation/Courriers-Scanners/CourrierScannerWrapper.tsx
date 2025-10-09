"use client";

import { useState } from "react";
import MailTable, { MailItem } from "./MailTable";
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

const stats = [
  { label: "Non lu", value: 1, color: "orange" as const },
  { label: "Ce mois-ci", value: 26, color: "green" as const },
  { label: "Cette semaine", value: 2, color: "purple" as const },
];

const mails: MailItem[] = [
  {
    id: "1",
    date: "27/07/2025",
    sender: "INSEE",
    subject: "Avis de situation au répertoire Sirene",
    type: "facture",
    status: "non-lu",
  },
  {
    id: "2",
    date: "24/07/2025",
    sender: "URSSAF",
    subject: "Appel de cotisations – 3e trimestre",
    type: "facture",
    status: "lu",
  },
  {
    id: "3",
    date: "19/07/2025",
    sender: "Banque",
    subject: "Relevé de compte professionnel – Juillet 2025",
    type: "facture",
    status: "lu",
  },
  {
    id: "4",
    date: "18/07/2025",
    sender: "EDF Entreprises",
    subject: "Facture d'électricité – Site domicilié",
    type: "facture",
    status: "lu",
  },
  {
    id: "5",
    date: "18/07/2025",
    sender: "DGFP",
    subject: "Avis d'imposition 2025",
    type: "courrier",
    status: "lu",
  },
  {
    id: "6",
    date: "18/07/2025",
    sender: "Pôle Emploi",
    subject: "Confirmation de radiation / mise à jour",
    type: "courrier",
    status: "lu",
  },
  {
    id: "7",
    date: "18/07/2025",
    sender: "RSI",
    subject: "Relance de paiement – cotisation sociale",
    type: "publicite",
    status: "lu",
  },
  {
    id: "8",
    date: "18/07/2025",
    sender: "Notaire Duval & Associés",
    subject: "Acte de nomination du nouveau gérant",
    type: "courrier",
    status: "lu",
  },
  {
    id: "9",
    date: "18/07/2025",
    sender: "Greffe du Tribunal",
    subject: "Attestation d'immatriculation mise à jour",
    type: "courrier",
    status: "lu",
  },
  {
    id: "10",
    date: "18/07/2025",
    sender: "La Poste",
    subject: "Avis de passage – colis non remis",
    type: "courrier",
    status: "lu",
  },
];

export default function CourrierScannerWrapper() {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    date: "",
    type: "",
    important: false,
    unread: false,
  });

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

  const filteredMails = mails.filter((mail) => {
    const searchMatch =
      mail.sender.toLowerCase().includes(searchValue.toLowerCase()) ||
      mail.subject.toLowerCase().includes(searchValue.toLowerCase());

    const dateMatch = filters.date ? mail.date === filters.date : true;
    const typeMatch = filters.type ? mail.type === filters.type : true;
    const unreadMatch = filters.unread ? mail.status === "non-lu" : true;

    return searchMatch && typeMatch && dateMatch && unreadMatch;
  });

  const handleEmailClick = (id: string) => {
    console.log("Email clicked:", id);
  };

  const handleDownloadClick = (id: string) => {
    console.log("Download clicked:", id);
  };

  const handleDeleteClick = (id: string) => {
    console.log("Delete clicked:", id);
  };

  return (
    <div className="pt-6 px-3 md:px-0">
      <div className="mb-8 py-3">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
          Courriers scannés
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Consultez le courrier reçu à l'adresse de domiciliation.
        </p>
      </div>
      <div className="bg-white py-8 px-3 md:px-16 w-full rounded-2xl shadow-sm">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              type="text"
              placeholder="Filtrer par expéditeur ou objet..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 border-gray-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleFilterClick}
            className="border-none bg-gray-100 hover:bg-gray-50"
          >
            <Filter />
          </Button>
        </div>
        {showFilterPanel && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date-filter">Date</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilter("date", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilter("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="types">Tous types</SelectItem>
                    <SelectItem value="facture">Facture</SelectItem>
                    <SelectItem value="courrier">Courrier</SelectItem>
                    <SelectItem value="publicite">Publicité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                className="mr-2 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
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
      </div>
    </div>
  );
}
