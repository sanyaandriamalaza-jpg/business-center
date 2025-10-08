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
import {
  Search,
  Eye,
  Ban,
  RefreshCw,
  Plus,
  Building2,
  Clock,
  Euro,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  CheckCircle,
  Edit,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Domiciliation, DomiciliationStepperForm } from "@/src/lib/type";
import DomiciliationDialog from "../components/forms/DomiciliationDialog";
import { ViewDomiciliationDialog } from "../components/forms/ViewDomiciliationDialog";
import AddFormuleDialog from "../components/forms/AddFormuleDialog";

const companiesData = [
  {
    entreprise: {
      name: "TechStart SARL",
      siret: "12345678900010",
      since: "14/01/2024",
      address: "1 Avenue de la Réussite, 75001 Paris",
    },
    representant: {
      name: "Sophie Martin",
      role: "Gérant",
      email: "sophie.martin@techstart.fr",
    },
    plan: {
      label: "Premium",
      color: "bg-purple-100 text-purple-600",
      price: "99€/mois",
    },
    statut: {
      value: "Actif",
      color: "bg-green-100 text-green-700",
      icon: <CircleCheck className="w-4 h-4 inline mr-1" />,
    },
    docs: [{ label: "2 docs", color: "bg-gray-100 text-gray-700" }],
    actions: ["view", "edit", "ban"],
    warnings: [],
    id: 1,
  },
  {
    entreprise: {
      name: "CreativeHub SAS",
      siret: "98765432100015",
      since: "29/02/2024",
      address: "1 Avenue de la Réussite, 75001 Paris",
    },
    representant: {
      name: "Thomas Dubois",
      role: "Président",
      email: "thomas.dubois@creativehub.fr",
    },
    plan: {
      label: "Basic",
      color: "bg-blue-50 text-blue-400",
      price: "49€/mois",
    },
    statut: {
      value: "En attente",
      color: "bg-amber-100 text-amber-800",
      icon: <Clock className="w-4 h-4 inline mr-1" />,
    },
    docs: [
      { label: "2 docs", color: "bg-gray-100 text-gray-700" },
      { label: "1 en attente", color: "bg-amber-100 text-amber-800" },
      { label: "1 rejetés", color: "bg-red-100 text-red-700" },
    ],
    actions: ["view", "edit", "validate", "ban"],
    warnings: [
      {
        label: "Action requise",
        icon: <CircleAlert className="w-4 h-4 inline mr-1 text-amber-500" />,
      },
    ],
    id: 2,
  },
  {
    entreprise: {
      name: "Innovate EURL",
      siret: "45678912300019",
      since: "30/11/2023",
      address: "1 Avenue de la Réussite, 75001 Paris",
    },
    representant: {
      name: "Marie Laurent",
      role: "Gérant unique",
      email: "marie.laurent@innovate.fr",
    },
    plan: {
      label: "Basic",
      color: "bg-blue-50 text-blue-400",
      price: "49€/mois",
    },
    statut: {
      value: "Actif",
      color: "bg-green-100 text-green-700",
      icon: <CircleCheck className="w-4 h-4 inline mr-1" />,
    },
    docs: [{ label: "2 docs", color: "bg-gray-100 text-gray-700" }],
    actions: ["view", "ban"],
    warnings: [
      {
        label: "Action requise",
        icon: <CircleAlert className="w-4 h-4 inline mr-1 text-amber-500" />,
      },
    ],
    id: 3,
  },
];

type Formule = {
  id: number;
  name: string;
  monthlyPrice: string;
};

