"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CheckCircle, Copy, Download } from "lucide-react";
import { format } from "date-fns";
import {fr} from "date-fns/locale/fr";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  espace?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  reservationId?: string;
  accessCode?: string;
  accessValidUntil?: Date;
  isExpired?: boolean;
  step: number;
};

export default function ConfirmationStep({
  espace = "Salle de Conférence B",
  date = new Date("2025-07-02"),
  startTime = "09:00",
  endTime = "12:00",
  reservationId = "RES-465283",
  accessCode = "891024",
  accessValidUntil = new Date("2025-07-02T12:00:00"),
  isExpired = true,
  step
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Button variant="ghost" onClick={()=>router.back()} className="hover:bg-transparent hover:text-indigo-700 text-indigo-600 flex items-start">
        <ArrowLeft/>Retour 
      </Button>
      <div className="flex flex-col items-center mb-6  rounded-lg py-4">
        <CheckCircle size={56} className="text-green-500 rounded-full mb-2" />
        <h2 className="text-2xl font-bold mb-2 text-center">Réservation Confirmée !</h2>
        <div className="text-muted-foreground text-center mb-8">
          Votre réservation a été confirmée avec succès. Vous pouvez accéder à votre espace en utilisant le code ci-dessous.
        </div>
      </div>
      
      {/* Détails de la réservation */}
      <Card className="bg-indigo-50 border-0 mb-6">
        <CardContent className="py-6 px-6 flex flex-col md:flex-row md:justify-between">
          <div>
            <div className="font-semibold mb-2 text-indigo-800 py-4">Détails de la réservation</div>
            <div className="text-muted-foreground">Espace</div>
            <div className="text-muted-foreground">Date</div>
            <div className="text-muted-foreground">Horaires</div>
            <div className="text-muted-foreground">N° de réservation</div>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <div className="mb-2">&nbsp;</div>
            <div>{espace}</div>
            <div>
              {format(date, "EEE d MMM.", { locale: fr })}
            </div>
            <div>
              {startTime} - {endTime}
            </div>
            <div>
              {reservationId}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code d'accès */}
      <Card className="mb-6">
        <CardContent className="py-8 px-6">
          <div className="font-bold text-xl mb-4">Votre Code d'Accès</div>
          <div className="bg-[#f2f6ff] rounded-lg flex flex-col items-center justify-center py-10 mb-4">
            <div className="text-3xl md:text-4xl font-bold tracking-widest text-[#393385] mb-4">
              {accessCode.split("").map((char, idx) => (
                <span key={idx} className="mx-2">{char}</span>
              ))}
            </div>
            <div className="flex gap-4 text-[#393385]">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-2 py-1"
                onClick={handleCopy}
                type="button"
              >
                <Copy size={16} /> {copied ? "Copié !" : "Copier le code"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-2 py-1"
                type="button"
              >
                <Download size={16} /> Télécharger QR
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <span className="text-muted-foreground">ID de réservation</span>
              <span className="text-muted-foreground">Valide jusqu'au</span>
              <span className="text-muted-foreground">Temps restant</span>
            </div>
            <div>
            <div className="font-medium">{reservationId}</div>
              <div className="font-medium">
                {format(accessValidUntil, "dd/MM/yyyy HH:mm:ss")}
              </div>
              <div className={isExpired ? "font-medium text-red-500" : "font-medium text-green-600"}>
                {isExpired ? "Expiré" : "Actif"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 border-0 shadow-none">
        <CardContent className="py-4 px-6">
          <div className="font-semibold mb-2">Informations Importantes</div>
          <ul className="text-muted-foreground text-xs list-disc pl-5 space-y-1">
            <li>Votre code d'accès sera actif 15 minutes avant votre réservation.</li>
            <li>Ce code est valable pour une utilisation unique.</li>
            <li>Pour des raisons de sécurité, ne partagez pas votre code d'accès avec d'autres personnes.</li>
            <li>Besoin d'aide ? Contactez le support au +33 1 23 45 67 89.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}