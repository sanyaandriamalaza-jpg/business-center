"use client";

import { Card } from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Edit, Trash2, Search, UserPlus } from "lucide-react";
import { useState } from "react";
// import { UserDialog, UserFormValues } from "@/src/app/[company]/(connected)/admin/components/forms/UserDialog";
import { User } from "@/src/lib/type";
import { useToast } from "@/src/hooks/use-toast";
// import { EditUserDialog } from "@/src/app/[company]/(connected)/admin/components/forms/EditUserDialog";

const utilisateur = [
  {
    id: 1,
    name: "Martin",
    firstname: "Sophie",
    initials: "SM",
    phone: "+33 6 12 34 56 78",
    email: "sophie.martin@example.com",
    role: "Administrateur",
    company: "TechStart",
    statut: "Actif",
  },
  {
    id: 2,
    name: " Dubois",
    firstname: "Thomas",
    initials: "TD",
    phone: "+33 6 23 45 67 89",
    email: "thomas.dubois@example.com",
    role: "Utilisateur",
    company: "CreativeHub",
    statut: "Actif",
  },
  {
    id: 3,
    name: "Laurent",
    firstname: "Marie",
    initials: "ML",
    phone: "+33 6 34 56 78 90",
    email: "marie.laurent@example.com",
    role: "Utilisateur",
    company: "Innovate",
    statut: "Actif",
  },
];

const typeColor = (role: string) => {
  switch (role) {
    case "Administrateur":
      return "bg-purple-100 text-purple-600";
    case "Utilisteur":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function UtilisateurPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [users, setUsers] = useState(utilisateur);
  const [editUser, setEditUser] = useState<User | null>(null);
  const toast = useToast();

  const filteredUtilisateur = utilisateur.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  // const handleCreateUser = (form: UserFormValues) => {
  //   const newUser: User = {
  //     id: 1,
  //     name: form.name,
  //     firstname: form.firstname,
  //     phone: form.phone,
  //     email: form.email,
  //     role: form.role,
  //     company: form.company,
  //     statut: "atif",
  //   };
  //   setDialogOpen(false);
  // };

  // const handleUpdate = () => {
  //   toast.toast({
  //     title: "Utilisateur mis à jour avec succès",
  //   });
  // };

  return (
    <div className="py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Utilisateurs
        </h1>
        <Button
          variant="ghost"
          onClick={() => setDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
        >
          <UserPlus className="w-5 h-5" /> Nouvel Utilisateur
        </Button>
      </div>
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full ">
            <Input
              className="pl-10"
              placeholder="Rechercher un espace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <div className=" overflow-hidden border border-gray-100 last:border-0">
            <Table>
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">
                    UTILISATEUR
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    EMAIL
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    RÔLE
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    ENTREPRISE
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    STATUT
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUtilisateur.map((u, idx) => (
                  <TableRow key={u.email + idx}>
                    <TableCell className="flex items-center gap-3 py-4 ">
                      <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base bg-indigo-100 text-indigo-600">
                        {u.initials}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {u.firstname} {u.name}
                        </span>
                        <span className="text-xs text-gray-600">{u.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-gray-800 text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell className="align-middle">
                      <span
                        className={
                          typeColor(u.role) +
                          "font-medium px-3 py-1 rounded-full text-xs"
                        }
                      >
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle text-gray-600">
                      {u.company}
                    </TableCell>
                    <TableCell className="align-middle">
                      <span
                        className={`bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full text-xs`}
                      >
                        {u.statut}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex gap-3">
                        <Edit
                          className="text-indigo-700 hover:indigo-800 w-5 h-5 cursor-pointer"
                          // onClick={() => {
                          //   setEditUser(u)
                          //   setEditOpen(true)
                          // }}
                        />
                        <Trash2 className="text-red-600 hover:red-700 w-5 h-5 cursor-pointer" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
      {/* <UserDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onCreate={handleCreateUser}
      />
      {editUser && (
        <EditUserDialog
          open={editOpen}
          setOpen={setEditOpen}
          initialData={{
            name: editUser.name,
            firstname: editUser.firstname,
            email: editUser.email,
            phone: editUser.phone,
            role: editUser.role,
            company: editUser.company,
          }}
          onUpdate={handleUpdate}
        />
      )} */}
    </div>
  );
}
