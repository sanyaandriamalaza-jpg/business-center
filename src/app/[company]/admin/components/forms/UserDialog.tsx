"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  AppWindowIcon,
  CodeIcon,
  Eye,
  EyeOff,
  User,
  UserRound,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { isPhoneValid as validatePhone } from "@/src/lib/customfunction";
import { signIn, SignInResponse, signOut, useSession } from "next-auth/react";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import { useAdminStore } from "@/src/store/useAdminStore";
import CreateUserForm from "./CreateUserForm";
import { useToast } from "@/src/hooks/use-toast";

const subscriptionFormSchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis",
    })
    .refine((value) => value.trim().length > 0, {
      message: "Le nom est requis",
    }),
  firstName: z
    .string({
      required_error: "Le prénom est requis",
    })
    .refine((value) => value.trim().length > 0, {
      message: "Le prénom est requis",
    }),
  subscriptionEmail: z
    .string({
      required_error: "L‘adresse email est requis",
    })
    .email("Adresse email invalide"),
  phone: z.string(),
  subscriptionPassword: z
    .string({
      required_error: "Le mot de passe est requis",
    })
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export default function UserDialog({
  open,
  setOpen,
  reloadData,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  reloadData: () => void;
}) {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-bold text-center mb-4">
            Ajouter un utilisateur
          </DialogTitle>
        </DialogHeader>
        <CreateUserForm
          isAdmin={true}
          onComplete={(value) => {
            toast({
              title: value ? "Succès" : "Erreur",
              description: value
                ? "Utilisateur créé avec succès."
                : "Une erreur est survenue lors de la création d‘utilisateur.",
              variant: value ? "success" : "destructive",
            });
            reloadData();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
