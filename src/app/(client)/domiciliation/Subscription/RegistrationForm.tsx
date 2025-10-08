"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { UserCircle2 } from "lucide-react";
import { useState } from "react";

// Schéma de validation
const subscriptionSchema = z.object({
  lastName: z.string().min(1, "Le nom est requis"),
  firstName: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type Account = z.infer<typeof subscriptionSchema>;

export const RegistrationForm = () => {
  const [account, setAccount] = useState<Account[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = (data: Account) => {
    setAccount((prev) => [...prev, data]);
    console.log(data);
    reset();
  };

  return (
    <div className="bg-white md:px-6 mb-16">
      <div className=" flex items-center gap-6 text-indigo-700 mb-4">
        <UserCircle2 className="w-6 h-6 " />
        <h2 className="md:text-xl font-bold ">Création de votre compte</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
        <div className="md:w-72 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
          <Button
            variant="ghost"
            type="submit"
            className="bg-[#341a6f] text-white hover:bg-indigo-800 hover:text-white"
          >
            S'inscrire
          </Button>
          <Button
            variant="ghost"
            className="bg-white text-[#341a6f] hover:bg-[#341a6f] hover:text-white"
          >
            Se connecter
          </Button>
        </div>
        <div className="border border-gray-300 rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-900 font-bold">Nom</Label>
              <Input
                type="text"
                {...register("lastName")}
                className="border-gray-900"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-900 font-bold">Prénom</Label>
              <Input
                type="text"
                {...register("firstName")}
                className="border-gray-900"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-900 font-bold">Adresse email</Label>
              <Input
                type="email"
                {...register("email")}
                className="border-gray-900"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label className="text-gray-900 font-bold">Téléphone</Label>
              <Input
                type="text"
                {...register("phone")}
                className="border-gray-900"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-gray-900 font-bold">Mot de passe</Label>
            <Input
              type="password"
              {...register("password")}
              className="border-gray-900"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
