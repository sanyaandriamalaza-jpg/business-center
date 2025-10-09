import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ContractType } from "@/src/lib/type";
import { toast } from "@/src/hooks/use-toast";
import { uploadFile } from "@/src/lib/customfunction";

interface fileUploadProps {
  companyId: number;
  userId: string;
  onReload: () => void;
}

export default function AdminContractFileSection({
  companyId,
  userId,
  onReload,
}: fileUploadProps) {
  const [selectedFileType, setSelectedFileType] = useState<ContractType>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);
  const [disabledTypes, setDisabledTypes] = useState<ContractType[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggedOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        toast({
          title: "Type de fichier non supporté",
          description:
            "Veuillez utiliser un fichier PDF, DOC, DOCX, JPG, JPEG ou PNG.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggedOver(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleUpload = async () => {
    if (!uploadedFile || !selectedFileType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de fichier et un fichier.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const apiTag =
        selectedFileType === "compensatory" ? "compensatory" : "contract";
      const res = await uploadFile(uploadedFile, { customFolder: apiTag });

      if (!res.success || !res.path) {
        throw new Error("Erreur lors de l'upload du fichier.");
      }
      const fileUrl = res.path;

      const response = await fetch("/api/contract-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
          tag: apiTag,
          is_signedBy_user: false,
          is_signedBy_admin: false,
          id_basic_user: userId || null,
          id_company: companyId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Succès",
          description: `${selectedFileType === "contract" ? "Contrat" : "Demande de prélèvement"} uploadé avec succès.`,
          variant: "success",
        });

        setDisabledTypes((prev) => [...prev, selectedFileType]);
        setUploadedFile(null);
        setSelectedFileType("");
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de l'envoi du fichier.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload du fichier.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      onReload();
    }
  };

  return (
    <div className="py-4 border-b">
      <div className="flex md:flex-row flex-col gap-4">
        <h2 className="text-cDefaultSecondary-100 text-medium mb-1 md:min-w-fit">
          Contrat / Prélèvement :
        </h2>

        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-type-select" className="text-sm font-medium">
              Type de document
            </Label>
            <Select
              value={selectedFileType}
              onValueChange={(value: ContractType) =>
                setSelectedFileType(value)
              }
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Sélectionner le type de document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="contract"
                  disabled={disabledTypes.includes("contract")}
                >
                  Contrat
                </SelectItem>
                <SelectItem
                  value="compensatory"
                  disabled={disabledTypes.includes("compensatory")}
                >
                  Demande de prélèvement
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedFileType && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {selectedFileType === "contract"
                  ? "Fichier contrat"
                  : "Fichier demande de prélèvement"}
              </Label>

              <div className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${draggedOver ? "border-cPrimary bg-blue-50" : "border-gray-300 hover:border-gray-400"}
                `}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <File className="w-8 h-8 text-cPrimary" />
                        <div className="text-left">
                          <p className="font-medium text-sm">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatFileSize(uploadedFile.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpload();
                          }}
                          disabled={isUploading}
                          className="h-8 text-cForeground bg-cPrimary hover:bg-cPrimaryHover"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3 w-3 mr-1" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-cPrimary/70" />
                      <div>
                        <p className="text-sm font-medium text-neutral-600">
                          Glissez votre fichier ici ou cliquez pour sélectionner
                        </p>
                        <p className="text-xs text-neutral-500">
                          PDF (max. 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
