"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import { Button } from "@/src/components/ui/button";
import { Search, Edit, Trash2, Send, UserPlus } from "lucide-react";
import { baseUrl } from "@/src/lib/utils";
import { AdminUser, BasicUser } from "@/src/lib/type";
import { UserEditDialog } from "../components/forms/UserEditDialog";
import { UserDeleteDialog } from "../components/forms/UserDeleteDialog";
import UserDialog from "../components/forms/UserDialog";
import { useAdminStore } from "@/src/store/useAdminStore";
import { Session } from "next-auth";
import PartialLoading from "@/src/components/global/PartialLoading";
import Link from "next/link";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import SendMailForm from "./send-mail/SendMailForm";

interface ApiResponse {
  success: boolean;
  count: number;
  admin: AdminUser;
  data: BasicUser[];
}

interface AllUsers extends BasicUser {
  isAdmin?: boolean;
  sub_role_label?: string;
}

export function UsersWrapper({ session }: { session: Session }) {
  const [data, setData] = useState<AllUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingUser, setEditingUser] = useState<AllUsers | null>(null);
  const [deletingUser, setDeletingUser] = useState<AllUsers | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const columns: ColumnDef<AllUsers>[] = [
    {
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>, // +1 pour commencer à 1
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Tout selectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner une ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user",
      header: "UTILISATEUR",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {user.firstName} {user.name}
              </span>
              {user.phone && (
                <span className="text-xs text-muted-foreground">
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "EMAIL",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "RÔLE",
      cell: ({ row }) => {
        const isAdmin = row.original.isAdmin;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              isAdmin
                ? row.original.sub_role_label === "admin"
                  ? "bg-rose-100 text-rose-500"
                  : "bg-lime-100 text-lime-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isAdmin
              ? (row.original.sub_role_label ?? "Administrateur")
              : "Utilisateur"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">ACTIONS</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => handleEditUser(user)}
              variant="ghost"
              size="icon"
              className="size-8 text-indigo-600 hover:text-indigo-800 w-5 h-5 cursor-pointer"
            >
              <Edit />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-green-600 hover:text-green-800 w-5 h-5 cursor-pointer"
              asChild
            >
              <Link
                href={`/${session.user.companySlug}/admin/users/send-mail?user_id=${user.id}&is_admin=${user.isAdmin}`}
              >
                <Send />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  const handleEditUser = (user: BasicUser) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: BasicUser) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    const companyId = session.user.companyId;
    fetchUsers(companyId);
  }, [session]);

  const fetchUsers = async (idCompany: number) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/user/basic-user?id_company=${idCompany}`
      );
      const result: ApiResponse = await response.json();

      const adminRes = await fetch(`/api/user/admin?id_company=${idCompany}`);
      const adminResult = await adminRes.json();

      if (result.success && adminResult.success) {
        const adminList: AdminUser[] = adminResult.data;
        const adminWithFlag: AllUsers[] = adminList.map((admin) => {
          return {
            ...admin,
            isAdmin: true,
            sub_role_label: admin.sub_role_label,
          };
        });

        const allUsers = [...adminWithFlag, ...result.data];
        setData(allUsers);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditDialogOpen) {
      setEditingUser(null);
    }
  }, [isEditDialogOpen]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return <PartialLoading />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Utilisateurs
        </h1>
        <Button
          variant="ghost"
          className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
          onClick={() => setIsUserDialogOpen(true)}
        >
          <UserPlus className="w-5 h-5" /> Nouvel Utilisateur
        </Button>
      </div>
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 w-full">
              <div className="relative w-full flex-1 max-w-md">
                <Input
                  className="pl-10"
                  placeholder="Rechercher un utilisateur..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {table.getFilteredSelectedRowModel().rows.length > 1 &&
                (() => {
                  const userEmailList = table
                    .getFilteredSelectedRowModel()
                    .rows.map((row) => row.original.email);

                  return (
                    <div>
                      <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant={"ghost"}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white hover:text-white"
                          >
                            Envoyer un message à ces utilisateurs
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Envoyer un email à ces personnes
                            </DialogTitle>
                            <DialogDescription className="flex flex-wrap gap-1">
                              {userEmailList.map((email, i) => (
                                <div
                                  key={i}
                                  className="bg-gray-100 px-2 py-0.5 rounded-md "
                                >
                                  {email}
                                </div>
                              ))}
                            </DialogDescription>
                            <div>
                              <SendMailForm
                                user={userEmailList}
                                onComplete={() => setIsOpen(false)}
                              />
                            </div>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                })()}
            </div>

            <div className="text-sm text-muted-foreground min-w-fit">
              {table.getFilteredRowModel().rows.length} utilisateur(s) trouvé(s)
            </div>
          </div>

          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
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
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="text-muted-foreground flex-1 text-sm w-[250px] ">
                {table.getFilteredSelectedRowModel().rows.length} sur{" "}
                {table.getFilteredRowModel().rows.length} lignes sélectionnées
              </div>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Précédent
                  </Button>
                </PaginationItem>

                {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
                  (pageIndex) => (
                    <PaginationItem key={pageIndex}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          table.setPageIndex(pageIndex);
                        }}
                        isActive={
                          table.getState().pagination.pageIndex === pageIndex
                        }
                      >
                        {pageIndex + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Suivant
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-sm text-muted-foreground flex items-center w-[110px]  ">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>
          </div>
        </div>

        <UserDialog
          open={isUserDialogOpen}
          setOpen={setIsUserDialogOpen}
          reloadData={() => {
            const companyId = session.user.companyId;
            fetchUsers(companyId);
          }}
        />

        {editingUser && (
          <UserEditDialog
            user={editingUser}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}

        {deletingUser && (
          <UserDeleteDialog
            user={deletingUser}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
        )}
      </Card>
    </>
  );
}
