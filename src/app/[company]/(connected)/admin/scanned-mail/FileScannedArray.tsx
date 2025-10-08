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
import { ReceivedFile } from "@/src/lib/type";
import { formatDateFr } from "@/src/lib/customfunction";
import Link from "next/link";
import ScanButton from "@/src/components/global/ScanButton";
import { Badge } from "@/src/components/ui/badge";

export function FileScannedArray({
  data,
  scanFileUrl,
  viewAnalyzedFile,
}: {
  data: ReceivedFile[];
  scanFileUrl: (fileUrl: string, receivedFile: ReceivedFile) => void;
  viewAnalyzedFile: (receivedFile: ReceivedFile) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<ReceivedFile>[] = [
    {
      accessorKey: "status",
      header: ()=><div className="min-w-[100px] ">Status</div>,
      cell: ({ row }) => {
        const isScanned = row.getValue("status") === "scanned";
        return (
          <Badge
            variant="outline"
            className={`${isScanned ? "bg-green-500 text-white" : "bg-indigo-600 text-white"} text-center`}
          >
            {isScanned ? "Déjà scanné" : "Prêt à être scanné"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "file_url",
      header: "Fichier",
      cell: ({ row }) => {
        const filePath = row.original.file_url;
        const segments = filePath.split("/");
        const fileName = segments[segments.length - 1];
        return (
          <Button
            variant={"ghost"}
            className="bg-purple-500 text-white hover:bg-purple-600 hover:text-white"
            size={"sm"}
            asChild
          >
            <Link
              href={`${process.env.NEXT_PUBLIC_FILE_BASE_URL}${filePath}`}
              target="_blank"
            >
              Fichier
            </Link>
          </Button>
        );
      },
    },
    {
      accessorKey: "uploaded_at",
      header: "Date d‘upload",
      cell: ({ row }) => {
        return <div> {formatDateFr(new Date(row.original.uploaded_at))} </div>;
      },
    },
    {
      accessorKey: "received_from_name",
      header: () => (
        <div className="min-w-[180px] xl:min-w-fit ">Expéditeur</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.received_from_name ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "recipient_name",
      header: () => <div>Récepteur</div>,
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.recipient_name ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "recipient_email",
      header: () => <div>Adresse email</div>,
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.recipient_email ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "courriel_object",
      header: () => <div className="min-w-[180px] xl:min-w-fit ">Objet</div>,
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.courriel_object ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "is_sent",
      header: () => <div>Envoyé le</div>,
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.send_at
              ? formatDateFr(new Date(row.original.send_at))
              : "-"}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "id_basic_user",
    //   header: () => <div>Utilisateur lié à ce courrier</div>,
    //   cell: ({ row }) => {
    //     return (
    //       <div className="font-medium">
    //         {row.original.id_basic_user
    //           ? `${row.original.user_name} ${row.original.user_first_name}`
    //           : "-"}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "action",
      header: () => <div className="w-[140px]"></div>,
      cell: ({ row }) => {
        return (
          <>
            {row.original.status === "scanned" ? (
              <Button
                onClick={() => viewAnalyzedFile(row.original)}
                className="!rounded-full bg-cDefaultPrimary-100 text-white hover:text-white hover:bg-cDefaultPrimary-200 text-[12px]"
                variant={"ghost"}
              >
                Voir & envoyer
              </Button>
            ) : (
              <ScanButton
                onClickButton={() =>
                  scanFileUrl(row.original.file_url, row.original)
                }
              />
            )}
          </>
        );
      },
    },
    //   {
    //     id: "actions",
    //     enableHiding: false,
    //     cell: ({ row }) => {
    //       const payment = row.original;
    //       return (
    //         <DropdownMenu>
    //           <DropdownMenuTrigger asChild>
    //             <Button variant="ghost" className="h-8 w-8 p-0">
    //               <span className="sr-only">Open menu</span>
    //               <MoreHorizontal />
    //             </Button>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent align="end">
    //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //             <DropdownMenuSeparator />
    //             <DropdownMenuItem>Scanner le fichier</DropdownMenuItem>
    //             <DropdownMenuItem>Assiger à un utilisateur</DropdownMenuItem>
    //           </DropdownMenuContent>
    //         </DropdownMenu>
    //       );
    //     },
    //   },
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Rechercher un courrier..."
          value={
            (table.getColumn("courriel_object")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("courriel_object")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-md"
        />
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
                    <TableCell key={cell.id} className="xl:text-[13px] font-normal ">
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
    </div>
  );
}
