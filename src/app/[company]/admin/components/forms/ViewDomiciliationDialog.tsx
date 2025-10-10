"use client";

import { Button } from "@/src/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import {
  ContractFile,
  Documents,
  SignatureData,
  VirtualOfficeData,
} from "@/src/lib/type";
import {
  Ban,
  CircleCheck,
  Clock,
  FileText,
  Download,
  X,
  Check,
  Loader2,
  XCircle,
  Signature,
  CheckCircle,
  Loader,
  Upload,
} from "lucide-react";
import { toast } from "@/src/hooks/use-toast";
import { Textarea } from "@/src/components/ui/textarea";
import AdminContractFileSection from "../AdminContractFileSection";
import { useAdminStore } from "@/src/store/useAdminStore";
import { Input } from "@/src/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import React from "react";
import Link from "next/link";
// import { useSession } from "next-auth/react";
import SignatureWrapper from "../SignatureWrapperPdf";
import { useAuth } from "@/src/hooks/useAuth";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  domiciliation: VirtualOfficeData | null;
  userId: string;
  onReloadData: () => void;
};

const formSchema = z.object({
  companyName: z
    .string()
    .min(1, "Le nom de l'entreprise est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  companyLegalForm: z
    .string()
    .min(1, "La forme légale de l'entreprise est requise")
    .min(3, "Le nom doit contenir au moins 3 caractères"),
  siret: z
    .string()
    .min(1, "Le SIRET est requis")
    .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres"),
});

type FormValues = z.infer<typeof formSchema>;

export function ViewDomiciliationDialog({
  open = false,
  onOpenChange,
  domiciliation,
  userId,
  onReloadData,
}: Props) {
  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const [validatingDocuments, setValidatingDocuments] = useState<string | null>(
    null
  );
  const [validatingSignature, setValidatingSignature] = useState<string | null>(
    null
  );
  const [rejectingDocument, setRejectingDocument] = useState<string | null>(
    null
  );
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [OfficeToActivate, setOfficeToActivate] = useState<ContractFile[]>([]);
  const [isSigned, setIsSigned] = useState(false);
  const [procedureCreated, setProcedureCreated] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [count, setCount] = useState<any[]>([]);

  const adminCompany = useAdminStore((state) => state.adminCompany);
  const companyId = adminCompany?.id;
  const categoryId = domiciliation?.userFiles.documents?.[0].id_category_file;

  // const { data: session } = useSession();
  const { user, status, logout } = useAuth();
  const adminEmail = user?.email || "";
  const adminFirstName = user?.firstName || "";
  const adminLastName = user?.name || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: domiciliation?.company.companyName ?? "",
      companyLegalForm: domiciliation?.company.legalForm ?? "",
      siret: domiciliation?.company.siret ?? "",
    },
  });

  // Fonction refetchContracts avec useCallback
  const refetchContracts = useCallback(async () => {
    try {
      const res = await fetch(`/api/contract-file?id_basic_user=${userId}`);
      const data = await res.json();
      const contractFile = data.success ? data.data : null;

      const created = contractFile.filter((c: any) => c.procedureId !== null);
      setProcedureCreated(created);
    } catch (err) {
      console.error("Erreur refetchContracts:", err);
    }
  }, [userId]);

  // activation de l'entreprise
  const onSubmit = async (data: FormValues) => {
    setIsGeneralLoadingVisible(true);
    try {
      const res = await fetch(
        `/api/virtual-office/${domiciliation?.company.idCompany}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_activate: true,
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        const response = await fetch(
          `/api/invoice/single/${domiciliation?.id}/update-reservation?status=confirmed`,
          {
            method: "PATCH",
          }
        );

        const resultResponse = await response.json();

        // const sendRes = await fetch(`/api/send-invoice-file`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     recipient_name : domiciliation?.user.name,
        //     recipient_email : domiciliation?.user.email,
        //     companyName : adminCompany?.name
        //   }),
        // });

        // const res = await sendRes.json();

        if (!resultResponse.success ) {
          toast({
            title: "Error",
            description: "Erreur lors de l'activation de la domiciliation.",
            variant: "destructive",
          });
          return;
        } else {
          toast({
            title: "Succès",
            description: "La domiciliation de l'entreprise est désormais active.",
          });
        }

        onOpenChange(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de l'activation :", error);
      toast({
        title: "Error",
        description: "Erreur lors de l'activation.",
        variant: "destructive",
      });
    } finally {
      setIsGeneralLoadingVisible(false);
    }
  };

  const handleValidateDocument = async (document: Documents) => {
    setIsGeneralLoadingVisible(true);
    setValidatingDocuments(String(document.id));

    try {
      const response = await fetch(`/api/supporting-file/${document.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_validate: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === document.id
              ? { ...doc, status: "available" as const }
              : doc
          )
        );

        toast({
          title: "Succès",
          description: "Le document a été validé avec succès.",
        });
      } else {
        toast({
          title: "Error",
          description: "Erreur lors de la validation du document.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Erreur lors de validation",
        variant: "destructive",
      });
    } finally {
      setValidatingDocuments(null);
      setIsGeneralLoadingVisible(false);
      onReloadData();
    }
  };

  const handleRejectDocument = async (document: Documents) => {
    if (!rejectNote.trim()) {
      console.error("Une note est requise pour rejeter un document");
      return;
    }

    setRejectingDocument(String(document.id));

    try {
      const response = await fetch(`/api/supporting-file/${document.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_validate: false,
          supporting_file_note: rejectNote,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === document.id
              ? { ...doc, status: "expired" as const }
              : doc
          )
        );

        setShowRejectInput(null);
        setRejectNote("");

        console.log("Succès: Le document a été rejeté avec succès.");
      } else {
        console.error("Erreur lors du rejet du document.");
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
    } finally {
      setRejectingDocument(null);
    }
  };

  const handleStartReject = (documentId: string) => {
    setShowRejectInput(documentId);
    setRejectNote("");
  };

  const handleCancelReject = () => {
    setShowRejectInput(null);
    setRejectNote("");
  };

  const handlePlaceSignature = async () => {
    try {
      const res = await fetch(`/api/contract-file?id_basic_user=${userId}`);
      const data = await res.json();
      const contractFile = data.success ? data.data : null;

      const pdfFromBase = contractFile.filter(
        (c: any) => c.procedureId === null
      );

      setPdfUrl(pdfFromBase[0].url);
    } catch (err) {
      console.error("Erreur refetchContracts:", err);
    } finally {
      setValidatingDocuments(null);
    }
  };

  const handleCreateProcedure = useCallback(
    async (
      contractFileId: string,
      documentName: string,
      requestData: {
        pageToSign: number;
        clientPositionX: number;
        clientPositionY: number;
        adminPositionX: number;
        adminPositionY: number;
      }
    ) => {
      try {
        setValidatingDocuments(String(contractFileId));
        setIsGeneralLoadingVisible(true);

        const response = await fetch("/api/yousign/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractFileId: contractFileId,
            procedureName: `Signature ${documentName}`,
            pageToSign: requestData.pageToSign,
            adminFirstName: adminFirstName,
            adminLastName: adminLastName,
            adminEmail: adminEmail,
            clientPositionX: requestData.clientPositionX,
            clientPositionY: requestData.clientPositionY,
            adminPositionX: requestData.adminPositionX,
            adminPositionY: requestData.adminPositionY,
          }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error || "Erreur lors de la création de la procédure"
          );

        const userSigningUrl = data.signingUrl;

        toast({
          title: "Procédure créée",
          description: "La demande de signature a été envoyée à l'utilisateur.",
        });

        return { success: true, procedureId: data.procedureId, userSigningUrl };
      } catch (error: any) {
        console.error("Erreur handleSignAdmin:", error);
        toast({
          title: "Erreur",
          description:
            error.message ||
            "Une erreur est survenue lors de la création de la procédure",
          variant: "destructive",
        });
        return { success: false, message: error.message };
      } finally {
        setValidatingDocuments(null);
        setIsGeneralLoadingVisible(false);
        refetchContracts();
      }
    },
    [
      adminFirstName,
      adminLastName,
      adminEmail,
      setIsGeneralLoadingVisible,
    ]
  );

  const handleSignaturesReady = useCallback(
    (
      signatures: SignatureData,
      contractFileId: string,
      documentName: string
    ) => {
      const requestData = {
        pageToSign: signatures.selectedPage,
        clientPositionX: signatures.client?.x ?? 100,
        clientPositionY: signatures.client?.y ?? 300,
        adminPositionX: signatures.admin?.x ?? 100,
        adminPositionY: signatures.admin?.y ?? 700,
      };

      handleCreateProcedure(contractFileId, documentName, requestData);
    },
    [handleCreateProcedure]
  );

  const handleSign = async (id: string) => {
    try {
      setValidatingSignature(id);
      setIsGeneralLoadingVisible(true);
      const newWindow = window.open("", "_blank");

      const adminInfo = {
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
      };

      const signatureRes = await fetch("/api/yousign/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractFileId: id,
          signerType: "admin",
          adminFirstName: adminInfo.firstName,
          adminLastName: adminInfo.lastName,
          adminEmail: adminInfo.email,
        }),
      });

      const signatureData = await signatureRes.json();
      if (!signatureRes.ok) {
        newWindow?.close();
        toast({
          title: "Erreur",
          description: signatureData.error || "Lien de signature introuvable.",
          variant: "destructive",
        });
      }

      const signingUrl = signatureData.signingUrl;

      if (newWindow) {
        newWindow.location.href = signatureData.signingUrl;
      }

      if (signatureData.environnement === "sandbox") {
        toast({
          title: "Signature simulée",
          description:
            "Mode Sandbox : la signature est simulée. Le webhook sera déclenché automatiquement.",
          variant: "default",
        });

        await fetch("/api/yousign/webbhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_name: "signature_request.completed",
            event_data: {
              signature_request: {
                id: signatureData.procedureId,
                metadata: {
                  contractFileId: id,
                },
              },
            },
          }),
        });

        toast({
          title: "Signature simulée",
          description: "Le webhook a été déclenché pour tester la BDD.",
          variant: "default",
        });
      }
      return {
        success: true,
        procedureId: signatureData.procedureId,
        signingUrl,
      };
    } catch (error: any) {
      console.error("Erreur handleSign:", error);
      toast({
        title: "Error",
        description:
          error.message || "Une erreur est survenue lors de la signature",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    } finally {
      setValidatingSignature(null);
      setIsGeneralLoadingVisible(false);

      toast({
        title: "Succès",
        description: "La signature est faite avec succès.",
      });

      setIsSigned(true);
    }
  };

  const handleSave = async (contractId: string) => {
    setIsGeneralLoadingVisible(true);
    try {
      const contractRes = await fetch(`/api/contract-file/${contractId}`);
      const contractData = await contractRes.json();

      if (!contractRes.ok || !contractData.success) {
        throw new Error(
          contractData.error || "Impossible de récupérer le contrat"
        );
      }

      const signatureRequestId = String(contractData.data.procedureId);

      if (!signatureRequestId) {
        throw new Error("Aucune procédure Yousign trouvée pour ce contrat");
      }

      const saveRes = await fetch("/api/yousign/download-signed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractFileId: Number(contractId),
          signatureRequestId: signatureRequestId,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok || !saveData.success) {
        throw new Error(
          saveData.error || "Erreur lors de la sauvegarde du document signé"
        );
      }

      toast({
        title: "Enregistrement réussi",
        description: "Le document signé est enregistré avec succès!.",
      });
      console.log(" URL du document signé :", saveData.signedFileUrl);

      return saveData.signedFileUrl;
    } catch (error: any) {
      console.error("Erreur handleSave:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegardé le document signé.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneralLoadingVisible(false);
    }
  };

  const getStatusColor = (status: number | null) => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-800";
      case 0:
        return "bg-red-100 text-red-800";
      case null:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: number | null) => {
    switch (status) {
      case 1:
        return "Approuvé";
      case 0:
        return "Rejeté";
      case null:
        return "En attente";
      default:
        return "Inconnu";
    }
  };

  useEffect(() => {
    if (domiciliation?.userFiles?.documents) {
      setDocuments(domiciliation.userFiles.documents);
    }
  }, [domiciliation]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!companyId || !categoryId) return;

      try {
        const res = await fetch(
          `/api/domiciliation-file-type?id_category_file=${categoryId}&id_company=${companyId}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success) {
          setCount(data.data);
        } else {
          setCount([]);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des documents :", err);
        setCount([]);
      }
    };

    fetchDocuments();
  }, [companyId, categoryId]);

  useEffect(() => {
    refetchContracts();
  }, [refetchContracts]);

  useEffect(() => {
    const processContractFiles = () => {
      if (
        domiciliation?.contractFiles &&
        domiciliation.status !== "confirmed"
      ) {
        const VirtualOfficeToActivate = domiciliation.contractFiles.filter(
          (v: any) =>
            v.isContractSignedByAdmin === true ||
            v.isContractSignedByUser === true
        );
        setOfficeToActivate(VirtualOfficeToActivate || []);
      }
    };

    processContractFiles();
  }, [domiciliation]);

  if (!domiciliation) return null;

  return (
    <>
      {open === true && (
        <div className="w-full h-full mt-8 px-6 py-3 bg-white rounded-xl">
          <h2 className="text-cDefaultSecondary-200 text-lg font-bold text-center">
            Détails de la domiciliation
          </h2>
          <div>
            <div className="space-y-2 py-2">
              {/* Représentant */}
              <div className="py-2 border-b md:flex-row gap-3">
                <h2 className="text-cDefaultSecondary-100 text-medium mb-1">
                  Représentant :
                </h2>
                <div className="font-semibold text-sm text-gray-600">
                  {domiciliation.user.firstName} {domiciliation.user.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {domiciliation.user.role}
                </div>
                <div className="text-xs text-muted-foreground">
                  {domiciliation.user.email}
                </div>
              </div>

              {/* Plan */}
              <div className="py-2 border-b flex md:flex-row gap-3">
                <h2 className="text-cDefaultSecondary-100 text-medium mb-1">
                  Plan :
                </h2>
                <span
                  className={`${
                    domiciliation.virtualOfficeOffer.offerName === "Premium"
                      ? "bg-[#982afa]"
                      : domiciliation.virtualOfficeOffer.offerName === "Basic"
                        ? "bg-[#10B981]"
                        : "bg-[#F59E0B]"
                  } text-white font-medium px-3 py-1 rounded-full text-xs`}
                >
                  {domiciliation.virtualOfficeOffer.offerName}
                </span>
                <span className="text-xs text-gray-600 font-medium ml-2 mt-1">
                  {domiciliation.amount} € / mois
                </span>
              </div>

              {/* Documents - Section mise à jour */}
              <div className="py-2 border-b">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-cDefaultSecondary-100 text-medium">
                    Documents :
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-sm bg-gray-100 text-neutral-600 py-1 px-2 rounded-full">
                      {domiciliation.userFiles.total} docs
                    </span>
                    {domiciliation.userFiles.stats.rejected !== 0 && (
                      <span className="text-sm text-red-700 bg-red-100 py-1 px-2 rounded-full">
                        {domiciliation.userFiles.stats.rejected} rejeté(s)
                      </span>
                    )}
                    {domiciliation.userFiles.stats.pending !== 0 && (
                      <span className="text-sm text-amber-700 bg-amber-100 py-1 px-2 rounded-full">
                        {domiciliation.userFiles.stats.pending} en attente
                      </span>
                    )}
                  </div>
                </div>

                {/* Liste des documents */}
                <div className="space-y-2 overflow-y-auto">
                  {domiciliation.userFiles.documents?.map((document, i) => (
                    <React.Fragment key={i}>
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {document.file_type_label}
                            </div>
                            {document.created_at && (
                              <div className="text-xs text-gray-500">
                                Ajouté le{" "}
                                {new Date(
                                  document.created_at
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(document.is_validate as number | null)}`}
                          >
                            {getStatusText(
                              document.is_validate as number | null
                            )}
                          </span>

                          {document.is_validate === null && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleValidateDocument(document)}
                                disabled={
                                  validatingDocuments === String(document.id)
                                }
                                className="h-8 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                                title="Valider le document"
                              >
                                <Check className="w-3 h-3" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStartReject(String(document.id))
                                }
                                disabled={
                                  rejectingDocument === String(document.id) ||
                                  showRejectInput === String(document.id)
                                }
                                className="h-8 px-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
                                title="Rejeter le document"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            title="Voir le document"
                            asChild
                          >
                            <Link
                              href={`${process.env.NEXT_PUBLIC_FILE_BASE_URL}${document.file_url}`}
                              target="_blank"
                            >
                              <Download className="w-3 h-3 text-blue-600" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      {showRejectInput === String(document.id) && (
                        <div className="ml-7 p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-red-800">
                              Motif du rejet (obligatoire)
                            </label>
                            <Textarea
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              placeholder="Veuillez préciser le motif du rejet..."
                              className="min-h-[60px] text-sm text-neutral-600"
                              maxLength={200}
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {rejectNote.length}/200 caractères
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelReject}
                                  className="h-7 px-2 text-xs"
                                >
                                  Annuler
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectDocument(document)}
                                  disabled={
                                    !rejectNote.trim() ||
                                    rejectingDocument === String(document.id)
                                  }
                                  className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {rejectingDocument === String(document.id) ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                      Rejet...
                                    </>
                                  ) : (
                                    "Confirmer le rejet"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {domiciliation.userFiles.documents?.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Aucun document disponible
                    </div>
                  )}
                </div>
              </div>

              {/* Contract / prelèvement */}
              {domiciliation.userFiles.stats.validated !== 0 &&
                (domiciliation.userFiles.stats?.validated ?? 0) >=
                  count.length && (
                  <AdminContractFileSection
                    companyId={companyId as number}
                    userId={domiciliation.user.userId as string}
                    onReload={onReloadData}
                  />
                )}

              {/* Liste des documents à préparer pour la signature */}
              {domiciliation.contractFiles?.length !== 0 && (
                <div className="space-y-2 border-b py-2">
                  <h2 className="text-cDefaultSecondary-100 text-medium mb-1">
                    Préparation des documents à signer :
                  </h2>

                  {domiciliation.contractFiles?.map((document) => (
                    <div
                      key={document.contractFileId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div className="font-medium text-sm text-gray-900">
                          {document.contractFileTag === "contract"
                            ? "Contrat de domiciliation"
                            : "Mandat de prélèvement"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {procedureCreated.some(
                          (proc) =>
                            proc.contractFileId === document.contractFileId
                        ) ? (
                          <Button
                            variant="ghost"
                            disabled
                            className="h-8 px-2 bg-neutral-400 hover:bg-neutral-600 border border-neutral-200 text-neutral-800 hover:text-neutral-800 cursor-not-allowed"
                          >
                            Procédure créée
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setValidatingDocuments(
                                  String(document.contractFileId)
                                );
                                handlePlaceSignature().finally(() => {
                                  setValidatingDocuments(null);
                                });
                              }}
                              disabled={
                                validatingDocuments ===
                                String(document.contractFileId)
                              }
                              className="h-8 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                            >
                              {validatingDocuments ===
                              String(document.contractFileId) ? (
                                <>
                                  <Loader className="w-3 h-3 animate-spin" />
                                  Chargement
                                </>
                              ) : (
                                <>
                                  <Signature className="w-3 h-3" />
                                  Préparer la signature Yousign
                                </>
                              )}
                            </Button>
                            {pdfUrl !== null && (
                              <SignatureWrapper
                                fileUrl={`${process.env.NEXT_PUBLIC_FILE_BASE_URL}${pdfUrl}`}
                                signatories={[
                                  { name: "Administrateur", type: "admin" },
                                  { name: "Client", type: "client" },
                                ]}
                                onSignaturesReady={(signatures) =>
                                  handleSignaturesReady(
                                    signatures,
                                    String(document.contractFileId),
                                    ` ${
                                      document.contractFileTag === "contract"
                                        ? "Contrat de domiciliation"
                                        : "Mandat de prélèvement"
                                    }`
                                  )
                                }
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Liste des documents à signer */}
              {domiciliation.contractFileToSign?.length !== 0 && (
                <div className="space-y-2 border-b py-2">
                  <h2 className="text-cDefaultSecondary-100 text-medium mb-1">
                    Document(s) à signer :
                  </h2>
                  {domiciliation.contractFileToSign?.map((document, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div className="font-medium text-sm text-gray-900">
                          {document.contractFileTag === "contract"
                            ? "Contrat de domiciliation"
                            : "Mandat de prélèvement"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleSign(String(document.contractFileId))
                          }
                          disabled={
                            validatingSignature ===
                            String(document.contractFileId)
                          }
                          className="h-8 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                        >
                          {validatingSignature ===
                          String(document.contractFileId) ? (
                            <>
                              <Loader className="w-3 h-3 animate-spin" />
                              Chargement
                            </>
                          ) : (
                            <>
                              <Signature className="w-3 h-3" />
                              {isSigned ? "Signé" : "Faire signer"}
                            </>
                          )}
                        </Button>
                        {/* {isSigned && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                            onClick={() =>
                              handleSave(String(document.contractFileId))
                            }
                          >
                            <Upload className="w-3 h-3" />
                            Enregistrer dans la base
                          </Button>
                        )} */}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Domiciliation à activer */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {OfficeToActivate && OfficeToActivate.length > 0 && (
                    <div className="py-2 border-b gap-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-cDefaultSecondary-100 font-semibold text-medium mb-1">
                          Entreprise à domicilée :
                        </h2>
                        <div>
                          <Button
                            type="submit"
                            variant="ghost"
                            className="items-center gap-1 bg-cPrimary hover:bg-cPrimaryHover text-cForeground text-xs font-medium px-2.5 py-0.5 rounded-md"
                          >
                            <CircleCheck className="w-3.5 h-3.5" />
                            Activer
                          </Button>
                        </div>
                      </div>
                      <div className="py-2 space-y-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm text-gray-600">
                                Nom de l'entreprise
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-gray-100 text-gray-600"
                                  placeholder="Entrez le nom de l'entreprise"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="companyLegalForm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm text-gray-600">
                                  Forme légale
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="bg-gray-100 text-gray-600"
                                    placeholder="Entrez la forme légale de l'entreprise (ex: SAS, SARL...)"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="siret"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm text-gray-600">
                                  SIRET
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="bg-gray-100 text-gray-600"
                                    placeholder="Entrez le numéro SIRET (14 chiffres)"
                                    maxLength={14}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
              {/* Statut */}
              <div className="py-2 border-b flex md:flex-row gap-3">
                <h2 className="text-cDefaultSecondary-100 text-medium mb-1">
                  Statut :
                </h2>
                <div>
                  {domiciliation.status === "confirmed" ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      <CircleCheck className="w-3.5 h-3.5" />
                      Actif
                    </span>
                  ) : domiciliation.status === "pending" ? (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      En attente
                    </span>
                  ) : domiciliation.status === "canceled" ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      <Ban className="w-3.5 h-3.5" />
                      Annulé
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="ghost"
                className="bg-cDefaultSecondary-100 hover:bg-cDefaultSecondary-200 hover:text-white text-white font-medium px-6"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
