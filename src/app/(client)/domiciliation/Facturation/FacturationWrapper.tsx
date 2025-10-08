"use client";

import { useState } from "react";

import { Tally1 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import ActualPlan from "./ActualPlan";
import FacturationTable from "./FacturationTable";
import DynamicBreadcrumb from "../(domiciliation)/DynamicBreadcrumb";

export default function FacturationWrapper() {
  const [currentPlan, setCurrentPlan] = useState("premium");

  const [paymentMethod, setPaymentMethod] = useState("visa");

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  return (
    <div className="py-4 px-3 md:px-2 ">
      <DynamicBreadcrumb />
      <div className="py-3 space-y-2 mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800">
          Factures mensuelles
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Gérer facilement votre abonnement et suivez en temps réel vos factures
        </p>
      </div>

      <ActualPlan
        currentPlan={currentPlan}
        setCurrentPlan={setCurrentPlan}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handlePaymentMethod={handlePaymentMethodChange}
      />

      <FacturationTable />

      {/* Prochaine facturation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-indigo-700 text-lg">
            Prochaine Facturation
          </CardTitle>
          <CardDescription>Détails de votre prochain paiement.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:flex items-center justify-between">
            <div className="flex items-center justify-between md:block">
              <p className="text-sm md:text-md text-gray-800">Date de facturation</p>
              <p className="font-medium text-[#341a6f]">15 Fév 2024</p>
            </div>
            <Tally1 className="h-5 w-5 text-gray-800 hidden md:block" />
            <div className="flex items-center justify-between md:block">
              <p className="text-sm md:text-md text-gray-800">Montant</p>
              <p className="font-medium text-[#341a6f]">
                {currentPlan === "pro"
                  ? "29€"
                  : currentPlan === "starter"
                    ? "19€"
                    : "99€"}
              </p>
            </div>
            <Tally1 className="h-5 w-5 text-gray-800 hidden md:block" />
            <div className="flex items-center justify-between md:block">
              <p className="text-sm md:text-md text-gray-800">Méthode</p>
              <p className="font-medium text-[#341a6f]">
                {paymentMethod === "visa"
                  ? "Visa •••• 4242"
                  : paymentMethod === "mastercard"
                    ? "Mastercard •••• 5555"
                    : "PayPal"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-1 gap-3 md:flex justify-end mt-5">
          <Button variant="outline" className="mr-2">
            Annuler l'abonnement
          </Button>
          <Button
            variant="ghost"
            className="text-white bg-indigo-800 hover:bg-indigo-700 hover:text-white"
          >
            Mettre à jour le paiement
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