export default function DomiciliationPage() {
  const [search, setSearch] = useState("");
  const [domiciliations, setDomiciliations] = useState<Domiciliation[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<
    (typeof companiesData)[0] | null
  >(null);
  const [isActif, setisActif] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  // création
  const handleCreateDomiciliation = (form: DomiciliationStepperForm) => {
    const newDom: Domiciliation = {
      id: Date.now(),
      companyName: form.companyName,
      siret: form.siret,
      creationDate: form.creationDate,
      representative: {
        lastname: form.repLastname,
        firstname: form.repFirstname,
        email: form.repEmail,
        role: form.repRole,
      },
      plan: form.plan as Domiciliation["plan"],
      price: Number(form.price),
      documents: form.documents,
    };
    setDomiciliations((ds) => [...ds, newDom]);
    setDialogOpen(false);
  };

  const handleCreateFormule = (form: Omit<Formule, "id">) => {
    const newFormule: Formule = {
      id: Date.now(),
      name: form.name,
      monthlyPrice: form.monthlyPrice,
    };

    setDialogOpen(false);
  };

  // filtrer les entreprises par nom ou SIRET
  const filtered = companiesData.filter((c) => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return true;
    return (
      c.entreprise.name.toLowerCase().includes(searchValue) ||
      c.entreprise.siret.includes(searchValue)
    );
  });

  return (
    <div className="py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between sm:flex-row sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Domiciliations
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les contrats de domiciliation et les documents associés
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
          >
            <Plus className="w-5 h-5" /> Nouvelle Domiciliation
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPlanOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
          >
            <Plus className="w-5 h-5" /> Créer Formule
          </Button>
        </div>
      </div>
      {/* Statistiques Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 ">
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-green-100 p-2 h-10 rounded-lg text-green-600">
            <Building2 />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">
              Domiciliations actives
            </h2>
            <p className="text-xl font-medium text-gray-900">2</p>
          </div>
        </Card>
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-amber-100 p-2 h-10 rounded-lg text-amber-600">
            <Clock />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">
              En attente
            </h2>
            <p className="text-xl font-medium text-gray-900">1</p>
          </div>
        </Card>
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-purple-100 p-2 h-10 rounded-lg text-purple-600">
            <Euro />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">
              Revenus mensuels
            </h2>
            <p className="text-xl font-medium text-gray-900">148£</p>
          </div>
        </Card>
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-red-100 p-2 h-10 rounded-lg text-red-600">
            <TriangleAlert />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">
              Actions requises
            </h2>
            <p className="text-xl font-medium text-gray-900">3</p>
          </div>
        </Card>
      </div>
      {/* Tableau des détails */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* bar de recherche */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <div className="relative w-full">
              <Input
                className="pl-10"
                placeholder="Rechercher par nom d'entreprise ou SIRET..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex flex-row gap-2">
              <Select>
                <SelectTrigger className=" focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300">
                  <SelectValue placeholder="Tout les status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tout les status</SelectLabel>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="attente">En attente</SelectItem>
                    <SelectItem value="annulé">Annulé</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className=" focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300">
                  <SelectValue placeholder="Tout les plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tout les plans</SelectLabel>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Table */}
          <div className=" overflow-hidden border border-gray-100 last:border-0">
            <Table>
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">
                    ENTREPRISE
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    REPRÉSENTANT
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    PLAN
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    STATUT
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    DOCUMENTS
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c, idx) => (
                  <TableRow key={c.entreprise.name + idx}>
                    <TableCell className="align-top py-4">
                      <div className="font-medium">{c.entreprise.name}</div>
                      <div className="text-xs text-gray-400">
                        SIRET: {c.entreprise.siret}
                      </div>
                      <div className="text-xs text-gray-400">
                        Depuis le {c.entreprise.since}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="font-medium">{c.representant.name}</div>
                      <div className="text-xs text-gray-400">
                        {c.representant.role}
                      </div>
                      <div className="text-xs text-gray-400">
                        {c.representant.email}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <span
                        className={`${c.plan.color} font-medium px-3 py-1 rounded-full text-xs`}
                      >
                        {c.plan.label}
                      </span>
                      <div className="text-xs text-gray-400 mt-2">
                        {c.plan.price}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isActif
                            ? "bg-green-100 text-green-700"
                            : c.statut.color
                        } font-medium px-3 py-1 rounded-full text-xs`}
                      >
                        {isActif ? (
                          <CircleCheck className="w-4 h-4 inline mr-1" />
                        ) : (
                          c.statut.icon
                        )}
                        {isActif ? "Actif" : c.statut.value}
                      </span>
                      {c.warnings.length > 0 && (
                        <div className="mt-1 text-xs text-amber-700 flex items-center gap-1">
                          {c.warnings.map((w) => (
                            <span
                              key={w.label}
                              className="flex items-center gap-1 text-xs"
                            >
                              {w.icon}
                              {w.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="flex flex-wrap gap-2">
                        {c.docs.map((d) => (
                          <span
                            key={d.label}
                            className={`font-medium px-3 py-1 rounded-full text-xs ${d.color}`}
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="flex gap-3">
                        <Eye
                          className="text-indigo-700 hover:opacity-80 w-5 h-5 cursor-pointer"
                          onClick={() => {
                            setDialogData(c);
                            setViewOpen(true);
                          }}
                        />
                        {c.actions.includes("edit") && (
                          <Edit className="text-indigo-700 hover:opacity-80 w-5 h-5 cursor-pointer" />
                        )}
                        {c.actions.includes("validate") && (
                          <CheckCircle
                            className="text-green-500 hover:opacity-80 w-5 h-5 cursor-pointer"
                            onClick={() => setisActif(true)}
                          />
                        )}
                        <Ban className="text-red-500 hover:opacity-80 w-5 h-5 cursor-pointer" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-400 py-8"
                    >
                      Aucune entreprise trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
      <DomiciliationDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onCreate={handleCreateDomiciliation}
      />
      <ViewDomiciliationDialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setDialogData(null);
        }}
        domiciliation={dialogData}
      />
      <AddFormuleDialog
        open={planOpen}
        setOpen={setPlanOpen}
        onCreate={handleCreateFormule}
      />
    </div>
  );
}
