"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import DateSelectionStep from "./DateSelectionStep";
import { InvoiceUserInfo, Office, ReservationResumeType } from "@/src/lib/type";
import PaymentStep from "./PaymentStep";
import ConfirmationStep from "./ConfirmationStep";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react";

const steps = [
  { label: "1.Sélectionner la date et l'heure" },
  { label: "2.Paiement" },
  { label: "3.Confirmation" },
];

export default function ReservationTabs({
  price,
  officeInfo,
}: {
  officeInfo: Office;
  price: {
    hourly?: number | null;
    daily?: number | null;
  };
}) {
  const [step, setStep] = useState(0);
  const [invoiceRef, setInvoiceRef] = useState<string>();
  const [invoiceRefNum, setInvoiceRefNum] = useState<number>();
  const [accessCode, setAccessCode] = useState<string | null>();

  const [reservationResume, setReservationResume] =
    useState<ReservationResumeType>();


  return (
    <div className="w-full mx-auto mb-8">
      <Card
        className="rounded-lg overflow-hidden shadow-md"
        style={{
          backgroundColor: "rgb(var(--custom-background-color), 0.9)",
          borderColor: "rgb(var(--custom-foreground-color)/0.1",
        }}
      >
        <CardHeader className="bg-cPrimary/80 text-cForeground px-6 py-4 text-lg font-bold text-center lg:text-left">
          Réserver cet espace
        </CardHeader>
        <div className="flex flex-col lg:flex-row mb-4 xl:mb-0 ">
          {steps.map((s, i) => (
            <div
              key={i}
              className="w-full flex items-center  border-b border-cStandard/20"
            >
              <span
                className={cn(
                  "px-8 w-full flex-1 text-center text-sm py-2",
                  i === step
                    ? "text-cPrimary/80 border-b-2 border-cPrimaryHover font-medium "
                    : " font-light text-cStandard/80 xl:text-cStandard/60 "
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <DateSelectionStep
          onSaveChange={(
            locationType,
            dateStart,
            timeStart,
            timeEnd,
            dailyDateRange
          ) => {
            setReservationResume({
              locationType,
              dateStart,
              timeStart,
              timeEnd,
              dailyDateRange,
            });
          }}
          price={price}
          setStep={(value) => setStep(value)}
          className={`${step === 0 ? "block" : "hidden"}`}
          officeInfo={officeInfo}
        />
        <CardContent
          className={`px-2 xl:p-8 ${step === 1 ? "block" : "hidden"}`}
        >
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="pt-3">
              <Button
                variant="ghost"
                onClick={() => setStep(0)}
                className="hover:bg-transparent hover:text-cPrimary text-cPrimary/80 flex items-start"
              >
                <ArrowLeft />
                Retour à la réservation
              </Button>
            </div>
            <PaymentStep
              officeInfo={officeInfo}
              reservationResume={reservationResume}
              step={step}
              setStep={(value) => setStep(value)}
              setOfficeReservationInfo={(invoiceRef, invoiceRefNum, code) => {
                setInvoiceRef(invoiceRef);
                setInvoiceRefNum(invoiceRefNum);
                setAccessCode(code);
              }}
            />
          </div>
        </CardContent>
        {step === 2 && (
          <CardContent className="p-2 sm:p-8">
            <ConfirmationStep
              officeInfo={officeInfo}
              reservationResume={reservationResume}
              accessCode={accessCode}
              reservationId={`${invoiceRef}${invoiceRefNum}`}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
