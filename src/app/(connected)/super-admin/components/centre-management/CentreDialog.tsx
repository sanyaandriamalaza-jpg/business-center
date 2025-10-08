"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { z } from "zod";
import { Textarea } from "@/src/components/ui/textarea"

const steps = [
  { label: "Entreprise", key: "company" },
  { label: "Administrateur", key: "admin" },
  { label: "Fonctionnalités", key: "features" },
];

const featuresList = [
  { key: "reservation", label: "Module de réservation d’espaces" },
  { key: "plan", label: "Module de gestion du plan des locaux" },
  { key: "domiciliation", label: "Module de domiciliation" },
  { key: "mail", label: "Module de gestion du courrier" },
  { key: "digicode", label: "Génération de codes d’accès (digicode)" },
  { key: "scan", label: "Scan et numérisation du courrier avec envoi automatique" },
  { key: "signature", label: "Signature électronique de contrat" },
];

// Zod schemas
const companySchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().optional(),
});

const adminSchema = z.object({
  adminName: z.string().min(1, "Nom requis"),
  adminFirstName: z.string().min(1, "Nom requis"),
  adminEmail: z.string().email("Email invalide"),
  adminPassword: z.string().min(6, "Mot de passe requis (6 caractères minimum)"),
});

const featuresSchema = z.object({
  features: z.object({
    reservation: z.boolean(),
    plan: z.boolean(),
    domiciliation: z.boolean(),
    mail: z.boolean(),
    digicode: z.boolean(),
    scan: z.boolean(),
    signature: z.boolean(),
  }),
});

const initialForm = {
  name: "",
  description: "",
  adminName: "",
  adminFirstName: "",
  adminEmail: "",
  adminPassword: "",
  features: {
    reservation: false,
    plan: false,
    domiciliation: false,
    mail: false,
    digicode: false,
    scan: false,
    signature: false,
  },
};

export type CentreStepperForm = typeof initialForm;

export default function CentreDialog({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreate: (form: CentreStepperForm) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CentreStepperForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      if (step === 1) adminSchema.parse(form);
      if (step === 2) featuresSchema.parse({ features: form.features });
      return true;
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach((err: any) => {
          if (err.path && err.path.length) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  // Validate all before create
  const validateAll = (): boolean => {
    setErrors({});
    try {
      companySchema.parse(form);
      adminSchema.parse(form);
      featuresSchema.parse({ features: form.features });
      return true;
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach((err: any) => {
          if (err.path && err.path.length) fieldErrors[err.path[0]] = err.message;
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
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Créer un nouveau centre d'affaire</DialogTitle>
        </DialogHeader>
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, idx) => (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center
                  ${idx === step ? "bg-indigo-600 text-white" : idx < step ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}
                  font-bold text-base`}
                >
                  {idx < step ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                </div>
                <span className={`text-xs mt-1 ${idx === step ? "text-indigo-700" : "text-gray-500"}`}>{s.label}</span>
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
              <label className="block">
                <span className="block text-sm mb-1">Nom de l'entreprise</span>
                <Input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Description</span>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
              </label>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3 mt-4">
              <label className="block">
                <span className="block text-sm mb-1">Nom de l'administrateur</span>
                <Input type="text" value={form.adminName} onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))} required />
                {errors.adminName && <span className="text-xs text-red-500">{errors.adminName}</span>}
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Prénom de l'administrateur</span>
                <Input type="text" value={form.adminFirstName} onChange={e => setForm(f => ({ ...f, adminFirstName: e.target.value }))} required />
                {errors.adminFirstName && <span className="text-xs text-red-500">{errors.adminFirstName}</span>}
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Email de l'administrateur</span>
                <Input type="email" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} required />
                {errors.adminEmail && <span className="text-xs text-red-500">{errors.adminEmail}</span>}
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Mot de passe</span>
                <Input type="password" value={form.adminPassword} onChange={e => setForm(f => ({ ...f, adminPassword: e.target.value }))} required />
                {errors.adminPassword && <span className="text-xs text-red-500">{errors.adminPassword}</span>}
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 mt-4">
              <span className="block mb-2 text-sm font-medium">Modules à activer/désactiver :</span>
              {featuresList.map((feature) => (
                <div key={feature.key} className="flex items-center gap-3">
                  <Switch
                    id={`feature-${feature.key}`}
                    checked={form.features[feature.key as keyof typeof form.features]}
                    onCheckedChange={checked =>
                      setForm(f => ({
                        ...f,
                        features: { ...f.features, [feature.key]: checked }
                      }))
                    }
                  />
                  <label htmlFor={`feature-${feature.key}`} className="text-sm">{feature.label}</label>
                </div>
              ))}
              {errors.features && <span className="text-xs text-red-500">{errors.features}</span>}
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
            <Button variant="ghost" className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white" onClick={handleNext} type="button">
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="ghost" className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white" onClick={handleCreate} type="button">
              <Plus className="w-4 h-4 mr-2" /> Créer le centre
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}