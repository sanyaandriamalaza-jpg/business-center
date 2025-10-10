"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Ban,
  CheckCircle,
  ChevronDown,
  CircleCheck,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Search,
  Signature,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/src/components/ui/select";
import { VirtualOfficeData } from "@/src/lib/type";
import { ViewDomiciliationDialog } from "../components/forms/ViewDomiciliationDialog";
import { toast } from "@/src/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CsvButtonDomiciliation } from "@/src/components/global/CsvButtonDomiciliation";

interface DataTableProps {
  data: VirtualOfficeData[];
  onReloadData: () => void;
}

export default function VirtualOfficeLists({
  data,
  onReloadData,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [viewOpen, setViewOpen] = React.useState(false);
  const [dialogData, setDialogData] = React.useState<VirtualOfficeData | null>(
    null
  );

  const [dialogDataKey, setDialogDataKey] = React.useState<number>(0);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);

  const router = useRouter();

  React.useEffect(() => {
    if (dialogData) {
      const updated = data.find((d) => d.id === dialogData.id);
      if (updated) setDialogData(updated);
    }
  }, [data, dialogData]);

  const columns: ColumnDef<VirtualOfficeData>[] = [
    {
      accessorKey: "entreprise",
      header: "ENTREPRISE",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <div className="font-semibold text-neutral-600">
              {c.company.companyName || "Pas encore attribué"}{" "}
              {c.company.legalForm}
            </div>
            <div className="text-xs text-gray-400">
              SIRET: {c.company.siret}
            </div>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const entreprise = row.getValue(columnId) as any;
        const name = entreprise.name.toLowerCase();
        const siret = entreprise.siret.toLowerCase();
        const searchTerm = filterValue.toLowerCase();

        return name.includes(searchTerm) || siret.includes(searchTerm);
      },
    },
    {
      accessorKey: "representant",
      header: "SOUMIS PAR",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <div className="flex font-semibold text-neutral-600 gap-1">
              <span>{c.user.name}</span>
              <span>{c.user.firstName}</span>
            </div>
            <div className="text-xs text-gray-600">{c.user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "plan",
      header: "PLAN",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <span
              className={`${c.virtualOfficeOffer.offerName === "Premium" ? "bg-[#982afa]" : c.virtualOfficeOffer.offerName === "Basic" ? "bg-[#10B981]" : "bg-[#F59E0B]"} text-white font-medium px-3 py-1 rounded-full text-xs`}
            >
              {c.virtualOfficeOffer.offerName}
            </span>
            <div className="text-xs text-gray-400 mt-2">{c.amount}€/mois</div>
          </div>
        );
      },
      accessorFn: (row) => row.virtualOfficeOffer.offerName,
    },
    {
      accessorKey: "statut",
      header: "STATUT",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <>
            {c.status === "confirmed" ? (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                <CircleCheck className="w-3.5 h-3.5" />
                Actif
              </span>
            ) : c.status === "pending" ? (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                En attente
              </span>
            ) : c.status === "canceled" ? (
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                <Ban className="w-3.5 h-3.5" />
                Archiver
              </span>
            ) : null}
          </>
        );
      },
      accessorFn: (row) => row.status,
    },
    {
      accessorKey: "clientDocs",
      header: "DOCUMENTS DU CLIENT",
      cell: ({ row }) => {
        const c = row.original;

        return (
          <div>
            <div className="flex flex-wrap text-xs gap-1 mb-2">
              <span className="font-medium bg-gray-100 py-1 px-2 rounded-full">
                {c.userFiles.total} docs
              </span>
              {c.userFiles.stats.validated !== 0 && (
                <span className="text-emerald-700 bg-emerald-100 py-1 px-2 rounded-full">
                  {c.userFiles.stats.validated} validé(s)
                </span>
              )}
              {c.userFiles.stats.rejected !== 0 && (
                <span className="text-red-700 bg-red-100 py-1 px-2 rounded-full">
                  {c.userFiles.stats.rejected} rejeté(s)
                </span>
              )}
              {c.userFiles.stats.pending !== 0 && (
                <span className="text-amber-700 bg-amber-100 py-1 px-2 rounded-full">
                  {c.userFiles.stats.pending} en attente
                </span>
              )}
            </div>
            {c.userFiles.stats.validated === 4 && !c.contractFiles && (
              <span className="text-neutral-700 text-xs">
                En attende de contrat
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "docs",
      header: "DOCUMENTS A SIGNER",
      cell: ({ row }) => {
        const c = row.original;

        return (
          <div className="flex text-xs gap-1">
            <span className="text-amber-700 bg-amber-100 py-1 px-2 rounded-full">
              {
                c.contractFiles?.filter(
                  (file: any) =>
                    file.isContractSignedByUser === true &&
                    file.isContractSignedByAdmin === false
                ).length
              }{" "}
              en attente(s) de signature
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">ACTIONS</div>,
      meta: {
        className: "w-[100px] text-center",
      },
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-center items-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 mx-auto">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    setDialogData(c);
                    setViewOpen(true);
                    setUserId(String(c.user.userId));
                    setDialogDataKey(Date.now());
                  }}
                  asChild
                >
                  <Link href={`#domiciliationViewer`}>
                    <Eye className="text-indigo-700 hover:opacity-80 w-5 h-5 cursor-pointer" />
                    Voir
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {c.status !== "confirmed" && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() =>
                      handleUpdate(String(c.id), { status: "confirmed" })
                    }
                  >
                    <CheckCircle className="text-green-500 hover:opacity-80 w-5 h-5 cursor-pointer" />{" "}
                    Activer
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() =>
                    handleUpdate(String(c.id), { status: "canceled" })
                  }
                >
                  <Ban className="text-red-500 hover:opacity-80 w-5 h-5 cursor-pointer" />
                  Archiver
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const handleUpdate = async (
    id: string,
    options: { status?: "canceled" | "confirmed" }
  ) => {
    try {
      const queryParams = new URLSearchParams();

      if (options.status) {
        queryParams.append("status", options.status);
      }

      const res = await fetch(
        `/api/invoice/single/${id}/update-reservation?${queryParams.toString()}`,
        {
          method: "PATCH",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description:
            "Une erreur lors de la mis à jour de la statut de domiciliation.",
          variant: "destructive",
        });
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      setTimeout(() => {
        router.refresh();
      }, 500);

      toast({
        title: "Succès",
        description:
          "La statut de la domiciliation est mis à jour avec succès.",
      });

      return { success: true, message: data.message };
    } catch (error: any) {
      console.error("Erreur handleUpdate:", error);
      toast({
        title: "Error",
        description:
          "Une erreur lors de la mis à jour de la statut de domiciliation.",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    }
  };

  return (
    <>
      <div className="w-full bg-white rounded-xl">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <div className="relative w-full">
              <Input
                className="pl-10"
                placeholder="Rechercher par nom d'entreprise ou SIRET..."
                value={
                  (table.getColumn("entreprise")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(e) => {
                  table.getColumn("entreprise")?.setFilterValue(e.target.value);
                }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="flex flex-row gap-2">
              <Select
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("statut")?.setFilterValue(undefined);
                  } else {
                    table.getColumn("statut")?.setFilterValue(value);
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Statuts</SelectLabel>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="confirmed">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="canceled">Annulé</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {/* TODO : CHANGER DYNAMIQUEMENT LES PLANS */}
              <Select
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("plan")?.setFilterValue(undefined);
                  } else {
                    table.getColumn("plan")?.setFilterValue(value);
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Plans</SelectLabel>
                    <SelectItem value="all">Tous les plans</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <CsvButtonDomiciliation domiciliations={data} />
            </div>
          </div>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
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
                      className="h-24 text-center"
                    >
                      Aucun domiciliation trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div id="domiciliationViewer">
        <ViewDomiciliationDialog
          key={dialogDataKey}
          open={viewOpen}
          onOpenChange={(open) => {
            setViewOpen(open);
            if (!open) setDialogData(null);
          }}
          domiciliation={dialogData}
          userId={userId as string}
          onReloadData={onReloadData}
        />
      </div>
    </>
  );
}
