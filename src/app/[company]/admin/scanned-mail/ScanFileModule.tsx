"use client";
import DragDropFile, {
  DragDropFileRef,
} from "@/src/components/global/DragDropFile";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
import {
  formatDateFr,
  formatFileSize,
  generateId,
  uploadFile,
} from "@/src/lib/customfunction";
import {
  AnalyzedFileResponse,
  ApiResponse,
  ReceivedFile,
} from "@/src/lib/type";
import { useAdminStore } from "@/src/store/useAdminStore";
import { FileText, Trash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileScannedArray } from "./FileScannedArray";
import PartialLoading from "@/src/components/global/PartialLoading";
import LoadingIa from "./LoadingIa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import SendFileScannedForm from "./SendFileScannedForm";

export default function ScanFileModule() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzeLoading, setAnalyzeLoading] = useState<boolean>(false);

  const [fileAnalized, setFileAnalyzed] = useState<AnalyzedFileResponse>();
  const [receivedFile, setReceivedFile] = useState<ReceivedFile[]>([]);
  const [currentAnalyzedFile, setCurrentAnalyzedFile] =
    useState<ReceivedFile>();
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const dragDropRef = useRef<DragDropFileRef>(null);

  const { toast } = useToast();

  const analyzeFile = async (fileUrl: string) => {
    setAnalyzeLoading(true);

    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_PARSING_FILE}/parse-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: `${process.env.NEXT_PUBLIC_FILE_BASE_URL}${fileUrl}`,
        }),
      }
    );
    const uploadDataRes = await uploadRes.json();
    const text = uploadDataRes.text;

    if (text) {
      const analyzeRes = await fetch("/api/analyze-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data: ApiResponse<AnalyzedFileResponse> = await analyzeRes.json();
      setFileAnalyzed(data.data);
    } else {
      toast({
        title: "Fichier non analysé",
        description: "Le fichier n‘a pas pu être analysé.",
        variant: "success",
      });
    }
    setDialogVisible(true);
    setAnalyzeLoading(false);
  };

  const adminCompany = useAdminStore((state) => state.adminCompany);
  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  useEffect(() => {
    if (!dialogVisible) {
      setFileAnalyzed(undefined);
      setCurrentAnalyzedFile(undefined);
    }
  }, [dialogVisible]);

  const uploadFiles = async () => {
    try {
      setIsGeneralLoadingVisible(true);

      if (files.length === 0 || !adminCompany) {
        toast({
          title: "Erreur",
          description: "Aucun fichier ou entreprise non définie",
          variant: "destructive",
        });
        return;
      }

      const uploadResults = await Promise.all(
        files.map((file) => {
          const fullName = file.name;
          const lastDotIndex = fullName.lastIndexOf(".");
          const nameNoExt =
            lastDotIndex > 0 ? fullName.slice(0, lastDotIndex) : fullName;
          return uploadFile(file, {
            customFileName: `${generateId(nameNoExt)}_${Date.now()}`,
            customFolder: "scanned_letter",
          });
        })
      );

      const urls = uploadResults
        .map((res) => res?.path)
        .filter((url): url is string => Boolean(url));

      if (urls.length === 0) {
        toast({
          title: "Erreur",
          description: "Échec de l'upload des fichiers",
          variant: "destructive",
        });
        return;
      }

      const insertResults = await Promise.all(
        urls.map((url) =>
          fetch(`/api/received-file`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_url: url,
              id_company: adminCompany.id,
            }),
          }).then((res) => res.json())
        )
      );

      const hasError = insertResults.some((res) => !res.success);

      toast({
        title: hasError ? "Erreur partielle" : "Succès",
        description: hasError
          ? "Certains fichiers n'ont pas pu être enregistrés"
          : "Tous les fichiers ont été enregistrés avec succès",
        variant: hasError ? "destructive" : "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsGeneralLoadingVisible(false);
      dragDropRef.current?.clearFiles();
      fetchScannedLetter();
    }
  };
  const fetchScannedLetter = useCallback(async () => {
    if (adminCompany) {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/received-file?id_company=${adminCompany.id}`
        );
        const data: ApiResponse<ReceivedFile[] | null> = await res.json();
        if (data.success && data.data) {
          setReceivedFile(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  }, [adminCompany]);

  useEffect(() => {
    fetchScannedLetter();
  }, [fetchScannedLetter]);

  return (
    <>
      <div className="space-y-10">
        <div className="space-y-1">
          <h1 className="text-lg xl:text-2xl font-bold text-gray-900">
            Scan de documents par IA
          </h1>
          <p className="text-xs">
            Numérisez et analysez vos documents en un instant grace à l'IA, pour
            un traitement rapide, precis et sans ettort.
          </p>
        </div>
        <div className="grid grid-cols-12 gap-4 mt-8">
          <div className="col-span-12 md:col-span-6">
            <div>
              <DragDropFile
                allowedTypes={{ pdf: true, docx: false }}
                ref={dragDropRef}
                onFileChange={(files) => {
                  setFiles(files);
                }}
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 ">
            <div className="space-y-2 xl:ml-12">
              <h2 className="font-bold text-xl">
                Fichier{files.length > 1 ? "s" : ""} ajouté
                {files.length > 1 ? "s" : ""}
              </h2>
              <div className="space-y-1">
                {files.length === 0 ? (
                  <p className="text-sm italic text-center">
                    Veuillez glisser-déposer un fichier pour scanner vos
                    documents.
                  </p>
                ) : (
                  files.map((file, i) => {
                    return (
                      <div
                        key={i}
                        className="bg-white rounded-lg p-4 flex justify-between"
                      >
                        <div className="flex items-center  gap-2">
                          <div>
                            <FileText />
                          </div>
                          <div>
                            <div className="font-semibold">{file.name}</div>
                            <div className="text-sm">
                              Taille du fichier :{" "}
                              {formatFileSize(file.size)}{" "}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Button
                            onClick={() => {
                              dragDropRef.current?.removeFile(0);
                            }}
                            size={"icon"}
                            variant={"ghost"}
                            className="bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600"
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {files.length > 0 && (
                <div className="">
                  <Button
                    variant={"ghost"}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                    onClick={uploadFiles}
                  >
                    Ajouter dans la liste d‘attente
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md space-y-2">
          <h2 className="font-bold text-xl">Liste de tous les courriers</h2>
          {loading ? (
            <PartialLoading />
          ) : (
            <FileScannedArray
              data={receivedFile}
              scanFileUrl={(fileUrl, receivedFile) => {
                analyzeFile(fileUrl);
                setCurrentAnalyzedFile(receivedFile);
              }}
              viewAnalyzedFile={(receivedFile) => {
                setCurrentAnalyzedFile(receivedFile);
                setFileAnalyzed({
                  destinataire: receivedFile.recipient_name,
                  email: receivedFile.recipient_email,
                  expediteur: receivedFile.received_from_name,
                  objet: receivedFile.courriel_object,
                  resume: receivedFile.resume,
                });
                setDialogVisible(true);
              }}
            />
          )}
        </div>
      </div>
      {analyzeLoading && (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/80 backdrop-blur-sm z-[99] flex items-center justify-center">
          <div className="w-[90px] aspect-square">
            <LoadingIa />
          </div>
        </div>
      )}
      {currentAnalyzedFile && adminCompany && (
        <Dialog onOpenChange={setDialogVisible} open={dialogVisible}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fichier analysé</DialogTitle>
              <DialogDescription>
                Les éléments suivants sont analysés à l’aide d’une IA. Certaines
                informations peuvent être erronées.
              </DialogDescription>
            </DialogHeader>
            <div>
              <SendFileScannedForm
                initialData={fileAnalized}
                receivedFile={currentAnalyzedFile}
                onComplete={() => {
                  setDialogVisible(false);
                  fetchScannedLetter();
                }}
                companyName={adminCompany?.name}
                companyEmail={adminCompany?.email ?? null}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
