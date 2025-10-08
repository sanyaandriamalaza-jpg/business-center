"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Upload, X, File, CheckCircle, Send } from "lucide-react";
import { UploadClient } from "@/src/lib/customClass";
import { uploadFile } from "@/src/lib/customfunction";

type FileType = "kbis" | "status" | "identity" | "rib";

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

interface UploadStatus {
  type: "success" | "error" | null;
  message: string;
}

const SingleFileUpload = ({
  userId,
  fileType,
  onSuccess,
}: {
  userId: string;
  fileType: FileType | string ;
  onSuccess?: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    type: null,
    message: "",
  });
  const [draggedOver, setDraggedOver] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const uploadClient = new UploadClient();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const droppedFiles = e.dataTransfer.files;

    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      setFile(droppedFile);
      setUploadStatus({ type: null, message: "" });

      console.log(`Fichier "${droppedFile.name}" sélectionné`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus({ type: null, message: "" });
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus({ type: null, message: "" });
  };

  const uploadFileToServer = async (
    fileToUpload: File,
    fileType: FileType
  ): Promise<string> => {
    try {
      const response = await uploadFile(fileToUpload, { customFolder: fileType });
  
      if (response.success && response.path) {
        return response.path;
      } else {
        throw new Error(response.error || "Erreur lors de l'upload du fichier");
      }
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload du fichier"
      );
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setUploadStatus({
        type: "error",
        message: "Veuillez sélectionner un fichier avant de soumettre.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      setUploadStatus({
        type: null,
        message: "Upload en cours...",
      });

      // Upload du fichier
      const fileUrl = await uploadFileToServer(file, fileType as FileType);

      setUploadStatus({
        type: null,
        message: "Enregistrement du fichier...",
      });

      const response = await fetch("/api/upload-file-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_url: fileUrl,
          file_name: file.name,
          file_type: fileType,
          id_basic_user: userId,
        }),
      });

     
      const result: UploadResponse = await response.json();

      if (result.success) {
        setUploadStatus({
          type: "success",
          message: "Fichier uploadé avec succès !",
        });

        setTimeout(() => {
          setFile(null);
          setUploadStatus({ type: null, message: "" });
          setIsOpen(false);
        }, 2000);

        onSuccess?.();
      } else {
        throw new Error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      setUploadStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="bg-cPrimary/90 text-cForeground hover:bg-cPrimaryHover hover:text-white"
          title="Renvoyé"
        >
          <Send className="w-4 h-4 mr-2" />
          Renvoyer le fichier
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-cBackground border border-cBackground">
        <DialogHeader>
          <DialogTitle className="text-cPrimary/70">
            Upload de fichier
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone de drop */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${
                draggedOver
                  ? "border-cPrimary bg-cPrimary/80"
                  : "border-neutral-300 hover:border-neutral-400"
              }
            `}
          >
            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <File className="w-8 h-8 text-cPrimary" />
                  <div className="text-left">
                    <p className="font-medium text-sm text-cDefaultSecondary-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-cDefaultSecondary-200">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-cDefaultPrimary-200" />
                <p className="text-sm text-cStandard/70">
                  Glissez-déposez votre fichier ici ou{" "}
                  <label className="text-cPrimary cursor-pointer hover:text-cPrimaryHover">
                    cliquez pour sélectionner
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                    />
                  </label>
                </p>
                <p className="text-xs text-neutral-400">
                  PDF, Images, Documents (max 10MB)
                </p>
              </div>
            )}
          </div>

          {uploadStatus.message && (
            <div
              className={`
              p-3 rounded-lg text-sm flex items-center space-x-2
              ${
                uploadStatus.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : uploadStatus.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
              }
            `}
            >
              {uploadStatus.type === "success" && (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{uploadStatus.message}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
              className="text-red-600"
            >
              Annuler
            </Button>
            <Button
              variant="ghost"
              className="bg-cPrimary hover:bg-cPrimaryHover text-cForeground hover:text-cForeground"
              onClick={handleSubmit}
              disabled={!file || isUploading}
            >
              {isUploading ? "Upload en cours..." : "Uploader"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SingleFileUpload;
