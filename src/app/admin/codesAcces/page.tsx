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
import { Search, Eye, Ban, RefreshCw } from "lucide-react";
import { useState } from "react";

const codes = [
  {
    id: "123456",
    code: "CODE-001",
    espace: "Bureau Exécutif A",
    utilisateur: "Sophie Martin",
    validite: "25/03 09:00",
    fin: "jusqu'à 12:00",
    statut: "Actif",
  },
  {
    id: "789012",
    code: "CODE-002",
    espace: "Salle de Conférence B",
    utilisateur: "Thomas Dubois",
    validite: "25/03 09:00",
    fin: "jusqu'à 12:00",
    statut: "Expiré",
  },
  {
    id: "345678",
    code: "CODE-003",
    espace: "ESpace Coworking C",
    utilisateur: "Sophie Martin",
    validite: "24/03 08:00",
    fin: "jusqu'à 12:00",
    statut: "Revoqué",
  },
];

const typeColor = (statut: string) => {
  switch (statut) {
    case "Actif":
      return "bg-green-100 text-green-600";
    case "Expiré":
      return "bg-gray-100 text-gray-900";
    case "Revoqué":
      return "bg-red-50 text-red-700";
    default:
      return "bg-green-100 ";
  }
};

export default function CodePage() {
  const [search, setSearch] = useState("");
  const filteredCodes = codes.filter((e) =>
    e.utilisateur.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-6 px-4">
      <div className="flex md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Codes d'Accès
        </h1>
      </div>
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full ">
            <Input
              className="pl-10"
              placeholder="Rechercher un code d'accès..."
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
                    CODE
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    ESPACE
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    UTILISATEUR
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    VALIDITE
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
                {filteredCodes.map((e, idx) => (
                  <TableRow key={e.id + idx}>
                    <TableCell className="flex flex-col">
                      <span className="text-gray-900 text-sm mb-0.5">
                        {e.id}
                      </span>
                      <span className="text-gray-600 text-xs">{e.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900 ">{e.espace}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {e.utilisateur}
                    </TableCell>
                    <TableCell className="flex flex-col mb-0.5">
                      <span className="text-gray-900">{e.validite}</span>
                      <span className="text-gray-600 text-xs">{e.fin}</span>
                    </TableCell>
                    <TableCell >
                      <span
                        className={
                          typeColor(e.statut) +
                          " font-medium px-3 py-1 rounded-full text-xs mb-2"
                        }
                      >
                        {e.statut}
                      </span>
                      <br/>
                      {e.statut === "Expiré" && (
                        <span className="text-gray-500 text-xs">
                          Dernière utilisation: 24/03/2024 14:05:00
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3">
                        <Eye className="text-indigo-700 hover:text-indigo-800 w-5 h-5 cursor-pointer" />
                        {e.statut === "Actif" && (<>
                            <RefreshCw className="text-indigo-600 hover:text-indigo-700 w-5 h-5 cursor-pointer" />
                            <Ban className="text-red-600 hover:text-red-700 w-5 h-5 cursor-pointer" />
                        </>)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCodes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-400 py-8"
                    >
                      Aucun code trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
