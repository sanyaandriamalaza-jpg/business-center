"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Move,
  Wifi,
  Projector,
  Tv,
  Printer,
  Phone,
  Lock,
  Plug,
  Coffee,
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { z } from "zod";
import { useToast } from "@/src/hooks/use-toast";

type Equipment = {
  label: string;
  icon: React.ElementType;
};

const workspaceTypes = [
  { value: "bureau", label: "Bureau" },
  { value: "coworking", label: "Coworking" },
  { value: "salle_reunion", label: "Salle de réunion" },
  { value: "autre", label: "Autre" },
];

const defaultPricing = {
  coworking: { horaire: "10€/h", journalier: "50€/jour" },
  bureau_prive: { horaire: "25€/h", journalier: "120€/jour" },
  salle_reunion: { horaire: "35€/h", journalier: "200€/jour" },
} as const;

const allEquipments: Equipment[] = [
  { label: "Wi-Fi", icon: Wifi },
  { label: "Vidéo projecteur", icon: Projector },
  { label: "Télévision", icon: Tv },
  { label: "Imprimante", icon: Printer },
  { label: "Téléphone", icon: Phone },
  { label: "Prises électriques", icon: Plug },
  { label: "Casier", icon: Lock },
  { label: "Machine à café", icon: Coffee },
];

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const steps = [
  { label: "Informations", key: "infos" },
  { label: "Horaires & capacité", key: "schedules" },
  { label: "Equipements", key: "equipments" },
  { label: "Politique tarifaire", key: "tarifs" },
];

// Zod schemas
const infosSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
});
const schedulesSchema = z.object({
  capacity: z.coerce.number().min(1, "Capacité requise"),
  schedules: z.array(
    z.object({
      day: z.string(),
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    })
  ),
});
const equipmentsSchema = z.object({
  equipments: z.array(z.string()),
});
const tarifsSchema = z.object({
  pricingLabel: z.string().min(1, "Intitulé requis"),
  pricingValue: z.string().min(1, "Valeur requise"),
});

// Form state
const defaultSchedules = daysOfWeek.map((day, idx) => ({
  day,
  open: idx < 5 ? "09:00" : "",
  close: idx < 5 ? "18:00" : "",
  closed: idx >= 5,
}));

const initialForm = {
  name: "",
  type: "",
  capacity: "",
  schedules: defaultSchedules,
  equipments: [] as string[],
  pricingLabel: "",
  pricingValue: "",
};

export type WorkspaceStepperForm = typeof initialForm;

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const clone = [...arr];
  const [removed] = clone.splice(from, 1);
  clone.splice(to, 0, removed);
  return clone;
}

