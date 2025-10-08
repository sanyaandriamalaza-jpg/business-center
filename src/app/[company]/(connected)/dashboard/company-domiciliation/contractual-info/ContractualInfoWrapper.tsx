"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  FileText,
  Download,
  FileSearch,
  FileDigit,
  FileSignature,
  FileArchive,
  FileSpreadsheet,
  ClipboardX,
  FileBadge,
  Folders,
  X,
  MoreVertical,
  Send,
  Signature,
  LoaderCircle,
} from "lucide-react";
import { ContractFile, Documents } from "@/src/lib/type";
import { useToast } from "@/src/hooks/use-toast";
import { useEffect, useState } from "react";
import { baseUrl } from "@/src/lib/utils";
import { useSession } from "next-auth/react";
import { PDFViewer } from "@/src/components/global/PdfViewer";
import SingleFileUpload from "../../components/SingleUploadDialog";
import { set } from "date-fns";
import Link from "next/link";
import PartialLoading from "@/src/components/global/PartialLoading";
import axios from "axios";

export default function ContractualInfoWrapper() {
  const toast = useToast();
  const { data: session } = useSession();

  const [allDocuments, setAllDocuments] = useState<Documents[]>([]);
  const [allContracts, setAllContracts] = useState<ContractFile[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const userId =
    session?.user.profileType === "basicUser" ? session.user.id : null;

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/upload-file-user?id_basic_user=${userId}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des documents");
      }
      const data = await response.json();
      data.success ? setAllDocuments(data.data.files.documents) : null;

      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      toast.toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les documents.",
        variant: "destructive",
      });
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/contract-file?id_basic_user=${userId}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des contrats");
      }
      const data = await response.json();

      data.success ? setAllContracts(data.data) : null;

      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      toast.toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les contrats.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchContracts();
  }, [userId]);

  const contractToSign = allContracts.filter(
    (contrat) => contrat.procedureId !== null
  );

  const mainDocuments = allDocuments.filter(
    (doc) =>
      ["identity", "status", "rib", "kbis"].includes(doc.file_type) &&
      doc.is_validate
  );

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "contract":
        return <FileSignature className="h-5 w-5 mr-2" />;
      case "invoice":
        return <FileDigit className="h-5 w-5 mr-2 " />;
      case "identity":
        return <FileText className="h-5 w-5 mr-2 " />;
      case "rib":
        return <FileSpreadsheet className="h-5 w-5 mr-2 " />;
      case "kbis":
        return <FileSearch className="h-5 w-5 mr-2 " />;
      case "status":
        return <FileArchive className="h-5 w-5 mr-2 " />;
      default:
        return <FileText className="h-5 w-5 mr-2 " />;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case "contract":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "invoice":
        return "bg-green-50 text-green-800 border-green-200";
      case "identity":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "rib":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "kbis":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "status":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-800 border-cStandard/30";
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      contract: "Contrat",
      invoice: "Facture",
      identity: "Pièce d'identité",
      rib: "RIB",
      kbis: "Kbis",
      status: "Statuts",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleSign = async (id: string, signerType: "user" | "admin") => {
    setActionLoading(true);
    const newWindow = window.open("", "_blank");
   
    try {
      const response = await fetch("/api/yousign/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractFileId: id,
          signerType: signerType,
        }),
      });

      const signatureData = await response.json();

      if (!signatureData.success || !signatureData.signingUrl) { 
        newWindow?.close();
        toast.toast({
          title: "Erreur",
          description: signatureData.error || "Lien de signature introuvable.",
          variant: "destructive",
        });
        return;
      }
    
      if (newWindow) {
        newWindow.location.href = signatureData.signingUrl;
      }

      const isSandbox = true;

      if (isSandbox) {
        toast.toast({
          title: "Signature simulée",
          description:
            "Mode Sandbox : la signature est simulée. Le webhook sera déclenché automatiquement.",
          variant: "default",
        });

        // Simuler le webhook pour tester la mise à jour BDD
        await fetch("/api/yousign/webbhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_name: "signature_request.signed",
            event_data: {
              signature_request: {
                id: signatureData.procedureId,
                metadata: {
                  contractFileId: id,
                  signerType: "user",
                },
              },
            },
          }),
        });

        toast.toast({
          title: "Signature simulée",
          description:
            "Le webhook a été déclenché pour tester la BDD.",
          variant: "default",
        });
      }

    } catch (err: any) {
      newWindow?.close();
      console.error("Erreur handleSign:", err);
      toast.toast({
        title: "Erreur de chargement",
        description: "Erreur réseau.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      fetchContracts();
    }

    return { handleSign, actionLoading };
  };

  return (
    <div className="py-4 px-4 container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="py-3 space-y-2 mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-cStandard/90">
            Informations contractuelles
          </h1>
          <p className="text-cStandard/60 text-sm md:text-base">
            Accedez aux documents officiels concernant votre domiciliation.
          </p>
        </div>
      </div>
      <div className="bg-cBackground px-8 py-4 rounded-lg shadow-md mb-8">
        <div className="mb-4 flex items-center font-semibold text-cPrimary/90">
          <FileBadge className="h-5 w-5 mr-2" />
          <h3 className="text-md md:text-xl ">Vos documents validé(s)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading && <PartialLoading />}
          {mainDocuments && mainDocuments.length !== 0 ? (
            mainDocuments.map((document) => (
              <Card
                key={document.id}
                className="hover:shadow-lg transition-shadow"
                style={{
                  backgroundColor: "rgb(var(--custom-background-color))",
                  borderColor: "rgb(var(--custom-foreground-color)/0.7)",
                }}
              >
                <CardHeader>
                  <div className="flex items-center text-cPrimary/70">
                    {getDocumentIcon(document.file_type)}
                    <div className="">
                      <CardTitle className="text-lg">
                        {getDocumentTypeLabel(document.file_type)}
                      </CardTitle>
                      <CardDescription
                        style={{
                          color: "rgb(var(--custom-standard-color)/0.7)",
                        }}
                      >
                        {document.file_type_label}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2 text-cStandard">
                    Créé le{" "}
                    {
                      new Date(document.created_at as string)
                        .toISOString()
                        .split("T")[0]
                    }
                  </p>
                  {document.signed_at && (
                    <p className="text-sm mb-2 text-cStandard">
                      Signé le {document.signed_at}
                    </p>
                  )}
                  {document.updated_at && (
                    <p className="text-sm mb-2 text-cStandard">
                      Mis à jour le {document.updated_at}
                    </p>
                  )}
                  {document.is_validate ? (
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className=" bg-cPrimary/90 text-cForeground hover:bg-cPrimaryHover hover:text-cForeground"
                        asChild
                      >
                        <Link
                          className="flex"
                          href={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${document.file_url}`}
                          target="_blank"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          <span>Télécharger</span>
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="lg:px-4 py-1.5 border border-cForeground/20 rounded bg-cForeground/10  text-cStandard/60 text-sm flex">
                      <ClipboardX className="h-4 w-4 mr-2 mt-1" />
                      <span>Document pas encore disponible</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) 
          ) : (
            <div className="text-cStandard/60 text-sm flex">
              <ClipboardX className="h-4 w-4 mr-2 mt-0.5" />
              <span>Vos documents sont encore en cours de validation</span>
            </div>
          )}
        </div>
      </div>
      {/* Section contrat et mandat */}
      <div className="bg-cBackground px-8 py-4 rounded-lg shadow-md mb-8">
        <div className="mb-4 flex items-center font-semibold text-cPrimary/90">
          <FileBadge className="h-5 w-5 mr-2" />
          <h3 className="text-md md:text-xl ">
            Contrat et mandat de prélèvement
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading && <PartialLoading />}
          {contractToSign && contractToSign.length !== 0 ? (
            contractToSign.map((document) => (
              <Card
                key={document.contractFileId}
                className="hover:shadow-lg transition-shadow"
                style={{
                  backgroundColor: "rgb(var(--custom-background-color))",
                  borderColor: "rgb(var(--custom-foreground-color)/0.7)",
                }}
              >
                <CardHeader>
                  <div className="flex items-center text-cPrimary/70">
                    <FileSignature className="h-5 w-5 mr-2" />
                    <div className="">
                      <CardTitle className="text-lg">
                        {document.contractFileTag === "contract"
                          ? "Contrat"
                          : "Mandat de prélèvement"}
                      </CardTitle>
                      <CardDescription
                        style={{
                          color: "rgb(var(--custom-standard-color)/0.7)",
                        }}
                      >
                        {document.contractFileTag === "contract"
                          ? "Contrat de domiciliation"
                          : "Demande de prélèvement"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex-1">
                    <p className="text-sm mb-2 text-cStandard">
                      Créé le{" "}
                      {
                        new Date(document.createdAt as string)
                          .toISOString()
                          .split("T")[0]
                      }
                    </p>
                    {document.isContractSignedByAdmin === false &&
                      document.isContractSignedByUser === true && (
                        <p className="text-sm mb-2 text-cStandard">
                          En attente du signature de l'administrateur
                        </p>
                      )}
                    {document.isContractSignedByAdmin === true &&
                      document.isContractSignedByUser === true && (
                        <p className="text-sm mb-2 text-cStandard">
                          Signé par l'administrateur
                        </p>
                      )}
                  </div>
                  <div className="grid grid-cols-1 md:flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className=" bg-cPrimary/90 text-cForeground hover:bg-cPrimaryHover hover:text-cForeground"
                      asChild
                    >
                      <Link
                        className="flex"
                        href={
                          document.signedUrl
                            ? `${process.env.NEXT_PUBLIC_FILE_BASE_URL}${document.signedUrl}`
                            : `${process.env.NEXT_PUBLIC_FILE_BASE_URL}${document.url}`
                        }
                        target="_blank"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span>Télécharger</span>
                      </Link>
                    </Button>

                    {document.isContractSignedByAdmin === false &&
                      document.isContractSignedByUser === false && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleSign(String(document.contractFileId), "user")
                          }
                          className=" bg-emerald-600 text-cForeground hover:bg-emerald-700 hover:text-cForeground"
                        >
                          {actionLoading ? (
                            <>
                              <LoaderCircle className="h-4 w-4 mr-1 animate-spin" />{" "}
                              En cours
                            </>
                          ) : (
                            <>
                              <Signature className="h-4 w-4 mr-1" />
                              Signer
                            </>
                          )}
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="lg:px-4 py-1.5 border border-cForeground/20 rounded bg-cForeground/10  text-cStandard/60 text-sm flex">
              <ClipboardX className="h-4 w-4 mr-2 mt-1" />
              <span>Vous n'avez pas encore réçu de contrat</span>
            </div>
          )}
        </div>
      </div>
      {/* Tableau de tous les documents */}
      <Card
        style={{
          backgroundColor: "rgb(var(--custom-background-color))",
          borderColor: "rgb(var(--custom-foreground-color)/0.1)",
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center font-semibold text-cPrimary/90">
            <Folders className="h-5 w-5 mr-2" />
            <h3 className="text-md md:text-xl ">Historiques des documents</h3>
          </CardTitle>
          <CardDescription className="hidden md:block">
            <span className="text-cStandard/90">
              Liste complète de tous vos documents contractuels et
              administratifs
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 rounded text-cStandard">
                <TableHead className="text-sm md:text-base">Type</TableHead>
                <TableHead className="text-sm md:text-base">Nom</TableHead>
                <TableHead className="text-sm md:text-base">Création</TableHead>
                {/* <TableHead className="text-sm md:text-base">
                  Signature
                </TableHead>
                <TableHead className="text-sm md:text-base">
                  Mise à jour
                </TableHead> */}
                <TableHead className="text-sm md:text-base">Statut</TableHead>
                <TableHead className="text-sm md:text-base">Remarque</TableHead>
                <TableHead className="text-center text-sm md:text-base">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="flex items-center">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDocumentColor(document.file_type)}`}
                    >
                      {getDocumentIcon(document.file_type)}
                      {getDocumentTypeLabel(document.file_type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-xs md:text-sm text-cStandard/90">
                    {document.file_type_label}
                  </TableCell>
                  <TableCell className="text-xs md:text-sm text-cStandard/90">
                    {/* TODO utiliser datefns pour formater les dates */}
                    {
                      new Date(document.created_at as string)
                        .toISOString()
                        .split("T")[0]
                    }
                  </TableCell>
                  {/* <TableCell className="text-xs md:text-sm text-cStandard/90">
                    {document.signed_at ? (
                      document.signed_at
                    ) : (
                      <X className="w-4 h-4 text-red-500 ml-6" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs md:text-sm text-cStandard/90">
                    {document.updated_at ? (
                      document.updated_at
                    ) : (
                      <X className="w-4 h-4 text-red-500 ml-6" />
                    )}
                  </TableCell> */}
                  <TableCell>
                    {document.is_validate ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Disponible
                      </span>
                    ) : (
                      ""
                    )}
                    {document.is_validate === null && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    )}
                    {document.is_validate == false ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejeté
                      </span>
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-xs md:text-sm text-cStandard/90">
                    {document.note || "Aucune remarque"}
                  </TableCell>
                  <TableCell className=" lg:text-right">
                    {document.is_validate ? (
                      <>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-cPrimary/90 text-cForeground hover:bg-cPrimaryHover hover:text-white"
                            title="Télécharger"
                          >
                            <Link
                              className="flex"
                              href={`${process.env.NEXT_PUBLIC_FILE_BASE_URL}${document.file_url}`}
                              target="_blank"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              <span>Télécharger</span>
                            </Link>
                          </Button>
                        </div>
                      </>
                    ) : document.is_validate == false ? (
                      <SingleFileUpload
                        userId={userId as string}
                        fileType={document.file_type}
                        onSuccess={fetchDocuments}
                      />
                    ) : (
                      <div className="hidden lg:flex justify-end space-x-2">

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="bg-cPrimary/40 text-cForeground hover:bg-cPrimaryHover hover:text-white cursor-not-allowed"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedDoc && (
        <PDFViewer
          fileUrl={`${baseUrl}${selectedDoc.url}`}
          fileType={selectedDoc.type}
          isOpen={pdfOpen}
          setIsOpen={setPdfOpen}
        />
      )}
    </div>
  );
}
