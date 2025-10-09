"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/src/hooks/use-toast";

const userSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  firstname: z.string().min(1, "Le prénom est requis"),
  phone: z.string().min(10, "Téléphone doit contenir 10 chiffres minimum"),
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "user"]),
  company: z.string().min(1, "Entreprise requise"),
});

export type UserFormValues = z.infer<typeof userSchema>;

export function UserDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: UserFormValues) => void;
}) {
  const toast = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      firstname: "",
      phone: "",
      email: "",
      role: "user",
      company: "",
    },
  });

  const handleCreate = (data: UserFormValues) => {
    toast.toast({
      title: "Succès",
      description: "Utilisateur ajouté avec succès !",
    });
    setOpen(false);
    onCreate(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-bold text-center mb-4">Ajouter un utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-gray-600 text-sm font-medium">Nom</Label>
            <Input id="name" placeholder="Ex : Doe" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="firstname" className="text-gray-600 text-sm font-medium">Prénom</Label>
            <Input id="firstname" placeholder="Ex : John" {...form.register("firstname")} />
            {form.formState.errors.firstname && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.firstname.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-gray-600 text-sm font-medium">Téléphone</Label>
            <Input id="phone" placeholder="Ex : +33 0 00 00 00 00" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-600 text-sm font-medium">Email</Label>
            <Input id="email" placeholder="Ex : johndoe@email.com" type="text" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role" className="text-gray-600 text-sm font-medium">Rôle</Label>
            <Select
              defaultValue="user"
              onValueChange={(value) =>
                form.setValue("role", value as "admin" | "user")
              }
            >
              <SelectTrigger id="role">
                <SelectValue  placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="admin" className="text-gray-600 text-sm font-medium">Administrateur</SelectItem>
                <SelectItem value="user" className="text-gray-600 text-sm font-medium">Utilisateur simple</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company" className="text-gray-600 text-sm font-medium">Entreprise</Label>
            <Input id="company" placeholder="L'entreprise representer" {...form.register("company")} />
            {form.formState.errors.company && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.company.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              className="bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white"
              type="submit"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
