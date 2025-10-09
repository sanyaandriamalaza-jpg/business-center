"use client";

import { Card } from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import WorkspaceDialog, { WorkspaceStepperForm } from "../components/forms/WorkspaceDialog";
import { Offer, Workspace } from "@/src/lib/type";
import WorkspaceOfferDialog, { FormValues } from "../components/forms/WorkspaceOfferDialog";

const espaces = [
  {
    image: "/office1.png",
    nom: "Bureau Exécutif A",
    type: "Bureau",
    capacite: "4 personnes",
    prix: "45€",
    statut: "Actif",
  },
  {
    image: "/office2.jpeg",
    nom: "Salle de Conférence B",
    type: "Salle de Réunion",
    capacite: "10 personnes",
    prix: "35€",
    statut: "Actif",
  },
  {
    image: "/office3.png",
    nom: "Espace Coworking C",
    type: "Espace Coworking",
    capacite: "20 personnes",
    prix: "15€",
    statut: "Actif",
  },
];


export default function EspacesPage() {
  const [search, setSearch] = useState("");
  const filteredEspaces = espaces.filter((e) =>
    e.nom.toLowerCase().includes(search.toLowerCase())
  );

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

  const handleCreateWorkspace = (form: WorkspaceStepperForm) => {
    const newWorkspace: Workspace = {
      id: Date.now(),
      name: form.name,
      type: form.type as Workspace["type"],
      capacity: Number(form.capacity),
      schedules: form.schedules.map(s => ({ ...s })),
      equipments: form.equipments,
      pricing: {
        label: form.pricingLabel,
        value: form.pricingValue,
      },
    };
    setWorkspaces(ws => [...ws, newWorkspace]);
    setDialogOpen(false);
  };

  const handleCreateOffer = (form: FormValues) => {
    const featuresArray = form.features
    ?.split('\n')
    .map((f) => f.trim())
    .filter((f) => f.length > 0) || []

    const newOffer: Offer = {
      id: Date.now(),
      type: form.type,
      isTaged: form.isTaged,
      pricing: {
        horaire: Number(form.tarifs.horaire),
        journalier: Number(form.tarifs.journalier),
      },
      features: featuresArray,
    }
  
    setOfferOpen(false)
  }

  return (
    <div className="py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Espaces</h1>
        <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={() => setDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
        >
          <Plus className="w-5 h-5" /> Nouvel Espace
        </Button>
        <Button
          variant="ghost"
          onClick={() => setOfferOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
        >
          <Plus className="w-5 h-5" /> Nouvelle offre
        </Button>
        </div>
      </div>
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full ">
            <Input
              className="pl-10"
              placeholder="Rechercher un espace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <div className=" overflow-hidden border border-gray-100 last:border-0">
            <Table>
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  <TableHead className="font-medium text-gray-700">
                    NOM
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    TYPE
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    CAPACITÉ
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    PRIX/HEURE
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    STATUT
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEspaces.map((e, idx) => (
                  <TableRow key={e.nom + idx}>
                    <TableCell className="flex items-center gap-3 font-medium">
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image
                          src={e.image}
                          alt={e.nom}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="48px"
                        />
                      </div>
                      <span className="text-gray-900 text-sm">{e.nom}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          " font-medium text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700"
                        }
                      >
                        {e.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{e.capacite}</TableCell>
                    <TableCell className="text-sm text-gray-600">{e.prix}</TableCell>
                    <TableCell>
                      <span className="bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full text-xs">
                        {e.statut}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3">
                        <Edit
                          className="text-indigo-600 hover:text-indigo-700 w-5 h-5 cursor-pointer"
                        />
                        <Trash2
                          className="text-red-600 hover:text-red-700 w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEspaces.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-400 py-8"
                    >
                      Aucun espace trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
      <WorkspaceDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onCreate={handleCreateWorkspace}
      />
      <WorkspaceOfferDialog open={offerOpen} setOpen={setOfferOpen} onCreate={handleCreateOffer}/>
    </div>
  );
}
