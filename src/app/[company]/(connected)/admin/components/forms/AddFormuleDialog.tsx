"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, X } from "lucide-react";
import { Formule } from "@/src/lib/type";

const formuleSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Prix invalide (ex: 49.99)")
    .refine((val) => parseFloat(val) <= 9999.99, {
      message: "Le prix ne peut pas dépasser 9999.99€",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Le prix doit être supérieur à 0",
    }),
  description: z.string().min(20, "La description doit être plus longue"),
  features: z
    .array(z.string().min(1, "La fonctionnalité ne peut pas être vide"))
    .min(1, "Au moins une fonctionnalité est requise")
    .max(10, "Vous ne pouvez pas avoir plus de 10 fonctionnalités"),
  is_tagged: z.boolean().optional(),
  tag: z.string().optional(),
});

export type FormuleForm = z.infer<typeof formuleSchema>;

export default function AddFormuleDialog({
  open,
  setOpen,
  onCreate,
  editingFormule,
  onUpdate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: FormuleForm) => void;
  editingFormule?: Formule;
  onUpdate?: (formule: Formule) => void;
}) {
  const isEditing = !!editingFormule;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormuleForm>({
    resolver: zodResolver(formuleSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      features: [""],
      is_tagged: false,
      tag: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: "features" as any,
  });

  useEffect(() => {
    if (open) {
      if (isEditing && editingFormule) {
        setValue("name", editingFormule.name);
        setValue("price", editingFormule.monthlyPrice.toString());
        setValue("description", editingFormule.description as string);
        setValue("features", editingFormule.features ?? [""]);
        setValue("is_tagged", editingFormule.isTagged || false);
        setValue("tag", editingFormule.tag || "");
      } else {
        reset({
          name: "",
          price: "",
          description: "",
          features: [""],
          is_tagged: false,
          tag: "",
        });
      }
    }
  }, [open, isEditing, editingFormule, setValue, reset]);

  const onSubmit = (data: FormuleForm) => {
    const validFeatures = data.features
      .filter((f) => f.trim())
      .map((f) => f.trim());

    const formData = {
      ...data,
      features: validFeatures,
    };

    if (isEditing && onUpdate && editingFormule) {
      // Mode édition
      onUpdate({
        ...editingFormule,
        ...formData,
        monthlyPrice: parseFloat(formData.price),
      });
    } else {
      // Mode création
      onCreate({
        ...formData,
        price: formData.price,
      });
    }

    setOpen(false);
  };

  const addFeature = () => {
    if (fields.length < 10) {
      append("");
    }
  };

  const removeFeature = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    reset({
      name: "",
      price: "",
      description: "",
      features: [""],
      is_tagged: false,
      tag: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-cDefaultSecondary-100">
            {isEditing
              ? "Modifier la formule"
              : "Nouvelle formule de domiciliation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label className="text-gray-600 font-medium">
              Nom de la formule
            </Label>
            <Input
              type="text"
              placeholder="Ex: Premium"
              {...register("name")}
              className="mt-1 text-neutral-600"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-600 font-medium">
              Description de la formule
            </Label>
            <Input
              type="text"
              placeholder="Ex: Formule complète avec tous les services inclus"
              {...register("description")}
              className="mt-1 text-neutral-600"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-gray-600 font-medium">
              Tarif mensuel (€)
            </Label>
            <Input
              type="text"
              placeholder="Ex: 49.99"
              {...register("price")}
              className="mt-1 text-neutral-600"
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="is_tagged"
                {...register("is_tagged")}
                className="w-4 h-4"
              />
              <Label htmlFor="is_tagged" className="text-gray-600 font-medium">
                Formule avec tag spécial
              </Label>
            </div>
            <Input
              type="text"
              placeholder="Ex: POPULAIRE, RECOMMANDÉ..."
              {...register("tag")}
              className="mt-1 text-neutral-600"
            />
          </div>

          <div>
            <Label className="text-gray-600 font-medium">
              Fonctionnalités incluses
            </Label>
            <div className="space-y-2 mt-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ex: Réception de courrier"
                    className="mt-1 text-neutral-600"
                    {...register(`features.${index}` as const)}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.features && (
              <p className="text-sm text-red-500 mt-1">
                {errors.features.message}
              </p>
            )}

            {fields.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="mt-2 text-neutral-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une fonctionnalité
              </Button>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="text-neutral-500"
            >
              Annuler
            </Button>
            <Button
              variant="ghost"
              type="submit"
              className="bg-cDefaultPrimary-100 hover:bg-cPrimaryHover hover:text-white text-white font-medium px-6 "
            >
              {isEditing ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
