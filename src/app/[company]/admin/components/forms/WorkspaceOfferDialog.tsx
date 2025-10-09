"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";

import * as z from "zod";
import { CoworkingOffer } from "@/src/lib/type";
import { useEffect } from "react";
import { features } from "process";

const spaceTypes = ["privateOffice", "coworkingSpace", "meetingRoom"] as const;

const formSchema = z.object({
  type: z.enum(spaceTypes),
  description: z.string().min(1, { message: "Ce champ est requis" }),
  isTagged: z.boolean(),
  tag: z.string().optional(),
  hourlyRate: z
    .number({
      invalid_type_error: "Veuillez entrer un nombre",
      required_error: "Veuillez entrer un nombre",
    })
    .min(0.01, { message: "Veuillez entrer une valeur positive" }),
  dailyRate: z
    .number({
      invalid_type_error: "Veuillez entrer un nombre",
      required_error: "Veuillez entrer un nombre",
    })
    .min(0.01, { message: "Veuillez entrer une valeur positive" }),
  features: z.string().min(1, { message: "Ce champ est requis" }),
});

export type FormValues = z.infer<typeof formSchema>;

export default function WorkspaceOfferDialog({
  open,
  setOpen,
  onCreate,
  initialData,
  resetInitialData,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: FormValues) => void;
  initialData?: CoworkingOffer;
  resetInitialData?: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "privateOffice",
      description: "",
      isTagged: false,
      tag: "",
      features: "",
    },
  });

  const { reset } = form;

  const onSubmit = (data: FormValues) => {
    onCreate(data);
    reset({
      dailyRate: undefined,
      hourlyRate: undefined,
      description: "",
      isTagged: false,
      features: "",
    });
    setOpen(false);
  };

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type,
        description: initialData.description,
        isTagged: initialData.isTagged,
        tag: initialData.tag ?? undefined,
        hourlyRate: Number(initialData.hourlyRate),
        dailyRate: Number(initialData.dailyRate),
        features: initialData.features.join("\n"),
      });
    }
  }, [initialData, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen overflow-y-auto text-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-center text-gray-900 font-medium">
            {initialData ? "Modifier l‘offre" : "Ajouter une offre"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d’espace</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="privateOffice">
                        Bureau privé
                      </SelectItem>
                      <SelectItem value="coworkingSpace">
                        Espace coworking
                      </SelectItem>
                      <SelectItem value="meetingRoom">
                        Salle de réunion
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkbox */}
            <FormField
              control={form.control}
              name="isTagged"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isTagged"
                    />
                  </FormControl>
                  <FormLabel htmlFor="isTagged" className="text-gray-600">
                    Est tagué ?
                  </FormLabel>
                </FormItem>
              )}
            />
            {form.watch("isTagged") ? (
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Tag</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="ex: Populaire"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : (
              ""
            )}

            {/* Tarif horaire */}
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarif horaire (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="ex: 15"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tarif journalier */}
            <FormField
              control={form.control}
              name="dailyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarif journalier (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="ex: 105"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fonctionnalités */}
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonctionnalités (une par ligne)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="ex: casier sécurisé / accès 24h/24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  if (resetInitialData) {
                    resetInitialData();
                  }
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="ghost"
                className="bg-indigo-600 text-white hover:bg-indigo-800 hover:text-white"
              >
                {initialData ? "Sauvegarder les modifications" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
