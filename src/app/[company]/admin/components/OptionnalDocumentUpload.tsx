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
  Documents,
  Formule,
  LatestInvoiceRef,
  NotifUserForVirtualOfficeData,
} from "@/src/lib/type";
import { normalizeAndCapitalize, uploadFile } from "@/src/lib/customfunction";
import { useToast } from "@/src/hooks/use-toast";
import { UploadClient } from "@/src/lib/customClass";
import { CompanyFormData } from "../virtual-office-address/new/newSubscriptionWrapper";
import { useAdminStore } from "@/src/store/useAdminStore";

interface Step {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
}

type Files = Record<string, File | null>;

interface UploadResponse {
  success: boolean;
  message: string;
  totalFiles?: number;
  successCount?: number;
  errorCount?: number;
  results?: any[];
  errors?: any[];
}

export default function OptionnalDocumentUpload({
  offerData,
  userId,
  selectedCategory,
  companyData,
}: {
  offerData: Formule;
  userId: string;
  selectedCategory: { categoryName: string; labelId: string } | null;
  companyData: CompanyFormData | null;
}) {
  const { toast } = useToast();
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );
  const router = useRouter();
  const pathname = usePathname();

  const filesLabel: Documents[] = Array.isArray(
    currentBusinessCenter?.documents
  )
    ? currentBusinessCenter.documents
    : currentBusinessCenter?.documents
      ? [currentBusinessCenter.documents]
      : [];

  const filteredFiles = filesLabel.filter((doc) => {
    const isCategoryMatch =
      doc.categoryType?.categoryName === selectedCategory?.categoryName;

    const isLabelMatch = (doc.categoryType?.labels ?? []).some(
      (label) => label.labelId === selectedCategory?.labelId
    );

    return isCategoryMatch && isLabelMatch;
  });

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<Files>({});
  const [uploadedFilesInfo, setUploadedFilesInfo] = useState<
    { stepId: string; fileName: string }[]
  >([]);

  // Mettre à jour les étapes quand les fichiers changent
  useEffect(() => {
    const initialSteps: Step[] = filteredFiles.map((label) => ({
      id: label.id as string,
      title: `${label.file_type_label}`,
      subtitle: `Veuillez joindre le ${label.file_description}.`,
      completed: false,
    }));

    setSteps((prevSteps) => {
      const stepsChanged =
        prevSteps.length !== initialSteps.length ||
        prevSteps.some((step, index) => step.id !== initialSteps[index]?.id);

      if (stepsChanged) {
        const initialFiles: Files = filteredFiles.reduce((acc, label) => {
          acc[label.id as string] = null;
          return acc;
        }, {} as Files);

        setFiles(initialFiles);
        setUploadedFilesInfo([]);

        return initialSteps;
      }

      return prevSteps;
    });
  }, [filteredFiles]);

  useEffect(() => {
    setSteps((prevSteps) => {
      const updatedSteps = prevSteps.map((step) => {
        const isCompleted = files[step.id] !== null;
        const hasChanged = step.completed !== isCompleted;

        if (hasChanged) {
          console.log(
            `Étape "${step.title}" ${isCompleted ? "complétée" : "incomplète"}`
          );
        }

        return {
          ...step,
          completed: isCompleted,
        };
      });

      return updatedSteps;
    });
  }, [files]);

  const getNextIncompleteStep = (): Step | null => {
    return steps.find((step) => !step.completed) || null;
  };

  const nextIncompleteStep = getNextIncompleteStep();
  const hasUploadedFiles = Object.values(files).some((file) => file !== null);

  const handleFileUpload = (stepId: string, uploadedFiles: FileList | null) => {
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

  const detectFileType = (
    fileName: string,
    labels: Documents[]
  ): string | null => {
    const name = fileName.toLowerCase();

    for (const label of labels) {
      const normalizedLabel = label.file_type_label?.toLowerCase();

      if (normalizedLabel && name.includes(normalizedLabel)) {
        return label.id as string;
      }
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
      let targetStepId: string | null = detectFileType(
        file.name,
        filteredFiles
      );

      if (!targetStepId) {
        if (stepId !== "upload") {
          targetStepId = stepId;
        } else {
          const incompleteStep = steps.find((step) => !step.completed);
          targetStepId = incompleteStep?.id || steps[0]?.id || null;
        }
      }

      if (targetStepId && files[targetStepId] !== null) {
        const incompleteStep = steps.find((step) => !step.completed);
        if (incompleteStep) {
          console.log(
            `Étape "${targetStepId}" déjà complétée. Réassignation vers "${incompleteStep.id}"`
          );
          targetStepId = incompleteStep.id;
        }
      }

      if (targetStepId) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;

        handleFileUpload(targetStepId, fileList);

        const stepName = steps.find((s) => s.id === targetStepId)?.title;
        console.log(`Fichier "${file.name}" uploadé pour: ${stepName}`);
      }
    }
  };

  const removeFile = (stepId: string) => {
    setFiles((prev) => ({
      ...prev,
      [stepId]: null,
    }));
  };

  const uploadFilesToServer = async (
    filesToUpload: { stepId: string; file: File }[]
  ): Promise<{ stepId: string; url: string }[]> => {
    try {
      const response = await Promise.all(
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
      return response;
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

  const adminCompany = useAdminStore((state) => state.adminCompany);

  const handleSubmit = async () => {
    setIsUploading(true);
    setIsGeneralLoadingVisible(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const data = await fetch("/api/virtual-office", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          virtual_office_name: companyData?.companyName,
          virtual_office_legal_form: companyData?.legalForm,
          virtual_office_siret: companyData?.siret,
          virtual_office_siren: companyData?.siren,
          virtual_office_rcs: companyData?.rcs,
          virtual_office_tva: companyData?.tva,
          id_category_file: filteredFiles[0].id,
          id_basic_user: userId,
        }),
      });

      const virtualOffice = await data.json();

      if (virtualOffice.success) {
        const filesToUploadArray: { stepId: string; file: File }[] = [];

        Object.entries(files).forEach(([stepId, file]) => {
          if (file) {
            filesToUploadArray.push({ stepId, file });
          }
        });

        // Si des fichiers sont présents, les uploader
        let uploadResults: { stepId: string; url: string }[] = [];
        if (filesToUploadArray.length > 0) {
          setUploadStatus({
            type: null,
            message: `Upload en cours de ${filesToUploadArray.length} fichier(s)...`,
          });

          uploadResults = await uploadFilesToServer(filesToUploadArray);

          setUploadStatus({
            type: null,
            message: "Enregistrement des fichiers...",
          });

          const filesToSubmit = uploadResults.map(({ stepId, url }) => ({
            supporting_file_url: url,
            id_file_type: Number(stepId),
          }));

          const response = await fetch("/api/supporting-file", {
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

          if (!result.success) {
            throw new Error(
              result.message || "Erreur lors de l'upload des fichiers"
            );
          }

          setUploadStatus({
            type: "success",
            message: result.message,
          });
        }

        // création de la facture (même si aucun fichier n'est uploadé)
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
                phone: currentBusinessCenter?.phone,
              },
              isNotComplete : filesToUploadArray.length > 0 ? false : true
            };
            const response = await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: user.email,
                subject: `Confirmation de votre souscription de domiciliation - ${currentBusinessCenter?.name}`,
                dataForEmail,
                typeOfService: "virtual-office-offer",
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

          const successMessage =
            filesToUploadArray.length > 0
              ? "Vos documents ont été uploadés et votre facture a été créée avec succès."
              : "Votre facture a été créée avec succès.";

          toast({
            title: "Succès",
            description: successMessage,
            variant: "success",
          });

          setUploadStatus({
            type: "success",
            message: successMessage,
          });
        } else {
          toast({
            title: "Erreur",
            description: "Échec de la création de la facture.",
            variant: "destructive",
          });
        }

        setTimeout(() => {
          if (
            pathname ===
            `/${adminCompany?.slug}/admin/virtual-office-address/new`
          ) {
            router.push(`/${adminCompany?.slug}/admin/virtual-office-address`);
          } else if (
            pathname ===
            `/${currentBusinessCenter?.slug}/business-address/${offerData.id}`
          ) {
            router.push(
              `/${currentBusinessCenter?.slug}/dashboard/company-domiciliation`
            );
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setUploadStatus({
        type: "error",
        message: "Erreur de connexion. Veuillez réessayer.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="md:px-6 mb-16 mx-auto">
      <div className="flex items-center gap-6 text-cPrimary mb-4">
        <Package className="w-6 h-6" />
        <h2 className="md:text-xl font-bold">
          Dépôt de vos fichiers (Optionnel)
        </h2>
      </div>

      {/* Message d'information */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-neutral-400" />
          <span className="text-sm text-neutral-500">
            Tous les documents sont optionnels. Vous pouvez procéder à votre
            commande même sans uploader de fichiers.
          </span>
        </div>
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
                <h3 className="font-medium text-neutral-800 mb-1 text-sm md:text-base">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 whitespace-pre-line">
                  {step.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:px-8">
          <div className="md:text-center">
            <h3 className="md:text-lg font-medium text-neutral-600 mb-2">
              {nextIncompleteStep
                ? `Vous pouvez déposer le ${nextIncompleteStep.title}`
                : hasUploadedFiles
                  ? "Tous vos documents sont uploadés ✓"
                  : "Vous pouvez procéder sans documents"}
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
                      onClick={() => removeFile(stepId as string)}
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
                  <p className="md:text-lg font-medium text-neutral-400 mb-2">
                    Glisser-déposer votre fichier
                  </p>
                  <p className="text-xs md:text-sm text-neutral-400 mb-4 font-bold">
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

      {/* <div className="mt-6 md:p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-neutral-400 leading-relaxed">
            Nous garantissons la confidentialité de vos données. Conformément au
            Règlement Général sur la Protection des Données (RGPD) et à la loi «
            informatique et Libertés », vous disposez d'un droit d'accès, de
            rectification de suppression et d'opposition concernant les données
            personnelles vous concernant.
          </p>
        </div>
      </div> */}

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            !isUploading
              ? "bg-cPrimary text-cForeground hover:bg-cPrimaryHover"
              : "bg-cPrimary-100 text-cForeground cursor-not-allowed"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>
                {hasUploadedFiles
                  ? "Upload en cours..."
                  : "Traitement en cours..."}
              </span>
            </div>
          ) : hasUploadedFiles ? (
            "Soumettre mes documents"
          ) : (
            "Continuer sans documents"
          )}
        </button>
      </div>
    </div>
  );
}
