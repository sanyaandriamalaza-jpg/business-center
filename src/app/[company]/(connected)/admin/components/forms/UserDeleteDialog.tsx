"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { BasicUser } from "@/src/lib/type";
import { useToast } from "@/src/hooks/use-toast";


interface UserDeleteDialogProps {
  user: BasicUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDeleteDialog({
  user,
  open,
  onOpenChange,
}: UserDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/user/basic-user/${user.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.toast({
            title: "Success",
            description: "utilisateur supprimé.",
            variant: "success",
          });
        onOpenChange(false);
      } else {
        toast.toast({
            title: "Error",
            description: "Erreur de la suppression.",
            variant: "destructive",
          });
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.toast({
        title: "Error",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Supprimer l'utilisateur
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-semibold text-destructive mb-2">
              {user.firstName} {user.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              Email: {user.email}
            </p>
            {user.companyName && (
              <p className="text-sm text-muted-foreground">
                Entreprise: {user.companyName}
              </p>
            )}
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Cette action est irréversible. Toutes les données de l'utilisateur 
                seront définitivement supprimées du système.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isLoading ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}