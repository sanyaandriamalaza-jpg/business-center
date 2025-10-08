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
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
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
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Office } from "@/src/lib/type";
import { Badge } from "@/src/components/ui/badge";
import {
  capitalizeFirstLetter,
  getCoworkingOfferColor,
  translateCoworkingOfferType,
} from "@/src/lib/customfunction";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminStore } from "@/src/store/useAdminStore";

export default function AdminOfficeListArray({
  data,
  deleteOffice,
}: {
  data: Office[];
  deleteOffice: (officeId: number) => void;
}) {
  const adminCompany = useAdminStore((state) => state.adminCompany);

  const router = useRouter();
  const columns: ColumnDef<Office>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-[100px] aspect-video rounded overflow-hidden flex items-center ">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${row.original.imageUrl}`}
            alt={row.original.name}
            width={100}
            height={100}
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="">{capitalizeFirstLetter(row.getValue("name"))}</div>
      ),
    },
    {
      accessorFn: (row) => row.coworkingOffer?.type,
      id: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="">
          {row.original.coworkingOffer?.type ? (
            <Badge
              variant="outline"
              className="text-white shadow-none"
              style={{
                backgroundColor: `${getCoworkingOfferColor(
                  row.original.coworkingOffer?.type
                )}`,
              }}
            >
              {translateCoworkingOfferType(row.original.coworkingOffer?.type)}
            </Badge>
          ) : (
            ""
          )}
        </div>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacité",
      cell: ({ row }) => (
        <div>
          {row.original.maxSeatCapacity} personne
          {row.original.maxSeatCapacity > 1 ? "s" : ""}{" "}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div>Prix</div>,
      cell: ({ row }) => {
        const hourlyRate = row.original.coworkingOffer?.hourlyRate;
        const dailyRate = row.original.coworkingOffer?.dailyRate;

        const formattedHourlyAmount = hourlyRate
          ? new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(hourlyRate)
          : undefined;

        const formattedDailyAmount = dailyRate
          ? new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(dailyRate)
          : undefined;

        return (
          <div>
            {formattedHourlyAmount && (
              <div className="text-gray-600">
                {formattedHourlyAmount} / heure
              </div>
            )}
            {formattedDailyAmount && (
              <div className="text-gray-600">{formattedDailyAmount} / jour</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        //TODO: rendre dynamique le statut du bureau
        <Badge
          variant="outline"
          className="bg-green-600 text-white shadow-none"
        >
          Actif
        </Badge>
      ),
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-3">
          <Edit
            onClick={() => {
              router.push(
                `/${adminCompany?.slug}/admin/spaces/office?mode=edit&office-id=${row.original.id}`
              );
            }}
            className="text-indigo-600 hover:text-indigo-700 w-5 h-5 cursor-pointer"
          />
          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2 className="text-red-600 hover:text-red-700 w-5 h-5 cursor-pointer" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce bureau?</AlertDialogTitle>
                <AlertDialogDescription>
                  Etes-vous certain de vouloir supprimer ce bureau ? Cette
                  action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    deleteOffice(row.original.id);
                  }}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full bg-white px-4 rounded-md">
      <div className="flex items-center py-4">
        <Input
          placeholder="Rechercher un espace..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  let minWidth = "";
                  switch (header.id) {
                    case "name":
                      minWidth = "min-w-[180px]";
                      break;
                    case "type":
                      minWidth = "min-w-[160px]";
                      break;
                    case "capacity":
                      minWidth = "min-w-[140px]";
                      break;
                    case "amount":
                      minWidth = "min-w-[180px]";
                      break;

                    default:
                      minWidth = "min-w-[100px]";
                      break;
                  }
                  return (
                    <TableHead key={header.id} className={`${minWidth}`}>
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
                  No results.
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
  );
}
