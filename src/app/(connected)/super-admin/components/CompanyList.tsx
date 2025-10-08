"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { AdminUser, Company } from "@/src/lib/type"
import { Badge } from "@/src/components/ui/badge"



export const columns: ColumnDef<Company>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Centre d‘affaire
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div className="uppercase">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "admin",
        header: "Administrateurs",
        cell: ({ row }) => (
            <div className="">
                {
                    row.original.adminUserList && row.original.adminUserList.map((adminUser, i) => (
                        <p key={i}>
                            <span>{adminUser.name.toUpperCase()}</span>
                            <span className="capitalize"> {adminUser.firstName.toLowerCase()}</span>
                        </p>
                    ))
                }
            </div>
        ),
    },
    {
        accessorKey: "coworkingReservation",
        header: "Fonctionnalités activées sur la réservation",
        cell: ({ row }) => (
            <div>
                {
                    row.original.reservationIsActive ?
                        <div className="flex flex-wrap gap-2">
                            {
                                row.original.digicodeIsActive ? <Badge variant="default" className="bg-indigo-600 cursor-default">Digicode</Badge> : ""
                            }
                            {
                                row.original.managePlanIsActive ? <Badge variant="default" className="bg-indigo-600 cursor-default">Gestion des locaux</Badge> : ""
                            }
                            {
                                row.original.electronicSignatureIsActive ? <Badge variant="default" className="bg-indigo-600 cursor-default">Signature électronique</Badge> : ""
                            }
                        </div> : <div></div>
                }

            </div>
        ),
    },
    {
        accessorKey: "virtualOfficeFeatures",
        header: "Fonctionnalités activées sur la domiciliation",
        cell: ({ row }) => (
            <div >
                {
                    row.original.virtualOfficeIsActive ?
                        <div className="flex flex-wrap gap-2">
                            {
                                row.original.mailScanningIsActive ? <Badge className="bg-indigo-600 cursor-default">Scan et numérisation du courrier</Badge> : ''
                            }
                            {
                                row.original.postMailManagementIsActive ? <Badge className="bg-indigo-600 cursor-default">Gestion du courrier</Badge> : ''
                            }
                        </div> : <div></div>
                }
            </div>
        ),
    },
    //   {
    //     id: "actions",
    //     enableHiding: false,
    //     cell: ({ row }) => {
    //       const payment = row.original

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
    //             <DropdownMenuItem
    //             >
    //               Copy payment ID
    //             </DropdownMenuItem>
    //             <DropdownMenuSeparator />
    //             <DropdownMenuItem>View customer</DropdownMenuItem>
    //             <DropdownMenuItem>View payment details</DropdownMenuItem>
    //           </DropdownMenuContent>
    //         </DropdownMenu>
    //       )
    //     },
    //   },
]

export default function CompanyList({ data }: { data: Company[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

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
    })

    return (
        <div className="w-full bg-white px-2 rounded-lg">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Rechercher un centre d‘affaire..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                />
                {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}
            </div>
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
                                    )
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
        </div>
    )
}
