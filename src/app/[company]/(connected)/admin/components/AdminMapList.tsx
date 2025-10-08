"use client";

import { KonvaMap } from "@/src/lib/type";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { useToast } from "@/src/hooks/use-toast";
import { useAdminStore } from "@/src/store/useAdminStore";
import Link from "next/link";

export default function AdminMapList({
  mapList,
  reloadData,
}: {
  mapList: KonvaMap[];
  reloadData?: () => void;
}) {
  const [deleteDialogVisible, setDeleteDialogVisible] =
    React.useState<boolean>(false);
  const [mapIdToDelete, setMapIdToDelete] = React.useState<number>();

  const adminCompany = useAdminStore((state) => state.adminCompany);

  const columns: ColumnDef<KonvaMap>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Date de création",
      cell: ({ row }) => {
        const formattedDate = new Date(
          row.original.createdAt
        ).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        return <div>{formattedDate}</div>;
      },
    },
    {
      accessorKey: "office",
      header: "Bureau associé",
      cell: ({ row }) => {
        const shapesList = row.original.map.shapes;
        const officeList: string[] = shapesList
          .map((shape) => {
            if (
              (shape.type === "polygon" ||
                shape.type === "triangle" ||
                shape.type === "rectangle" ||
                shape.type === "circle") &&
              shape.spaceAssociated &&
              shape.spaceAssociated.isOffice &&
              shape.spaceAssociated.office?.id
            ) {
              return shape.spaceAssociated.office.name;
            }
            return null;
          })
          .filter(Boolean) as string[];
        return (
          <div className="flex gap-2">
            {officeList.map((office, i) => (
              <div
                key={i}
                className="px-3 py-1 rounded-md bg-gray-50 border border-gray-200"
              >
                {office}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link
                  href={`/${adminCompany?.slug}/admin/interactive-map?mode=view&id=${row.original.id}`}
                >
                  Voir la carte
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setMapIdToDelete(row.original.id);
                  setDeleteDialogVisible(true);
                }}
              >
                Supprimer la carte
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data: mapList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const { toast } = useToast();

  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const deleteMap = async (mapId: number) => {
    try {
      setIsGeneralLoadingVisible(true);
      const res = await fetch(`/api/konva-map/${mapId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      toast({
        title: data.success ? "Succès" : "Erreur",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneralLoadingVisible(false);
      if (reloadData) {
        reloadData();
      }
    }
  };
  return (
    <div className="w-full bg-white p-4 rounded-md">
      <div className="rounded-md border">
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
                  Aucun résultat.
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
      <AlertDialog
        open={deleteDialogVisible}
        onOpenChange={setDeleteDialogVisible}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la carte</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous certain de vouloir supprimer cette carte ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMapIdToDelete(undefined)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (mapIdToDelete) {
                  deleteMap(mapIdToDelete);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
