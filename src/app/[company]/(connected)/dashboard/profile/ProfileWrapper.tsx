"use client";

import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/hooks/use-toast";
import { BasicUser } from "@/src/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const userFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .max(100, "Le prénom est trop long"),
  email: z.string().email("Format d'email invalide"),
  phone: z
    .string()
    .max(20, "Le téléphone est trop long")
    .optional()
    .or(z.literal("")),
  addressLine: z
    .string()
    .max(200, "L'adresse est trop longue")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "La ville est trop longue")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .max(100, "Le département est trop long")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .max(20, "Le code postal est trop long")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Le pays est trop long")
    .optional()
    .or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function ProfileWrapper({ user }: { user: BasicUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<BasicUser>(user);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: currentUser.firstName || "",
      firstName: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      addressLine: currentUser.addressLine || "",
      city: currentUser.city || "",
      state: currentUser.state || "",
      postalCode: currentUser.postalCode || "",
      country: currentUser.country || "",
    },
  });

  const toast = useToast();

  const reloadUser = async () => {
    const res = await fetch(`/api/user/basic-user/${user.id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data);
      }
    }
  };

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
        return;
      }

      const response = await fetch(`/api/user/basic-user/${user.id}`, {
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
          variant: "success",
        });
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
      reloadUser();
    }
  };

  return (
    <div className="bg-cBackground w-full rounded-2xl px-8 shadow-lg py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom <span className="text-red-600">*</span></FormLabel>
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
                  <FormLabel>Nom <span className="text-red-600">*</span></FormLabel>
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
                  <FormLabel>Email <span className="text-red-600">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemple.com"
                      {...field}
                    />
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
          <div className="flex justify-end gap-4">
            <Button
              disabled={isLoading}
              variant="ghost"
              className="inline-flex justify-center rounded-md border border-transparent bg-cPrimary/90 py-2 px-6 text-sm font-medium text-cForeground shadow-sm hover:bg-cPrimaryHover hover:text-cForeground focus:outline-none"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Mise à jour..." : "Changer de mot de passe"}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="ghost"
              className="inline-flex justify-center rounded-md border border-transparent bg-cPrimary/90 py-2 px-6 text-sm font-medium text-cForeground shadow-sm hover:bg-cPrimaryHover hover:text-cForeground focus:outline-none"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Mise à jour..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
