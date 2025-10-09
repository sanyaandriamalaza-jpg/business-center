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
  UploadCloud,
  X,
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
import { DomiciliationStepperForm } from "@/src/lib/type";
import { useToast } from "@/src/hooks/use-toast";

const planOptions = [
  { value: "premium", label: "Premium" },
  { value: "basic", label: "Basic" },
];

const steps = [
  { label: "Entreprise", key: "company" },
  { label: "Représentant", key: "representative" },
  { label: "Formule", key: "plan" },
  { label: "Documents", key: "documents" },
];

const formules = [
  { name: "Basic", monthlyPrice: "34.99" },
  { name: "Premium", monthlyPrice: "49.99" },
];

// Zod schemas
const companySchema = z.object({
  companyName: z.string().min(2, "Nom requis"),
  siret: z.string().length(14, "SIRET doit faire 14 chiffres"),
  creationDate: z.string().min(4, "Date requise"),
});
const repSchema = z.object({
  repLastname: z.string().min(1, "Nom requis"),
  repFirstname: z.string().min(1, "Prénom requis"),
  repEmail: z.string().email("Email invalide"),
  repRole: z.string().min(1, "Responsabilité requise"),
});
const planSchema = z.object({
  plan: z.string().min(1, "Formule requise"),
  price: z.coerce.number().min(0, "Tarif requis"),
});
const documentsSchema = z.object({
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    )
    .min(1, "Au moins un document à ajouter"),
});

const initialForm: DomiciliationStepperForm = {
  companyName: "",
  siret: "",
  creationDate: "",
  repLastname: "",
  repFirstname: "",
  repEmail: "",
  repRole: "",
  plan: "",
  price: "",
  documents: [],
};

export default function DomiciliationDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: DomiciliationStepperForm) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<DomiciliationStepperForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const [selectedFormule, setSelectedFormule] = useState<string>("");
  const [prix, setPrix] = useState<string>("");

  const handleFormuleChange = (name: string) => {
    setSelectedFormule(name);
    const found = formules.find((f) => f.name === name);
    setPrix(found?.monthlyPrice || "");
  };

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
      if (step === 0) companySchema.parse(form);
      if (step === 1) repSchema.parse(form);
      if (step === 2) planSchema.parse(form);
      if (step === 3) documentsSchema.parse({ documents: form.documents });
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
      companySchema.parse(form);
      repSchema.parse(form);
      planSchema.parse(form);
      documentsSchema.parse({ documents: form.documents });
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
    toast.toast({
      title: "Domiciliation créé",
      description: `La domiciliation a été créé avec succès.`,
    });
    onCreate(form);
    setOpen(false);
  };

  // Gestion des documents
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    // upload et un retour d'URL
    const uploaded = await Promise.all(
      Array.from(files).map(async (f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
      }))
    );
    setForm((f) => ({
      ...f,
      documents: [...f.documents, ...uploaded],
    }));
    setUploading(false);
  };
  const handleRemoveDoc = (idx: number) => {
    setForm((f) => ({
      ...f,
      documents: f.documents.filter((_, i) => i !== idx),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajouter une domiciliation</DialogTitle>
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
                  {idx < step ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
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
        {/* Step Content */}
        <div>
          {step === 0 && (
            <div className="space-y-3 mt-4">
              <label>
                <span className="block text-sm mb-1">Nom de l'entreprise</span>
                <Input
                  type="text"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, companyName: e.target.value }))
                  }
                  required
                />
                {errors.companyName && (
                  <span className="text-xs text-red-500">
                    {errors.companyName}
                  </span>
                )}
              </label>
              <label>
                <span className="block text-sm mb-1">N° SIRET</span>
                <Input
                  type="text"
                  value={form.siret}
                  maxLength={14}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      siret: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  required
                />
                {errors.siret && (
                  <span className="text-xs text-red-500">{errors.siret}</span>
                )}
              </label>
              <label>
                <span className="block text-sm mb-1">Date de création</span>
                <Input
                  type="date"
                  value={form.creationDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, creationDate: e.target.value }))
                  }
                  required
                />
                {errors.creationDate && (
                  <span className="text-xs text-red-500">
                    {errors.creationDate}
                  </span>
                )}
              </label>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3 mt-4">
              <label>
                <span className="block text-sm mb-1">Nom</span>
                <Input
                  type="text"
                  placeholder="Votre nom"
                  value={form.repLastname}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, repLastname: e.target.value }))
                  }
                  required
                />
                {errors.repLastname && (
                  <span className="text-xs text-red-500">
                    {errors.repLastname}
                  </span>
                )}
              </label>
              <label>
                <span className="block text-sm mb-1">Prénom</span>
                <Input
                  type="text"
                  placeholder="Votre Prénom"
                  value={form.repFirstname}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, repFirstname: e.target.value }))
                  }
                  required
                />
                {errors.repFirstname && (
                  <span className="text-xs text-red-500">
                    {errors.repFirstname}
                  </span>
                )}
              </label>
              <label>
                <span className="block text-sm mb-1">Email</span>
                <Input
                  type="email"
                  placeholder="votreemail@email.com"
                  value={form.repEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, repEmail: e.target.value }))
                  }
                  required
                />
                {errors.repEmail && (
                  <span className="text-xs text-red-500">
                    {errors.repEmail}
                  </span>
                )}
              </label>
              <label>
                <span className="block text-sm mb-1">Responsabilité</span>
                <Input
                  type="text"
                  placeholder="Ex : Président"
                  value={form.repRole}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, repRole: e.target.value }))
                  }
                  required
                />
                {errors.repRole && (
                  <span className="text-xs text-red-500">{errors.repRole}</span>
                )}
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3 mt-4">
              <label>
                <span className="block text-sm mb-1">
                  Formule de domiciliation
                </span>
                <Select
                  value={selectedFormule}
                  onValueChange={handleFormuleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une formule" />
                  </SelectTrigger>
                  <SelectContent>
                    {formules.map((f) => (
                      <SelectItem key={f.name} value={f.name}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.plan && (
                  <span className="text-xs text-red-500">{errors.plan}</span>
                )}
              </label>
              <label>
                <span className="block text-sm mb-1">Tarif mensuel (€)</span>
                <Input
                  type="text"
                  value={prix ? `${prix} € / mois` : ""}
                  readOnly
                />
              </label>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3 mt-4">
              <label className="block">
                <span className="block text-sm mb-1">
                  Ajouter des documents
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={handleFilesChange}
                    className="w-fit"
                    disabled={uploading}
                  />
                  <span className="text-xs text-gray-400">
                    PDF, images (multi)
                  </span>
                  {uploading && (
                    <span className="ml-2 text-xs text-blue-600">
                      Chargement...
                    </span>
                  )}
                </div>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {form.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-2 flex flex-col items-center relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="absolute top-1 right-1 text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-20 h-20 object-contain mb-1"
                      />
                    ) : (
                      <UploadCloud className="w-10 h-10 text-gray-400 mb-1" />
                    )}
                    <span className="text-xs break-all text-center">
                      {doc.name}
                    </span>
                  </div>
                ))}
              </div>
              {errors.documents && (
                <span className="text-xs text-red-500">{errors.documents}</span>
              )}
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
              <Plus className="w-4 h-4 mr-2" /> Ajouter la domiciliation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
