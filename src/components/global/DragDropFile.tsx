"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { CloudUpload } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";

export interface DragDropFileRef {
  removeFile: (index: number) => void;
  clearFiles: () => void;
}

interface DragDropFileProps {
  onFileChange: (files: File[]) => void;
  allowedTypes?: {
    pdf?: boolean;
    docx?: boolean;
    image?: boolean;
    [key: string]: boolean | undefined;
  };
}

export default forwardRef(function DragDropFile(
  { onFileChange, allowedTypes }: DragDropFileProps,
  ref: React.Ref<DragDropFileRef>
) {
  const { toast } = useToast();
  const [draggedOver, setDraggedOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Génère dynamiquement la liste MIME des types autorisés
  const getAllowedMimes = () => {
    if (!allowedTypes) return null; // tout est accepté
    const types: string[] = [];
    if (allowedTypes.pdf) {
      types.push("application/pdf");
    }
    if (allowedTypes.docx) {
      types.push(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    }
    if (allowedTypes.image) {
      types.push("image/jpeg", "image/png", "image/jpg");
    }
    return types;
  };

  const allowedMimes = getAllowedMimes();

  const filterFiles = (inputFiles: File[]) => {
    if (!allowedMimes) return inputFiles;
    const filtered = inputFiles.filter((file) => allowedMimes.includes(file.type));
    if (filtered.length === 0) {
      toast({
        title: "Type de fichier non autorisé",
        variant: "destructive",
      });
    }
    return filtered;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    const droppedFiles = filterFiles(Array.from(e.dataTransfer.files));
    if (droppedFiles.length === 0) return;
    setFiles((prev) => [...prev, ...droppedFiles]);
    toast({ title: `${droppedFiles.length} fichier(s) ajouté(s)` });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = filterFiles(Array.from(e.target.files));
    if (selectedFiles.length === 0) return;
    setFiles((prev) => [...prev, ...selectedFiles]);
    toast({ title: `${selectedFiles.length} fichier(s) sélectionné(s)` });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  useImperativeHandle(ref, () => ({
    removeFile,
    clearFiles,
  }));

  useEffect(() => {
    onFileChange(files);
  }, [files]);

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
          draggedOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <CloudUpload className="h-10 w-10 md:h-28 md:w-28 text-indigo-600 " />
          <div className="text-center">
            <div className="md:text-lg font-medium text-cStandard/60 mb-2">
              <div>Glisser-déposer vos fichiers </div>
              <div className="text-sm">
                {allowedTypes
                  ? Object.keys(allowedTypes)
                      .filter((k) => allowedTypes[k])
                      .join(", ")
                  : "Tous types"}
              </div>
            </div>
            <p className="text-xs md:text-sm text-cStandard/60 mb-4 font-bold">
              - OU -
            </p>
            <label className="cursor-pointer">
              <span className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-cPrimaryHover transition-colors inline-block">
                Sélectionner vos fichiers
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={
                  allowedTypes
                    ? Object.keys(allowedTypes)
                        .filter((k) => allowedTypes[k])
                        .map((type) =>
                          type === "pdf"
                            ? ".pdf"
                            : type === "docx"
                            ? ".docx"
                            : type === "image"
                            ? ".jpg,.jpeg,.png"
                            : ""
                        )
                        .join(",")
                    : undefined
                }
                disabled={isUploading}
                multiple
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});
