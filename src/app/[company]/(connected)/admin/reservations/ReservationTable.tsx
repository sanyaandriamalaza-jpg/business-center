"use client";

import { Invoice } from "@/src/lib/type";
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
  CircleCheckBig,
  CircleSmall,
  Dot,
  MoreHorizontal,
  OctagonAlert,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { capitalizeWords } from "@/src/lib/customfunction";
import { addDays, addHours, format } from "date-fns";
import { Eye, X } from "lucide-react";
import { fr } from "date-fns/locale";
import { cn } from "@/src/lib/utils";
import {
  SubscriptionStatus,
  SubscriptionStatusBadge,
} from "../components/SubscriptionStatusBadge";
import FormatCoworkingOfferStatus from "../components/FormatCoworkingOfferStatus";
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
import { useState } from "react";
import { useToast } from "@/src/hooks/use-toast";
import Link from "next/link";

export function ReservationTable({
  invoices,
  reloadData,
}: {
  invoices: Invoice[];
  reloadData: () => void;
}) {
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [reservationToUpdate, setReservationToUpdate] = useState<Invoice>();

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorFn: (row) =>
        `${row.reference}${row.referenceNum} ${row.user.name} ${row.user.firstName}`,
      id: "searchable",
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorFn: (row) => `${row.reference}${row.referenceNum}`,
      id: "referenceCombined",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-translate-x-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID RÉSERVATION
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex gap-3 items-center">
          {row.original.reference}
          {row.original.referenceNum}
          {!row.original.isProcessed && (
            <div
              className={cn(
                "bg-green-500 text-white shadow-none drop-shadow-none text-[0.65rem] px-[8px] py-[1px] rounded-md flex items-center justify-center font-[500] "
              )}
            >
              NEW
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "CLIENT",
      cell: ({ row }) => {
        const fullName = `${row.original.user.name.toUpperCase()} ${capitalizeWords(row.original.user.firstName)}`;
        return <div>{fullName}</div>;
      },
    },
    {
      accessorKey: "space",
      header: "ESPACE",
      cell: ({ row }) => (
        <div> {row.original.office && row.original.office.name} </div>
      ),
    },
    {
      accessorKey: "note",
      header: "Message",
      cell: ({ row }) => (
        <div className="whitespace-pre-line"> {row.original.note} </div>
      ),
    },
    {
      accessorKey: "date",
      header: "DATE",
      cell: ({ row }) => {
        const start = row.original.startSubscription;
        const duration = row.original.duration;
        const type = row.original.durationType;

        if (!start) return <div>—</div>;

        const formattedDate = format(start, "dd/MM/yyyy", { locale: fr });

        if (type === "hourly") {
          const end = addHours(start, duration);
          const formattedStartTime = format(start, "HH:mm", { locale: fr });
          const formattedEndTime = format(end, "HH:mm", { locale: fr });

          return (
            <div className="flex flex-col">
              <span>{formattedDate}</span>
              <span className="text-sm text-gray-500">
                {formattedStartTime} - {formattedEndTime}
              </span>
            </div>
          );
        }

        const endDate = addDays(start, duration);
        const formattedEndDate = format(endDate, "dd/MM/yyyy", { locale: fr });

        return (
          <div>
            {formattedDate} - {formattedEndDate}
          </div>
        );
      },
    },
    {
      accessorKey: "space",
      header: "OFFRE",
      cell: ({ row }) => (
        <div>
          {row.original.office?.coworkingOffer && (
            <FormatCoworkingOfferStatus
              type={row.original.office?.coworkingOffer?.type}
            />
          )}
        </div>
      ),
    },
    {
      accessorKey: "durationType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-translate-x-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            LOCATION
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <Badge
            variant="outline"
            className={cn(
              row.original.durationType === "hourly"
                ? "bg-blue-500"
                : "bg-orange-600",
              "text-white"
            )}
          >
            {row.original.durationType === "hourly" ? "Horaire" : "Journalier"}
          </Badge>
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUT",
      cell: ({ row }) => (
        <div>
          <SubscriptionStatusBadge status={row.original.subscriptionStatus} />
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {row.original.isProcessed ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setIsProcessed(row.original.id, false);
                }}
              >
                Marqué comme non traité
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setIsProcessed(row.original.id, true);
                }}
              >
                Marqué comme traité
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="cursor-pointer">
              <Link href={`/admin/reservations/${row.original.id}`}>
                Voir les détails
              </Link>
            </DropdownMenuItem>
            {row.original.subscriptionStatus === "confirmed" ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setReservationToUpdate(row.original);
                  setOpenAlertDialog(true);
                }}
              >
                Annuler la réservation
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setReservationToUpdate(row.original);
                  setOpenAlertDialog(true);
                }}
              >
                Confirmer la réservation
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
    data: invoices,
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

  const setIsProcessed = async (invoiceId: number, isProcessed: boolean) => {
    try {
      const res = await fetch(
        `/api/invoice/single/${invoiceId}/update-reservation?isProcessed=${isProcessed}`,
        {
          method: "PATCH",
        }
      );
      const data = await res.json();
      toast({
        title: data.success ? "Succès" : "Erreur",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
      reloadData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l‘opération",
        variant: "destructive",
      });
    }
  };
  const updateReservation = async (subscriptionStatus: SubscriptionStatus) => {
    if (reservationToUpdate) {
      try {
        const res = await fetch(
          `/api/invoice/single/${reservationToUpdate.id}/update-reservation?status=${subscriptionStatus}`,
          {
            method: "PATCH",
          }
        );
        const data = await res.json();
        toast({
          title: data.success ? "Succès" : "Erreur",
          description: data.message,
          variant: data.success ? "success" : "destructive",
        });
        reloadData();
      } catch (error) {
        console.error(error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l‘opération",
          variant: "destructive",
        });
      }
    } else {
      setReservationToUpdate(undefined);
      setOpenAlertDialog(false);
    }
  };
  return (
    <>
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
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reservationToUpdate &&
              reservationToUpdate.subscriptionStatus === "confirmed"
                ? "Souhaitez-vous vraiment annuler cette réservation ?"
                : "Souhaitez-vous vraiment confirmer cette réservation ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reservationToUpdate &&
              reservationToUpdate.subscriptionStatus === "confirmed"
                ? "En annulant cette réservation, la période réservée par votre client redeviendra disponible."
                : "En confirmant cette réservation, la période choisie sur cette réservation sera indisponible pour les autres utilisateurs."}
              {reservationToUpdate &&
                reservationToUpdate.subscriptionStatus === "confirmed" && (
                  <div className="flex gap-2 items-start text-red-500 pt-2">
                    <div className="mt-[2px]">
                      <OctagonAlert size={20} />
                    </div>
                    <div>
                      Aucun remboursement automatique ne sera effectué. Toute
                      demande de remboursement devra être traitée manuellement.
                    </div>
                  </div>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setReservationToUpdate(undefined);
                setOpenAlertDialog(false);
              }}
            >
              Fermer
            </AlertDialogCancel>
            {reservationToUpdate &&
            reservationToUpdate.subscriptionStatus === "confirmed" ? (
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  updateReservation("canceled");
                  if (reservationToUpdate) {
                    setIsProcessed(reservationToUpdate.id, true);
                  }
                }}
              >
                Annuler la réservation
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                className="bg-green-700 hover:bg-green-700/80"
                onClick={() => {
                  updateReservation("confirmed");
                  if (reservationToUpdate) {
                    setIsProcessed(reservationToUpdate.id, true);
                  }
                }}
              >
                Confirmer la réservation
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