export default function WorkspaceDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: WorkspaceStepperForm) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WorkspaceStepperForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setForm(initialForm);
      setErrors({});
    }
  }, [open]);

  // Validation par étape
  const validateStep = (): boolean => {
    setErrors({});
    try {
      if (step === 0) infosSchema.parse(form);
      if (step === 1)
        schedulesSchema.parse({
          capacity: form.capacity,
          schedules: form.schedules,
        });
      if (step === 2) equipmentsSchema.parse({ equipments: form.equipments });
      if (step === 3) tarifsSchema.parse(form);
      return true;
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach((err: any) => {
          if (err.path && err.path.length)
            fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateAll = (): boolean => {
    setErrors({});
    try {
      infosSchema.parse(form);
      schedulesSchema.parse({
        capacity: form.capacity,
        schedules: form.schedules,
      });
      equipmentsSchema.parse({ equipments: form.equipments });
      tarifsSchema.parse(form);
      return true;
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach((err: any) => {
          if (err.path && err.path.length)
            fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const handlePrev = () => setStep((s) => Math.max(0, s - 1));
  const handleCreate = () => {
    if (!validateAll()) return;
    onCreate(form);
    toast.toast({
      title: "Espace de travail créé",
      description: `L'espace "${form.name}" a été ajouté avec succès.`,
    });
    setOpen(false);
  };
  // Equipements: 2 colonnes, items déplaçables
    const selectedEquipments = allEquipments.filter((eq) =>
      form.equipments.includes(eq.label)
    );
    const unselectedEquipments = allEquipments.filter(
      (eq) => !form.equipments.includes(eq.label)
    );
    const orderedAllEquipments = [
      ...selectedEquipments,
      ...unselectedEquipments,
    ];

    const colSize = Math.ceil(orderedAllEquipments.length / 2);
    const left = orderedAllEquipments.slice(0, colSize);
    const right = orderedAllEquipments.slice(colSize);

    // Drag & drop handlers
    const onDragStart = (idx: number) => setDraggedIndex(idx);
    const onDragOver = (idx: number, overCol: "left" | "right") => {
      if (draggedIndex === null || draggedIndex === idx) return;
      const absoluteIdx = overCol === "left" ? idx : left.length + idx;

      setForm((f: any) => ({
        ...f,
        equipments: arrayMove(f.equipments, draggedIndex, absoluteIdx),
      }));

      setDraggedIndex(absoluteIdx);
    };
    const onDragEnd = () => setDraggedIndex(null);

    // Click/toggle pour ajouter/retirer equipement
    const toggleEquipment = (label: string) => {
      setForm((f: any) => ({
        ...f,
        equipments: f.equipments.includes(label)
          ? f.equipments.filter((l: string) => l !== label)
          : [...f.equipments, label],
      }));
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Ajouter un espace de travail</DialogTitle>
          </DialogHeader>
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s, idx) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center
                  ${
                    idx === step
                      ? "bg-indigo-600 text-white"
                      : idx < step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }
                  font-bold text-base`}
                  >
                    {idx < step ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      idx === step ? "text-indigo-700" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-6 h-0.5 bg-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Step content */}
          <div>
            {step === 0 && (
              <div className="space-y-3 mt-4">
                <label>
                  <span className="block text-sm mb-1">
                    Nom de l'espace de travail
                  </span>
                  <Input
                    type="text"
                    placeholder="Ex : espace coworkoing A"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name}</span>
                  )}
                </label>
                <label>
                  <span className="block text-sm mb-1">Type d'espace</span>
                  <Select
                    value={form.type}
                    onValueChange={(val) => {
                      const pricing =
                        defaultPricing[val as keyof typeof defaultPricing]?.[
                          form.pricingLabel as "horaire" | "journalier"
                        ];
                      setForm((f: any) => ({
                        ...f,
                        type: val,
                        pricingValue: pricing || "",
                      }));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaceTypes.map((w) => (
                        <SelectItem key={w.value} value={w.value}>
                          {w.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <span className="text-xs text-red-500">{errors.type}</span>
                  )}
                </label>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-3 mt-4">
                <label>
                  <span className="block text-sm mb-1">
                    Capacité de l'espace
                  </span>
                  <Input
                    type="text"
                    placeholder="Ex: 10 personnes"
                    min="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, capacity: e.target.value }))
                    }
                    required
                  />
                  {errors.capacity && (
                    <span className="text-xs text-red-500">
                      {errors.capacity}
                    </span>
                  )}
                </label>
                <div>
                  <span className="block text-sm mb-1">
                    Horaires d'ouverture
                  </span>
                  <div className="space-y-1">
                    {form.schedules.map((s: any, idx: any) => (
                      <div key={s.day} className="flex items-center gap-3">
                        <span className="w-20">{s.day}</span>
                        <Input
                          type="time"
                          value={s.open}
                          disabled={s.closed}
                          onChange={(e) =>
                            setForm((f: any) => {
                              const arr = [...f.schedules];
                              arr[idx].open = e.target.value;
                              return { ...f, schedules: arr };
                            })
                          }
                          className="w-24"
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={s.close}
                          disabled={s.closed}
                          onChange={(e) =>
                            setForm((f: any) => {
                              const arr = [...f.schedules];
                              arr[idx].close = e.target.value;
                              return { ...f, schedules: arr };
                            })
                          }
                          className="w-24"
                        />
                        <label className="ml-2 flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={s.closed}
                            onChange={(e) =>
                              setForm((f: any) => {
                                const arr = [...f.schedules];
                                arr[idx].closed = e.target.checked;
                                if (e.target.checked) {
                                  arr[idx].open = "";
                                  arr[idx].close = "";
                                }
                                return { ...f, schedules: arr };
                              })
                            }
                          />
                          Fermé
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="mt-4">
                <span className="block mb-2 text-sm font-medium">
                  Matériels présents (Selectionnez pour ajouter)
                </span>
                <div className="flex gap-6">
                    {[left, right].map((column, colIdx) => (
                      <div key={colIdx} className="w-1/2 space-y-2">
                        {column.map((equip, idx) => {
                          const isSelected = form.equipments.includes(
                            equip.label
                          );
                          const Icon = equip.icon;

                          return (
                            <div
                              key={equip.label}
                              className={`flex items-center px-2 py-1 rounded border cursor-pointer select-none gap-2 ${
                                isSelected
                                  ? "bg-indigo-100 border-indigo-400"
                                  : "bg-white border-gray-200"
                              }`}
                              draggable={isSelected}
                              onClick={() => toggleEquipment(equip.label)}
                              onDragStart={() =>
                                onDragStart(
                                  colIdx === 0 ? idx : left.length + idx
                                )
                              }
                              onDragOver={(e) => {
                                e.preventDefault();
                                onDragOver(
                                  idx,
                                  colIdx === 0 ? "left" : "right"
                                );
                              }}
                              onDrop={onDragEnd}
                              onDragEnd={onDragEnd}
                              title={
                                isSelected ? "Déplacer ou retirer" : "Ajouter"
                              }
                            >
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              {equip.label}
                              <span className="ml-auto text-xs">
                                {isSelected ? "✔" : "+"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                </div>
                {errors.equipments && (
                  <span className="text-xs text-red-500">
                    {errors.equipments}
                  </span>
                )}
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3 mt-4">
                <label>
                  <span className="block text-sm mb-1">
                    Politique tarifaire
                  </span>
                  <Select
                    value={form.pricingLabel}
                    onValueChange={(val) => {
                      const pricing =
                        defaultPricing[
                          form.type as keyof typeof defaultPricing
                        ]?.[val as "horaire" | "journalier"];
                      setForm((f: any) => ({
                        ...f,
                        pricingLabel: val,
                        pricingValue: pricing || "",
                      }));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Horaire / Journalier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horaire">Horaire</SelectItem>
                      <SelectItem value="journalier">Journalier</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.pricingLabel && (
                    <span className="text-xs text-red-500">
                      {errors.pricingLabel}
                    </span>
                  )}
                </label>
                <label>
                  <span className="block text-sm mb-1">Valeur</span>
                  <Input
                    type="text"
                    placeholder="Ex: 25€/h"
                    value={form.pricingValue}
                    onChange={(e) =>
                      setForm((f: any) => ({
                        ...f,
                        pricingValue: e.target.value,
                      }))
                    }
                    required
                    readOnly
                  />
                  {errors.pricingValue && (
                    <span className="text-xs text-red-500">
                      {errors.pricingValue}
                    </span>
                  )}
                </label>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6 flex-row flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={handlePrev}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
            </Button>
            {step < steps.length - 1 ? (
              <Button
                variant="ghost"
                className="bg-indigo-600 text-white hover:bg-indigo-800 hover:text-white"
                onClick={handleNext}
                type="button"
              >
                Suivant <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="bg-indigo-600 text-white hover:bg-indigo-800 hover:text-white"
                onClick={handleCreate}
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" /> Ajouter l'espace
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}
