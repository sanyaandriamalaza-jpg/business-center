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
import { Funnel, Search, Eye, X } from "lucide-react";
import { useState } from "react";

const reservations = [
  {
    id: "RES-001",
    client: "John Doe",
    email: "john@example.com",
    espace: "Bureau Exécutif A",
    date: "20/03/2024",
    heure: "10:00:00 - 12:00:00",
    statut: "Confirmé",
  },
  {
    id: "RES-002",
    client: "John Doe",
    email: "john@example.com",
    espace: "Bureau Exécutif A",
    date: "20/03/2024",
    heure: "10:00:00 - 12:00:00",
    statut: "En attente",
  },
  {
    id: "RES-003",
    client: "John Doe",
    email: "john@example.com",
    espace: "Bureau Exécutif A",
    date: "20/03/2024",
    heure: "10:00:00 - 12:00:00",
    statut: "Annulé",
  },
];

const typeColor = (statut: string) => {
  switch (statut) {
    case "Confirmé":
      return "bg-green-100 text-green-600";
    case "En attente":
      return "bg-amber-100 text-amber-600";
    case "Annulé":
      return "bg-red-100 text-red-600";
    default:
      return "bg-green-100 ";
  }
};

export default function ReservationPage() {
  const [search, setSearch] = useState("");
  const filteredReservation = reservations.filter((e) =>
    e.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Réservations
        </h1>
        <Button
          variant="ghost"
          className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
        >
          <Funnel className="w-5 h-5" /> Filtrer
        </Button>
      </div>
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full ">
            <Input
              className="pl-10"
              placeholder="Rechercher une reservation..."
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
                    ID RESERVATIONS
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    CLIENT
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    ESPACE
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    DATE
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
                {filteredReservation.map((e, idx) => (
                  <TableRow key={e.id + idx}>
                    <TableCell>
                      <span className="text-gray-900 text-sm">{e.id}</span>
                    </TableCell>
                    <TableCell className="flex flex-col">
                      <span className="text-gray-900 mb-0.5">{e.client}</span>
                      <span className="text-gray-600 text-xs">{e.email}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {e.espace}
                    </TableCell>
                    <TableCell className="flex flex-col mb-0.5">
                      <span className="text-gray-900">{e.date}</span>
                      <span className="text-gray-600 text-xs">{e.heure}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          typeColor(e.statut) +
                          " font-medium px-3 py-1 rounded-full text-xs"
                        }
                      >
                        {e.statut}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3">
                        <Eye className="text-indigo-600 hover:text-indigo-700 w-5 h-5 cursor-pointer" />
                        <X className="text-red-600 hover:text-red-700 w-5 h-5 cursor-pointer" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReservation.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-400 py-8"
                    >
                      Aucun reservation trouvé.
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
