"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formuleSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  monthlyPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Prix invalide (ex: 49.99)")
    .refine((val) => parseFloat(val) > 0, {
      message: "Le prix doit être supérieur à 0",
    }),
});

type Formule = z.infer<typeof formuleSchema>;

export default function AddFormuleDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: Formule) => void;
}) {
  const [formules, setFormules] = useState<Formule[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formule>({
    resolver: zodResolver(formuleSchema),
    defaultValues: {
      name: "",
      monthlyPrice: "",
    },
  });

  const onSubmit = (data: Formule) => {
    setFormules((prev) => [...prev, data]);
    onCreate(data);
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-gray-900 font-medium">Nouvelle formule de domiciliation</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-600 font-medium">Nom de la formule</Label>
              <Input
                type="text"
                placeholder="Ex: Premium"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-600 font-medium">Tarif mensuel (€)</Label>
              <Input
                type="text"
                placeholder="Ex: 49.99"
                {...register("monthlyPrice")}
              />
              {errors.monthlyPrice && (
                <p className="text-sm text-red-500">
                  {errors.monthlyPrice.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button variant="ghost" className="text-white bg-indigo-600 hover:bg-indigo-800 hover:text-white" type="submit">Ajouter</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
