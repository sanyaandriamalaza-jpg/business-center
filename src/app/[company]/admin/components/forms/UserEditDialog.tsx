"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Loader2, Edit } from "lucide-react";
import { BasicUser } from "@/src/lib/type";
import { useToast } from "@/src/hooks/use-toast";
import { apiUrl } from "@/src/lib/utils";

// Schéma de validation avec Zod
const userFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  firstName: z.string().min(1, "Le prénom est requis").max(100, "Le prénom est trop long"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().max(20, "Le téléphone est trop long").optional().or(z.literal("")),
  addressLine: z.string().max(200, "L'adresse est trop longue").optional().or(z.literal("")),
  city: z.string().max(100, "La ville est trop longue").optional().or(z.literal("")),
  state: z.string().max(100, "Le département est trop long").optional().or(z.literal("")),
  postalCode: z.string().max(20, "Le code postal est trop long").optional().or(z.literal("")),
  country: z.string().max(100, "Le pays est trop long").optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;


interface UserEditDialogProps {
  user: BasicUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
}: UserEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user.name || "",
      firstName: user.firstName || "",
      email: user.email || "",
      phone: user.phone || "",
      addressLine: user.addressLine || "",
      city: user.city || "",
      state: user.state || "",
      postalCode: user.postalCode || "",
      country: user.country || "",
    },
  });

  const toast = useToast();

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    
    try {
      const updatedData: Partial<UserFormValues> = {};
      
      Object.entries(data).forEach(([key, value]) => {
        const originalValue = user[key as keyof BasicUser];
        if (value !== originalValue) {
          updatedData[key as keyof UserFormValues] = value;
        }
      });

      if (Object.keys(updatedData).length === 0) {
        toast.toast({
          title: "Info",
          description: "Aucune modification trouvé.",
          variant: "default",
        });
        onOpenChange(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/basic-user/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (result.success) {
        toast.toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès.",
          variant: "default",
        });
        onOpenChange(false);
      } else {
        toast.toast({
          title: "Error",
          description: "Erreur lors de la modification.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.toast({
        title: "Error",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cPrimary">
            <Edit className="h-5 w-5" />
            Modifier l'utilisateur
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de {user.firstName} {user.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+33 1 23 45 67 89" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Rue de la Paix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input placeholder="Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input placeholder="75001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département/Région</FormLabel>
                    <FormControl>
                      <Input placeholder="Île-de-France" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input placeholder="France" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} variant="ghost" className="bg-cPrimary text-white hover:bg-cPrimaryHover hover:text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}