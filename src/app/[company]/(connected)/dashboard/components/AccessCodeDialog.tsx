"use client";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { toast } from "@/src/hooks/use-toast";
import { CheckCircle, Copy } from "lucide-react";
import { useState } from "react";

export default function AccessCodeDialog({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Success",
        description: "Votre code a été copié avec succès.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Une erreur lors de la copie du code.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
        variant="ghost"
          className="bg-cPrimary/60 text-cForeground hover:bg-cPrimaryHover transition mt-4"
          size="sm"
        >
          Code d'accès
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Code d'accès</DialogTitle>
          <DialogDescription>
            Utilisez ce code pour accéder à votre espace réservé
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-mono font-bold text-cPrimary/80 mb-2 tracking-widest">
              {code}
            </div>
            <p className="text-sm text-cStandard/60">
              Votre code d'accès numérique
            </p>
          </div>

          {code && (
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le code
                </>
              )}
            </Button>
          )}

          <div className="text-xs text-cStandard/60 text-center">
            <p>⚠️ Conservez ce code précieusement</p>
            <p>Il vous sera demandé à votre arrivée</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
