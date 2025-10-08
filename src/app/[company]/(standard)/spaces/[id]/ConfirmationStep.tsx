"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CheckCircle, Copy, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Office, ReservationResumeType } from "@/src/lib/type";
import CustomQr, { CustomQrHandle } from "@/src/components/global/CustomQr";

type Props = {
  reservationId?: string;
  accessCode?: string | null;
  accessValidUntil?: Date;
  isExpired?: boolean;
  officeInfo: Office;
  reservationResume?: ReservationResumeType;
};

export default function ConfirmationStep({
  reservationId,
  accessCode,
  accessValidUntil = new Date("2025-07-02T12:00:00"),
  isExpired = true,
  officeInfo,
  reservationResume,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  const dataToQr = [
    `Nom du bureau: ${officeInfo.name}`,
    `Code d access: ${accessCode}`,
    `ID de la reservation: ${reservationId}`,
    `${
      reservationResume?.locationType === "hourly"
        ? `Date: ${reservationResume.dateStart?.toLocaleDateString()}\nDebut: ${
            reservationResume.timeStart
          }\nFin: ${reservationResume.timeEnd}`
        : `Date de debut: ${reservationResume?.dailyDateRange?.from?.toLocaleDateString()}\nDate de fin: ${reservationResume?.dailyDateRange?.to?.toLocaleDateString()}`
    }`,
  ];

  const qrRef = useRef<CustomQrHandle>(null);

  const handleDownload = () => {
    qrRef.current?.download();
  };
  return (
    <div className="max-w-5xl mx-auto py-0 sm:py-8 pt-6 text-cStandard">
      <div className="flex flex-col items-center mb-6  rounded-lg py-4">
        <CheckCircle size={56} className="text-cPrimary/80 rounded-full mb-2" />
        <h2 className="text-2xl font-bold mb-2 text-center">
          Réservation Confirmée !
        </h2>
        <div className="text-cStandard/80 text-center mb-8">
          Votre réservation a été confirmée avec succès.{" "}
          {accessCode
            ? "Vous pouvez accéder à votre espace en utilisant le code ci-dessous."
            : ""}
        </div>
      </div>

      {/* Détails de la réservation */}
      <Card className=" border-0 mb-6" style={{backgroundColor : 'rgb(var(--custom-background-color))', borderColor : 'rgb(var(--custom-foreground-color)/0.1'}}>
        <CardContent className="py-6 px-6 ">
          <div className="">
            <div className="font-semibold mb-2 text-cPrimary py-4">
              Détails de la réservation
            </div>
            <div className="w-full text-cStandard">
              <div className="flex justify-between w-full">
                <div className="text-cStandard/80 ">Espace</div>
                <div> {officeInfo.name} </div>
              </div>
              <div className="flex justify-between">
                <div className="text-cStandard/80 ">
                  {" "}
                  {reservationResume?.locationType === "hourly"
                    ? "Date"
                    : "Date de début"}{" "}
                </div>
                <div>
                  {reservationResume?.locationType === "hourly"
                    ? reservationResume?.dateStart?.toLocaleDateString()
                    : reservationResume?.dailyDateRange?.from
                    ? reservationResume.dailyDateRange.from.toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-cStandard/80 ">
                  {" "}
                  {reservationResume?.locationType === "hourly"
                    ? "Horaires"
                    : "Date de fin"}{" "}
                </div>
                <div>
                  {reservationResume?.locationType === "hourly"
                    ? `${reservationResume.timeStart} - ${reservationResume.timeEnd}`
                    : reservationResume?.dailyDateRange?.to
                    ? reservationResume.dailyDateRange.to.toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-cStandard/80">N° de réservation</div>
                <div>{reservationId}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {accessCode && (
        <Card className="mb-6" style={{backgroundColor : 'rgb(var(--custom-background-color))', borderColor : 'rgb(var(--custom-foreground-color)/0.1'}}>
          <CardContent className="py-8 px-6 pt-4 xl:pt-6 ">
            <div className="text-cStandard">
              <div className="font-bold text-xl mb-4">Votre Code d'Accès</div>
              <div className="bg-cBackground rounded-lg flex flex-col items-center justify-center pb-3 pt-5 md:py-10 mb-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest text-cPrimary mb-2 xl:mb-4">
                  {accessCode.split("").map((char, idx) => (
                    <span key={idx} className="mx-2">
                      {char}
                    </span>
                  ))}
                </div>
                <div className="pb-4 xl:pb-6">
                  <CustomQr
                    ref={qrRef}
                    data={dataToQr}
                    fileName={`${reservationId}`}
                  />
                </div>
                <div className="flex items-center justify-center flex-wrap gap-4 text-cPrimary">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-2 py-1 hover:bg-cPrimaryHover hover:text-cForeground"
                    onClick={handleCopy}
                    type="button"
                  >
                    <Copy size={16} /> {copied ? "Copié !" : "Copier le code"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-2 py-1 hover:bg-cPrimaryHover hover:text-cForeground"
                    type="button"
                    onClick={handleDownload}
                  >
                    <Download size={16} /> Télécharger QR
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-cStandard">
              <div className="flex justify-between">
                <div className="text-cStandard/80">ID de réservation</div>
                <div className="font-medium">{reservationId}</div>
              </div>
              {/* TODO Revérifier les champs après */}
              {/* <div className="flex justify-between">
                <div className="text-cStandard/80">Valide jusqu'au</div>
                <div className="font-medium">
                  {format(accessValidUntil, "dd/MM/yyyy HH:mm:ss")}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-cStandard/80">Temps restant</div>
                <div
                  className={
                    isExpired
                      ? "font-medium text-red-500"
                      : "font-medium text-green-600"
                  }
                >
                  {isExpired ? "Expiré" : "Actif"}
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4 border-0 shadow-none" style={{backgroundColor : 'rgb(var(--custom-background-color))', borderColor : 'rgb(var(--custom-foreground-color)/0.1'}}>
        <CardContent className="py-4 pt-4 px-6 text-cStandard/80">
          <div className="font-semibold mb-2">Informations Importantes</div>
          <ul className="text-cStandard/80 text-xs list-disc pl-5 space-y-1">
            {/* <li>
              Votre code d'accès sera actif 15 minutes avant votre réservation.
            </li>
            <li>Ce code est valable pour une utilisation unique.</li> */}
            <li>
              Pour des raisons de sécurité, ne partagez pas votre code d'accès
              avec d'autres personnes.
            </li>
            <li>Besoin d'aide ? Contactez le support au +33 1 23 45 67 89.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
