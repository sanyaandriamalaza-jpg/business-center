"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  RefreshCw,
  Ban,
  ChevronDown,
  Filter,
  BadgePlus,
  CheckCircle,
  EllipsisVertical,
} from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { AccessCode } from "@/src/lib/type";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { ViewAccessCode } from "./ViewAccessCode";
import { ro } from "date-fns/locale";
import { AssignAccessCodeDialog } from "./AsignAccessCode";

async function refresh(id: number) {
  try {
    const response = await fetch(`/api/access-code/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "active" }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'activation du code.");
    }

    const updatedCode = await response.json();
    return updatedCode;
  } catch (error) {
    console.error("Erreur refresh:", error);
    return null;
  }
}

async function deactivate(id: number) {
  try {
    const response = await fetch(`/api/access-code/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "expired" }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la désactivation du code.");
    }

    const updatedCode = await response.json();
    return updatedCode;
  } catch (error) {
    console.error("Erreur deactivate:", error);
    return null;
  }
}

const columns: ColumnDef<AccessCode>[] = [
  {
    accessorKey: "code",
    header: "CODE",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-gray-600 text-xs">{row.original.code}</span>
      </div>
    ),
  },
  {
    accessorKey: "office",
    header: "ESPACE",
    cell: ({ row }) => (
      <span className="text-gray-900">
        {row.original.invoice?.office?.name ||
          row.original.office?.name ||
          "Non attribué"}
      </span>
    ),
  },
  {
    accessorKey: "user",
    header: "UTILISATEUR",
    cell: ({ row }) => (
      <span className="text-sm text-gray-900">
        {row.original.invoice?.user
          ? `${row.original.invoice.user.firstName} ${row.original.invoice.user.name}`
          : row.original.basicUser
            ? `${row.original.basicUser.firstName} ${row.original.basicUser.name}`
            : "Non attribué"}
      </span>
    ),
  },
  {
    accessorKey: "validity",
    header: "VALIDITÉ",
    cell: ({ row }) => {
      if (!row.original.invoice )
        return <div className="text-gray-400">N/A</div>;

      const startDate = new Date(row.original.invoice?.startSubscription);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 heures

      // Options de formatage de date
      const dateTimeOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      const startValidity = new Date(row.original.startValidity);
      const endValidity = new Date(row.original.endValidity);

      return (
        <div className="flex flex-col space-y-1">
          <div className="flex flex-col">
            <div>
              <span className="text-gray-900 text-sm font-semibold">
                {startDate.toLocaleDateString("fr-FR", dateTimeOptions) || startValidity.toLocaleDateString("fr-FR", dateTimeOptions)} 
              </span>
            </div>
            <div>
              <span className="text-gray-900 text-sm">
                Jusqu'au {endDate.toLocaleDateString("fr-FR", dateTimeOptions) || endValidity.toLocaleDateString("fr-FR", dateTimeOptions)}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUT",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColor =
        status === "active"
          ? "bg-green-100 text-green-800"
          : status === "expired"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800";

      return (
        <div>
          <span
            className={`${statusColor} font-medium px-3 py-1 rounded-full text-xs`}
          >
            {status}
          </span>
          {/* {status === "expired" && (
            <span className="text-gray-500 text-xs block mt-1">
              Dernière utilisation: {new Date().toLocaleString()}
            </span>
          )} */}
        </div>
      );
    },
  },
  {
    id: "actionsRapide",
    header: "ACTIONS RAPIDE",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <ViewAccessCode codeId={row.original.id} />
        {row.original.status !== "active" && (
          <Button
            variant="ghost"
            size="icon"
            title="Raffraichir"
            onClick={() => refresh(row.original.id)}
          >
            <CheckCircle className="text-indigo-600 hover:text-indigo-700 w-5 h-5 cursor-pointer" />
          </Button>
        )}

        {row.original.status === "active" && (
          <Button
            variant="ghost"
            size="icon"
            title="Désactiver"
            onClick={() => deactivate(row.original.id)}
          >
            <Ban className="text-red-600 hover:text-red-700 w-5 h-5 cursor-pointer" />
          </Button>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="flex items-center gap-3">
            <ViewAccessCode codeId={row.original.id} /> Voir les détails
          </DropdownMenuItem>
          <DropdownMenuItem>
            {row.original.status !== "active" && (
              <Button
                variant="ghost"
                size="icon"
                title="Raffraichir"
                onClick={() => refresh(row.original.id)}
              >
                <CheckCircle className="text-indigo-600 hover:text-indigo-700 w-5 h-5 cursor-pointer" />{" "}
                Activer le code
              </Button>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem>
            {row.original.status === "active" && (
              <Button
                variant="ghost"
                size="icon"
                title="Désactivé"
                onClick={() => deactivate(row.original.id)}
              >
                <Ban className="text-red-600 hover:text-red-700 w-5 h-5 cursor-pointer" />{" "}
                Desactiver le code
              </Button>
            )}
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            {!row.original.invoice?.user && (
              <div className="flex items-center gap-3">
                <AssignAccessCodeDialog
                  code={{
                    id: row.original.id,
                    code: row.original.code,
                    status: row.original.status,
                  }}
                />
                <span>Assigner le code</span>
              </div>
            )}
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function AccessCodesTable({
  accessCodes,
}: {
  accessCodes: AccessCode[];
}) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [validityFilter, setValidityFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<boolean | null>(null);

  useEffect(() => {
    const newFilters = [];

    if (validityFilter === "active") {
      newFilters.push({
        id: "status",
        value: "active",
      });
    } else if (validityFilter === "pending") {
      newFilters.push({
        id: "status",
        value: "pending",
      });
    } else if (validityFilter === "expired") {
      newFilters.push({
        id: "status",
        value: "expired",
      });
    }

    if (userFilter !== null) {
      newFilters.push({
        id: "invoice",
        value: userFilter ? "hasUser" : "noUser",
      });
    }

    setColumnFilters(newFilters);
  }, [validityFilter, userFilter]);

  const table = useReactTable({
    data: accessCodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      globalFilter: search,
      columnFilters,
    },
    onGlobalFilterChange: setSearch,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const filteredData = table.getFilteredRowModel().rows;

  // TODO : effacer l'info de paiement, durée : en fonction date et heure (non obli)
  // TODO: saisir le code, espace non obligatoire (modif schéma), statut actif par defaut si délais de validité actif
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 ">
          <div className="relative flex-1">
            <Input
              className="pl-10"
              placeholder="Rechercher un code d'accès..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtrer par validité</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setValidityFilter("active")}
                className={validityFilter === "active" ? "bg-gray-100" : ""}
              >
                Valides
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setValidityFilter("expired")}
                className={validityFilter === "expired" ? "bg-gray-100" : ""}
              >
                Expirés
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setValidityFilter(null)}
                className={!validityFilter ? "bg-gray-100" : ""}
              >
                Tous
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Filtrer par utilisateur</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setUserFilter(true)}
                className={userFilter === true ? "bg-gray-100" : ""}
              >
                Avec utilisateur
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setUserFilter(false)}
                className={userFilter === false ? "bg-gray-100" : ""}
              >
                Sans utilisateur
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setUserFilter(null)}
                className={userFilter === null ? "bg-gray-100" : ""}
              >
                Tous
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {validityFilter && (
            <span className="inline-flex items-center gap-1">
              Filtré par:
              <span className="font-medium">
                {validityFilter === "active"
                  ? "Status valides"
                  : "Statut expirés"}
              </span>
              <button
                onClick={() => setValidityFilter(null)}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </span>
          )}
          {userFilter !== null && (
            <span className="inline-flex items-center gap-1">
              Filtré par:
              <span className="font-medium">
                {userFilter ? "Avec utilisateur" : "Sans utilisateur"}
              </span>
              <button
                onClick={() => setUserFilter(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </span>
          )}
          {filteredData.length > 0 && (
            <span className="ml-auto">
              {filteredData.length} résultat{filteredData.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="overflow-hidden border border-gray-100 rounded-md">
          <Table>
            <TableHeader className="bg-indigo-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-medium text-gray-700"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-400 py-8"
                  >
                    {loading ? "Chargement..." : "Aucun code trouvé."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <button
            className="px-4 py-2 border rounded-md text-sm font-medium"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </button>
          <button
            className="px-4 py-2 border rounded-md text-sm font-medium"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </button>
        </div>
      </div>
    </Card>
  );
}
