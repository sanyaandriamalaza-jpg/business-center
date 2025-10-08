"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/src/components/ui/textarea";

const spaceTypes = ["coworking", "bureau_prive", "salle_reunion"] as const;
type SpaceType = (typeof spaceTypes)[number];

const formSchema = z.object({
  type: z.enum(spaceTypes),
  isTaged: z.boolean(),
  tarifs: z.object({
    horaire: z.string().regex(/^\d+$/, "Doit être un nombre"),
    journalier: z.string().regex(/^\d+$/, "Doit être un nombre"),
  }),
  features: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

export default function WorkspaceOfferDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "coworking",
      isTaged: false,
      tarifs: {
        horaire: "",
        journalier: "",
      },
      features: "",
    },
  });

  const selectedType = form.watch("type");

  const onSubmit = (data: FormValues) => {
    onCreate(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-center font-medium">Ajouter une offre</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-gray-600">Type d’espace</Label>
            <Select
              value={form.getValues("type")}
              onValueChange={(value) =>
                form.setValue("type", value as SpaceType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coworking">Espace coworking</SelectItem>
                <SelectItem value="bureau_prive">Bureau privé</SelectItem>
                <SelectItem value="salle_reunion">Salle de réunion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox isTaged */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={form.watch("isTaged")}
              onCheckedChange={(checked) =>
                form.setValue("isTaged", Boolean(checked))
              }
            />
            <Label className="text-gray-600">Est tagué ?</Label>
          </div>

          <div>
            <Label className="text-gray-600">Tarif horaire (€)</Label>
            <Input
              {...form.register("tarifs.horaire")}
              placeholder="ex: 10000"
            />
            {form.formState.errors.tarifs?.horaire && (
              <p className="text-sm text-red-500">
                {form.formState.errors.tarifs?.horaire.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-gray-600">Tarif journalier (€)</Label>
            <Input
              {...form.register("tarifs.journalier")}
              placeholder="ex: 70000"
            />
            {form.formState.errors.tarifs?.journalier && (
              <p className="text-sm text-red-500">
                {form.formState.errors.tarifs?.journalier.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-gray-600">Fonctionnalités (une par ligne)</Label>
            <Textarea
              placeholder="ex:casier sécurusé/... "
              {...form.register("features")}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="ghost" className="bg-indigo-600 text-white hover:bg-indigo-800 hover:text-white" type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
