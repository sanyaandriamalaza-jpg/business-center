"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  X,
  Package,
  Check,
  CloudUpload,
} from "lucide-react";

type StepId = "nif" | "statuts" | "justificatif" | "rib" | string;

interface Step {
  id: StepId;
  title: string;
  subtitle: string;
  completed: boolean;
}

interface Files {
  nif: File | null;
  statuts: File | null;
  justificatif: File | null;
  rib: File | null;
}

const steps: Step[] = [
  {
    id: "nif",
    title: "Numéro d'identité Fiscal ",
    subtitle: "Veuillez joindre votre Numéro d'identité Fiscal de votre société.",
    completed: true,
  },
  {
    id: "statuts",
    title: "Statuts de la société",
    subtitle:
      "Document précisant la structure juridique et le fonctionnement de votre entreprise.",
    completed: true,
  },
  {
    id: "justificatif",
    title: "Justificatif d'identité du gérant",
    subtitle:
      "Indispensable pour authentifier le représentant légal.\nPièce d'identité acceptée (carte d'identité, CNI ou passeport).",
    completed: false,
  },
  {
    id: "rib",
    title: "RIB (Relevé d'identité Bancaire)",
    subtitle:
      "Utilisé pour mettre en place les prélèvements automatiques liés à nos services.\nMerci de fournir un RIB au nom de l'entreprise ou du gérant.",
    completed: false,
  },
];

export default function DocumentUpload() {
  const [files, setFiles] = useState<Files>({
    nif: null,
    statuts: null,
    justificatif: null,
    rib: null,
  });

  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const getNextIncompleteStep = (): Step | null => {
    // return steps.find((step) => !files[step.id as StepId]) || null;
    return steps.find((step) => step.completed === false) || null;
  };

  const nextIncompleteStep = getNextIncompleteStep();

  const handleFileUpload = (stepId: StepId, uploadedFiles: FileList | null) => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [stepId]: uploadedFiles[0],
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    setDraggedOver(stepId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    setDraggedOver(null);
    const droppedFiles = e.dataTransfer.files;
    
    // associer le fichier à la bonne étape
    if (droppedFiles && droppedFiles.length > 0) {
      const file = droppedFiles[0];
      const fileName = file.name.toLowerCase();
      let targetStepId: StepId | null = null;
      
      if (fileName.includes('nif') || fileName.includes('extrait')) {
        targetStepId = 'nif';
      } else if (fileName.includes('statut') || fileName.includes('constitution')) {
        targetStepId = 'statuts';
      } else if (fileName.includes('identite') || fileName.includes('carte') || fileName.includes('passeport') || fileName.includes('cni')) {
        targetStepId = 'justificatif';
      } else if (fileName.includes('rib') || fileName.includes('banque') || fileName.includes('bank')) {
        targetStepId = 'rib';
      }
      
      //utiliser la première étape non complétée
      if (!targetStepId) {
        const incompleteStep = steps.find(step => step.completed === false);
        if (incompleteStep) {
          targetStepId = incompleteStep.id;
        }
      }
      
      if (targetStepId) {
        const nextIncompleteStep = steps.find(step => step.completed === false);
        if (nextIncompleteStep) {
          targetStepId = nextIncompleteStep.id;
          console.log(`Étape détectée déjà complétée. Fichier "${file.name}" associé à la prochaine étape libre: ${nextIncompleteStep.title}`);
        } else {
          console.log('Toutes les étapes sont déjà complétées !');
          return;
        }
      }
      
      if (targetStepId) {
        handleFileUpload(targetStepId, droppedFiles);
        
        // Notification à l'utilisateur du choix effectué
        const stepName = steps.find(s => s.id === targetStepId)?.title;
        console.log(`Fichier "${file.name}" associé à: ${stepName}`);
      }
    }
  };

  const removeFile = (stepId: StepId) => {
    setFiles((prev) => ({
      ...prev,
      [stepId]: null,
    }));
  };

  const handleSubmit = () => {
    const uploadedFiles = Object.entries(files).filter(
      ([_, file]) => file !== null
    );
    console.log("Fichiers à soumettre:", uploadedFiles);
  };

  return (
    <div className="md:px-6 mb-16 bg-white">
      <div className=" flex items-center gap-6 text-indigo-700 mb-4">
        <Package className="w-6 h-6 " />
        <h2 className="md:text-xl font-bold">Dépôt de vos fichiers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2 lg:space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{step.title}</h3>
                <p className=" text-xs md:text-sm text-gray-600 whitespace-pre-line">
                  {step.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className=" lg:px-8">
          <div className="md:text-center">
            <h3 className="md:text-lg font-medium text-gray-900 mb-2">
              {nextIncompleteStep
                ? `Veuillez déposer le ${nextIncompleteStep.title}`
                : "Tous les documents sont complétés ✓"}
            </h3>

            {/* Affichage des fichiers uploadés */}
            <div className="mb-6 space-y-2">
              {Object.entries(files).map(([stepId, file]) => {
                if (!file) return null;
                const step = steps.find((s) => s.id === stepId);
                return (
                  <div
                    key={stepId}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {step?.title}
                      </span>
                      <span className="text-xs text-green-600">
                        ({file.name})
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(stepId)}
                      className="p-1 hover:bg-green-100 rounded"
                    >
                      <X className="h-4 w-4 text-green-600" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
                draggedOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={(e) => handleDragOver(e, "upload")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                setDraggedOver(null);
                const droppedFiles = e.dataTransfer.files;
                handleFileUpload("justificatif", droppedFiles);
                handleDrop(e, "upload");
              }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className=" flex items-center justify-center">
                  <CloudUpload className=" h-10 w-10 md:h-28 md:w-28 text-indigo-700" />
                </div>
                <div className="text-center">
                  <p className="md:text-lg font-medium text-gray-400 mb-2">
                    Glisser-déposer votre fichier
                  </p>
                  <p className=" text-xs md:text-sm text-gray-400 mb-4 font-bold">- OU -</p>
                  <label className="cursor-pointer">
                    <span className="bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-block">
                      Sélectionner votre fichier
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload("justificatif", e.target.files)
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 md:p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600 leading-relaxed">
            Nous garantissons la confidentialité de vos données. Conformément au
            Règlement Général sur la Protection des Données (RGPD) et à la loi «
            informatique et Libertés », vous disposez d'un droit d'accès, de
            rectification de suppression et d'opposition concernant les données
            personnelles vous concernant.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Soumettre mes documents
        </button>
      </div>
    </div>
  );
}
