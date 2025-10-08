"use client";

import React, { useState } from "react";
import { MoreVertical, UserPlus, ToggleLeft, ToggleRight, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Centre, CentreFeatureKey } from "@/src/lib/type";
import { Input } from "@/src/components/ui/input";

const Workspacefeature: Record<string, string> = {
  reservation: "Réservation d’espaces",
  plan: "Plan des locaux",
};

const Domiciliationfeature : Record<string, string> = {
  domiciliation: "Domiciliation",
  mail: "Gestion du courrier",
  digicode: "Codes d’accès",
  scan: "Scan & numérisation du courrier",
  signature: "Signature électronique",
}

type AdminDialogState = {
  open: boolean;
  centreId: number | null;
};

export default function CentresList({
  centres,
  onAddAdmin,
  onToggleModule
}: {
  centres: Centre[];
  onAddAdmin?: (centreId: number, admin: { name: string; email: string; password: string }) => void;
  onToggleModule?: (centreId: number, moduleKey: CentreFeatureKey, value: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [adminDialog, setAdminDialog] = useState<AdminDialogState>({ open: false, centreId: null });
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleOpenAdminDialog = (centreId: number) => {
    setAdminDialog({ open: true, centreId });
    setAdminForm({ name: "", email: "", password: "" });
    setAdminError(null);
  };
  
  const handleAddAdmin = () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      setAdminError("Tous les champs sont requis.");
      return;
    }
    if (!adminDialog.centreId) return;
    onAddAdmin?.(adminDialog.centreId, adminForm);
    setAdminDialog({ open: false, centreId: null });
    setAdminForm({ name: "", email: "", password: "" });
    setAdminError(null);
  };

  const filtered = centres.filter((c) => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return true;
    return (
      c.name.toLowerCase().includes(searchValue)
    );
  });

  return (
    <>
    <div className="flex flex-col gap-2 mb-2 rounded-lg border border-gray-100 shadow-md bg-white p-3">
      <div className="relative w-full">
        <Input
          className="pl-10"
          placeholder="Rechercher par nom d'entreprise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      <div className="overflow-x-auto ">
        <Table>
          <TableHeader className="bg-indigo-50">
            <TableRow >
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Administrateur</TableHead>
              <TableHead>Modules Espaces</TableHead>
              <TableHead>Modules Domiciliation</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((centre) => (
              <TableRow key={centre.id}>
                <TableCell className="text-gray-700">{centre.name}</TableCell>
                <TableCell className="text-gray-700">{centre.address}</TableCell>
                <TableCell>
                  <span className="text-gray-700">{centre.admin.name}</span> <br />
                  <span className="text-xs text-gray-500">
                    {centre.admin.email}
                  </span>
                </TableCell>
                <TableCell>
                  <ul className="list-disc ml-4 text-gray-700">
                    {Object.entries(centre.features)
                      .filter(([k, v]) => v)
                      .map(([k]) => (
                        <li key={k}>{Workspacefeature[k]}</li>
                      ))}
                    {Object.values(centre.features).every((v) => !v) && (
                      <span className="text-gray-400">Aucun</span>
                    )}
                  </ul>
                </TableCell>
                <TableCell>
                  <ul className="list-disc ml-4 text-gray-700">
                    {Object.entries(centre.features)
                      .filter(([k, v]) => v)
                      .map(([k]) => (
                        <li key={k}>{Domiciliationfeature[k]}</li>
                      ))}
                    {Object.values(centre.features).every((v) => !v) && (
                      <span className="text-gray-400">Aucun</span>
                    )}
                  </ul>
                </TableCell>
                <TableCell className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleOpenAdminDialog(centre.id)}
                        className="gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Ajouter un administrateur
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Activer/Désactiver un module</DropdownMenuLabel>
                      {Object.entries(centre.features).map(([key, value]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() =>
                            onToggleModule &&
                            onToggleModule(
                              centre.id,
                              key as CentreFeatureKey,
                              !value
                            )
                          }
                          className="gap-2"
                        >
                          {value ? (
                            <ToggleRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                          {Workspacefeature[key as CentreFeatureKey]}{" "}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {value ? "Désactiver" : "Activer"}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    <Dialog open={adminDialog.open} onOpenChange={(open) => setAdminDialog((a) => ({ ...a, open }))}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-gray-800 font-medium">Ajouter un administrateur</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleAddAdmin();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <Input
            value={adminForm.name}
            onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input
            type="email"
            value={adminForm.email}
            onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <Input
            type="password"
            value={adminForm.password}
            onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        {adminError && (
          <div className="text-xs text-red-500">{adminError}</div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setAdminDialog({ open: false, centreId: null })}>
            Annuler
          </Button>
          <Button variant="ghost" className="bg-indigo-600 text-white" type="submit">
            Ajouter
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  </>
  );
}
