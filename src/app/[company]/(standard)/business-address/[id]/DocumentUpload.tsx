"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  X,
  Package,
  Check,
  CloudUpload,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import { usePathname, useRouter } from "next/navigation";
import {
  BasicUser,
  Formule,
  LatestInvoiceRef,
  NotifUserForVirtualOfficeData,
} from "@/src/lib/type";
import { normalizeAndCapitalize, uploadFile, uploadImage } from "@/src/lib/customfunction";
import { useToast } from "@/src/hooks/use-toast";
import { UploadClient } from "@/src/lib/customClass";

type StepId = "kbis" | "status" | "identity" | "rib";

interface Step {
  id: StepId;
  title: string;
  subtitle: string;
  completed: boolean;
}

interface Files {
  kbis: File | null;
  status: File | null;
  identity: File | null;
  rib: File | null;
}

interface UploadResponse {
  success: boolean;
  message: string;
  totalFiles?: number;
  successCount?: number;
  errorCount?: number;
  results?: any[];
  errors?: any[];
}

interface UploadImageResponse {
  success: boolean;
  url?: string;
  error?: string;
}

const initialSteps: Step[] = [
  {
    id: "kbis",
    title: "Kbis de votre société",
    subtitle: "Veuillez joindre un extrait Kbis de moins de 3 mois.",
    completed: false,
  },
  {
    id: "status",
    title: "Statut de la société",
    subtitle:
      "Document précisant la structure juridique et le fonctionnement de votre entreprise.",
    completed: false,
  },
  {
    id: "identity",
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

export default function DocumentUpload({ offerData }: { offerData: Formule }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [files, setFiles] = useState<Files>({
    kbis: null,
    status: null,
    identity: null,
    rib: null,
  });

  const { toast } = useToast();
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const { data: session } = useSession();
  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );
  const router = useRouter();
  const pathname = usePathname();

  const userId =
    session?.user.profileType === "basicUser" ? session.user.id : null;

  useEffect(() => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        completed: files[step.id] !== null,
      }))
    );
  }, [files]);

  const getNextIncompleteStep = (): Step | null => {
    return steps.find((step) => !step.completed) || null;
  };

  // TODO: offre selectionnable

  const nextIncompleteStep = getNextIncompleteStep();
  const allStepsCompleted = steps.every((step) => step.completed);

  const handleFileUpload = (stepId: StepId, uploadedFiles: FileList | null) => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      const file = uploadedFiles[0];

      // Validation du type de fichier
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        setUploadStatus({
          type: "error",
          message:
            "Type de fichier non supporté. Formats acceptés: PDF, JPG, PNG",
        });
        return;
      }

      // Validation de la taille
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadStatus({
          type: "error",
          message: "Fichier trop volumineux. Taille maximale: 10MB",
        });
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [stepId]: file,
      }));

      setUploadStatus({ type: null, message: "" });
    }
  };

  const detectFileType = (fileName: string): StepId | null => {
    const name = fileName.toLowerCase();

    if (name.includes("kbis") || name.includes("extrait")) {
      return "kbis";
    } else if (name.includes("statut") || name.includes("constitution")) {
      return "status";
    } else if (
      name.includes("identite") ||
      name.includes("carte") ||
      name.includes("passeport") ||
      name.includes("cni")
    ) {
      return "identity";
    } else if (
      name.includes("rib") ||
      name.includes("banque") ||
      name.includes("bank")
    ) {
      return "rib";
    }

    return null;
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

    if (droppedFiles && droppedFiles.length > 0) {
      const file = droppedFiles[0];
      let targetStepId: StepId | null = detectFileType(file.name);

      // Si le type n'est pas détecté, utiliser la première étape non complétée
      if (!targetStepId) {
        const incompleteStep = steps.find((step) => !step.completed);
        if (incompleteStep) {
          targetStepId = incompleteStep.id;
        }
      }

      // Si le type détecté est déjà complété, utiliser la prochaine étape libre
      if (targetStepId && files[targetStepId]) {
        const incompleteStep = steps.find((step) => !step.completed);
        if (incompleteStep) {
          targetStepId = incompleteStep.id;
          console.log(
            `Étape détectée déjà complétée. Fichier "${file.name}" associé à: ${steps.find((s) => s.id === targetStepId)?.title}`
          );
        }
      }

      if (targetStepId) {
        handleFileUpload(targetStepId, droppedFiles);

        const stepName = steps.find((s) => s.id === targetStepId)?.title;
      }
    }
  };

  const removeFile = (stepId: StepId) => {
    setFiles((prev) => ({
      ...prev,
      [stepId]: null,
    }));
  };

  const uploadFilesToServer = async (
    filesToUpload: { stepId: string; file: File }[]
  ): Promise<{ stepId: string; url: string }[]> => {
    try {
      const results = await Promise.all(
        filesToUpload.map(async (item) => {
          const folder = item.stepId;
          const res = await uploadFile(item.file, { customFolder: folder });
          if (!res.success || !res.path) {
            throw new Error(res.error || "Erreur lors de l'upload");
          }
          return {
            stepId: item.stepId,
            url: res.path,
          };
        })
      );

      return results;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload des fichiers"
      );
    }
  };

  const setIsGeneralLoadingVisible = useGlobalStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const handleSubmit = async () => {
    if (!allStepsCompleted) {
      setUploadStatus({
        type: "error",
        message: "Veuillez compléter tous les documents avant de soumettre.",
      });
      return;
    }

    setIsGeneralLoadingVisible(true);
    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const filesToUploadArray: { stepId: string; file: File }[] = [];

      Object.entries(files).forEach(([stepId, file]) => {
        if (file) {
          filesToUploadArray.push({ stepId, file });
        }
      });

      if (filesToUploadArray.length === 0) {
        throw new Error("Aucun fichier à uploader");
      }

      setUploadStatus({
        type: null,
        message: `Upload en cours de ${filesToUploadArray.length} fichier(s)...`,
      });

      const uploadResults = await uploadFilesToServer(filesToUploadArray);

      const filesToSubmit = uploadResults.map(({ stepId, url }) => ({
        file_type: stepId,
        file_url: url,
      }));

      setUploadStatus({
        type: null,
        message: "Enregistrement des fichiers...",
      });

      const response = await fetch("/api/upload-file-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: filesToSubmit,
          id_basic_user: userId,
        }),
      });

      const result: UploadResponse = await response.json();

      if (result.success) {
        setUploadStatus({
          type: "success",
          message: result.message,
        });

        // création de la facture
        let latestInvoiceRefData: LatestInvoiceRef | undefined | null =
          undefined;
        if (currentBusinessCenter) {
          const res = await fetch(
            `/api/invoice/latest/${currentBusinessCenter.id}`
          );
          const data = await res.json();
          latestInvoiceRefData = data.success ? data.data : null;
        }

        const invoiceRefTemp = normalizeAndCapitalize(
          `${offerData.name} ${offerData.id} `
        );

        const invoiceRef =
          latestInvoiceRefData && latestInvoiceRefData.invoiceVirtualOfficeRef
            ? latestInvoiceRefData.invoiceVirtualOfficeRef
            : invoiceRefTemp.toUpperCase();

        const invoiceRefNum =
          latestInvoiceRefData && latestInvoiceRefData.nextReferenceNum
            ? latestInvoiceRefData.nextReferenceNum
            : Date.now();

        const response = await fetch(`/api/user/basic-user/${userId}`);
        const userData = await response.json();
        const user = userData.success ? userData.data : null;

        const dataToSend = {
          reference: invoiceRef,
          referenceNum: invoiceRefNum,
          userName: user.name,
          userFirstName: user.firstName,
          userEmail: user.email,
          userAddressLine: user.addressLine,
          userCity: user.city,
          userState: user.state,
          userPostalCode: user.postalCode,
          userCountry: user.country,
          startSubscription: new Date(Date.now()).toISOString().split("T")[0],
          duration: 12,
          durationType: "monthly",
          amount: Number(offerData.monthlyPrice),
          currency: "EUR",
          paymentMethod: "card",
          status: "pending",
          idBasicUser: Number(userId),
          idVirtualOfficeOffer: offerData.id,
        };

        // console.log(dataToSend)

        const res = await fetch(`/api/invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });

        const dataRes = await res.json();
        if (dataRes.success) {
          // SEND EMAIL
          try {
            const dataForEmail: NotifUserForVirtualOfficeData = {
              logoUrl: currentBusinessCenter?.logoUrl ?? null,
              firstName: user.firstName,
              companyName: currentBusinessCenter?.name,
              companyInfoSummary: {
                name: currentBusinessCenter?.name,
                phone: currentBusinessCenter?.phone
              },
            };
            const response = await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: user.email,
                subject: `Confirmation de votre souscription de domiciliation - ${currentBusinessCenter?.name}`,
                dataForEmail,
                typeOfService : 'virtual-office-offer'
              }),
            });

            const data = await response.json();
          } catch (error) {
            toast({
              title: "Error",
              description: "Erreur lors de l'envoie de l'email.",
              variant: "destructive",
            });
  
          } 
          toast({
            title: "Succès",
            description: "La création de votre facture est réussie.",
            variant: "success",
          });

          if (
            pathname ===
            `/${currentBusinessCenter?.slug}/admin/virtual-office-address/new`
          ) {
            router.push(
              `/${currentBusinessCenter?.slug}/admin/virtual-office-address`
            );
          } else if (
            pathname ===
            `/${currentBusinessCenter?.slug}/business-address/${offerData.id}`
          ) {
            router.push(
              `/${currentBusinessCenter?.slug}/dashboard/company-domiciliation`
            );
          }
        } else {
          toast({
            title: "Erreur",
            description: "Échec de la création de la facture.",
            variant: "destructive",
          });
        }
      } else {
        setUploadStatus({
          type: "error",
          message: result.message || "Erreur lors de l'upload des fichiers",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setUploadStatus({
        type: "error",
        message: "Erreur de connexion. Veuillez réessayer.",
      });
    } finally {
      setIsUploading(false);
      setIsGeneralLoadingVisible(false);
    }
  };

  return (
    <div className="md:px-6 mb-16 mx-auto">
      <div className="flex items-center gap-6 text-cPrimary mb-4">
        <Package className="w-6 h-6" />
        <h2 className="md:text-xl font-bold">Dépôt de vos fichiers</h2>
      </div>

      {/* Messages de statut */}
      {uploadStatus.type && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            uploadStatus.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {uploadStatus.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{uploadStatus.message}</span>
          </div>
        </div>
      )}

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
                <h3 className="font-medium text-cStandard mb-1 text-sm md:text-base">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-cStandard/60 whitespace-pre-line">
                  {step.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:px-8">
          <div className="md:text-center">
            <h3 className="md:text-lg font-medium text-cStandard mb-2">
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
                      onClick={() => removeFile(stepId as StepId)}
                      className="p-1 hover:bg-green-100 rounded"
                      disabled={isUploading}
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
              onDrop={(e) => handleDrop(e, "upload")}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center">
                  <CloudUpload className="h-10 w-10 md:h-28 md:w-28 text-cPrimary" />
                </div>
                <div className="text-center">
                  <p className="md:text-lg font-medium text-cStandard/60 mb-2">
                    Glisser-déposer votre fichier
                  </p>
                  <p className="text-xs md:text-sm text-cStandard/60 mb-4 font-bold">
                    - OU -
                  </p>
                  <label className="cursor-pointer">
                    <span className="bg-cPrimary text-cForeground px-6 py-3 rounded-lg text-sm font-medium hover:bg-cPrimaryHover transition-colors inline-block">
                      Sélectionner votre fichier
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (nextIncompleteStep) {
                          handleFileUpload(
                            nextIncompleteStep.id,
                            e.target.files
                          );
                        }
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isUploading}
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
          <AlertCircle className="h-4 w-4 text-cStandard/50 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-cStandard/50 leading-relaxed">
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
          disabled={!allStepsCompleted || isUploading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            allStepsCompleted && !isUploading
              ? "bg-cPrimary text-cForeground hover:bg-cPrimaryHover"
              : "bg-cStandard/60 text-cStandard cursor-not-allowed"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Upload en cours...</span>
            </div>
          ) : (
            "Soumettre mes documents"
          )}
        </button>
      </div>
    </div>
  );
}
