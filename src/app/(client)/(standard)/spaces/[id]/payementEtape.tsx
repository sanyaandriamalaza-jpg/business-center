"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  espace?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  duration?: number;
  total?: number;
  step: number;
  setStep: (val: number) => void;
};

export default function PaymentStep({
  espace = "Salle de Conférence B",
  date = new Date(),
  startTime = "09:00",
  endTime = "12:00",
  duration = 3,
  total = 105,
  step,
  setStep,
}: Props) {
  // State for payment form (no actual payment processing)
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCVV] = useState("");
  
  const router = useRouter();
  const canContinuePayment = !!(cardNumber && cardHolder && expiry && cvv);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={()=>router.back()} className="hover:bg-transparent hover:text-indigo-700 text-indigo-600 flex items-start">
        <ArrowLeft/>retour à la résevation
      </Button>
      {/* Résumé de la réservation */}
      <Card className="bg-indigo-50 border-0">
        <CardContent className="py-6 px-6 flex flex-col md:flex-row md:justify-between">
          <div>
            <div className="font-bold mb-2 py-4 text-indigo-600">
              Résumé de la réservation
            </div>
            <div className="text-muted-foreground">Espace</div>
            <div className="text-muted-foreground">Date</div>
            <div className="text-muted-foreground">Horaires</div>
            <div className="text-muted-foreground">Durée</div>
            <hr className="my-3" />
            <div className="font-bold text-gray-600">Total</div>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <div className="mb-2">&nbsp;</div>
            <div>{espace}</div>
            <div>{format(date, "EEE d MMM.", { locale: fr })}</div>
            <div>
              {startTime} - {endTime}
            </div>
            <div>
              {duration} {duration > 1 ? "heures" : "heure"}
            </div>
            <hr className="my-3" />
            <div className="font-bold text-[#393385]">{total}€</div>
          </div>
        </CardContent>
      </Card>

      {/* Détails du Paiement */}
      <Card>
        <CardContent className="py-8 px-8">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="text-indigo-900" />
            <span className="font-bold text-lg text-indigo-900 py-4">
              Détails du Paiement
            </span>
          </div>
          <form className="space-y-6" autoComplete="off">
            <div>
              <label className="block font-semibold mb-2 text-sm text-gray-600">
                Numéro de Carte
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                className="bg-[#f8fafc]"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm text-gray-600">
                Titulaire de la Carte
              </label>
              <Input
                type="text"
                placeholder="Jean Dupont"
                className="bg-[#f8fafc]"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block font-semibold mb-2 text-sm text-gray-600">
                  Date d'Expiration
                </label>
                <Input
                type="month"
                  placeholder="MM/AA"
                  maxLength={5}
                  inputMode="numeric"
                  pattern="\d{2}/\d{2}"
                  className="bg-[#f8fafc]"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-2 text-sm text-gray-600">CVV</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="123"
                  className="bg-[#f8fafc]"
                  value={cvv}
                  onChange={(e) => setCVV(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 justify-between mt-4">
              <span className="font-semibold">Montant Total</span>
              <span className="font-bold text-lg text-[#393385]">
                {total.toFixed(2)}€
              </span>
            </div>

            <Button
            variant="ghost"
              className="w-full bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-bold text-lg mt-2"
              onClick={() => setStep(step + 1)}
              disabled={!canContinuePayment}
            >
              Payer Maintenant
            </Button>
          </form>
        </CardContent>
        <div className="px-8 pb-4 text-center text-gray-600 text-xs">
          Vos informations de paiement sont cryptées et sécurisées. Nous ne
          stockons pas les détails de votre carte.
        </div>
      </Card>
    </div>
  );
}
