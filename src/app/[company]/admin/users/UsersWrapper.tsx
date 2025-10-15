"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Edit, Send, UserPlus } from "lucide-react";
import Link from "next/link";

import PartialLoading from "@/src/components/global/PartialLoading";
import { apiUrl } from "@/src/lib/utils";
import { AdminUser, BasicUser } from "@/src/lib/type";
import { UserEditDialog } from "../components/forms/UserEditDialog";
import { UserDeleteDialog } from "../components/forms/UserDeleteDialog";
import UserDialog from "../components/forms/UserDialog";
import { useSessionAdmin } from "@/src/hooks/useSessionAdmin";

interface ApiResponse {
  success: boolean;
  count: number;
  data: BasicUser[];
}

interface AllUsers extends BasicUser {
  isAdmin?: boolean;
  sub_role_label?: string;
}

export function UsersWrapper() {
  // ✅ On récupère les infos utilisateur et token depuis ton hook
  const { user: sessionUser, token, loading: sessionLoading, isAuthenticated } =
    useSessionAdmin(true); 

  const [data, setData] = useState<AllUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingUser, setEditingUser] = useState<AllUsers | null>(null);
  const [deletingUser, setDeletingUser] = useState<AllUsers | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const companyId = sessionUser?.companyId;

  // ✅ Définition des colonnes
  const columns: ColumnDef<AllUsers>[] = [
    {
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
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
          aria-label="Tout sélectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner une ligne"
        />
      ),
    },
    {
      accessorKey: "user",
      header: "UTILISATEUR",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium">
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
              className="size-8 text-indigo-600 hover:text-indigo-800"
            >
              <Edit />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-green-600 hover:text-green-800"
              asChild
            >
              <Link
                href={`/sprayhive/admin/users/send-mail?user_id=${user.id}&is_admin=${user.isAdmin}`}
              >
                <Send />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  // ✅ Fonctions locales
  const handleEditUser = (user: BasicUser) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: BasicUser) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  // ✅ Récupération des utilisateurs
  const fetchUsers = async (idCompany: number) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [basicRes, adminRes] = await Promise.all([
        fetch(`${apiUrl}/api/basic-user?id_company=${idCompany}`, { headers }),
        fetch(`${apiUrl}/api/admin-user?id_company=${idCompany}`, { headers }),
      ]);

      const basicData: ApiResponse = await basicRes.json();
      const adminData: ApiResponse = await adminRes.json();

      if (basicData.success && adminData.success) {
        const adminList: AdminUser[] = (adminData.data as AdminUser[]).map((admin) => ({
          ...admin,
          isAdmin: true,
          sub_role_label: admin.sub_role_label,
        }));

        setData([...adminList, ...basicData.data]);

        console.log(adminList)
        console.log(data)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchUsers(companyId);
  }, [companyId]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: { globalFilter },
    initialState: { pagination: { pageSize: 10 } },
  });

  // 🧭 1. Pendant le chargement de la session
  if (sessionLoading) return <PartialLoading />;

  // 🧭 2. Si non connecté (le hook redirige déjà, mais on sécurise ici aussi)
  if (!isAuthenticated || !sessionUser) return <div>Accès non autorisé</div>;

  if (loading) return <PartialLoading />;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Utilisateurs
        </h1>
        <Button
          variant="ghost"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
          onClick={() => setIsUserDialogOpen(true)}
        >
          <UserPlus className="w-5 h-5" /> Nouvel Utilisateur
        </Button>
      </div>

      {/* 🔍 Barre de recherche */}
      <div className="flex justify-end mb-4">
        <Input
          placeholder="Rechercher..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* 🧩 Table */}
      <Card className="p-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.length ? (
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
                <TableCell colSpan={columns.length} className="text-center">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ⚙️ Dialogs */}
      <UserDialog
        open={isUserDialogOpen}
        setOpen={setIsUserDialogOpen}
        reloadData={() => fetchUsers(companyId as number)}
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
    </>
  );
}
