"use client";

import { useEffect, useState } from "react";

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
import { baseUrl } from "@/src/lib/utils";
import { Formule, Invoice } from "@/src/lib/type";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";

export default function FacturationWrapper() {
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState("");
  const [planData, setPlanData] = useState<Formule[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [invoiceData, setInvoiceData] = useState<Invoice>();
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const userId =
    session?.user.profileType === "basicUser" ? session.user.id : null;

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/virtual-office-offer`);
      const result = await response.json();

      if (result.success) {
        const allOffers = (await result.success) ? result.data : null;
        setPlanData(allOffers);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des formules:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      console.log("dans fetch :", userId);
      const response = await fetch(
        `/api/invoice/single?id_basic_user=${userId}`
      );
      const result = await response.json();
      console.log(result);

      if (!result.success) {
        throw new Error(
          result.message || "Erreur lors de la récupération des données"
        );
      }

      const invoice = result.data;

      setInvoiceData(invoice[0]);
      setCurrentPlan(invoice[0].virtualOfficeOffer.name);
      setPaymentMethod(invoice[0].paymentMethod);
    } catch (error) {
      console.error("Erreur lors de la récupération des factures:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPlans();
      fetchInvoices();
    }
  }, [session]);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const cancelSubscription = async (invoiceId: number) => {
    try {
      const response = await fetch(
        `/api/invoice/single/${invoiceId}/update-reservation?status=canceled`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();
      console.log("Résultat annulation :", result);

      if (!result.success) {
        throw new Error(result.message || "Impossible d'annuler l'abonnement.");
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'abonnement :", error);
      return { success: false, message: (error as Error).message };
    }
  };

  return (
    <div className="py-4 px-4 container mx-auto ">
      <div className="py-3 space-y-2 mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-cStandard">
          Factures mensuelles
        </h2>
        <p className="text-cStandard/60 text-sm md:text-base">
          Gérer facilement votre abonnement et suivez en temps réel vos factures
        </p>
      </div>

      <ActualPlan
        allPlan={planData}
        currentPlan={currentPlan}
        setCurrentPlan={setCurrentPlan}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handlePaymentMethod={handlePaymentMethodChange}
      />

      <FacturationTable userId={userId as string} />

      {/* Prochaine facturation */}
      {/* <Card
        className="mt-6"
        style={{
          backgroundColor: "rgb(var(--custom-background-color))",
          borderColor: "rgb(var(--custom-foreground-color)/0.1)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-cPrimary/90 text-lg">
            Prochaine Facturation
          </CardTitle>
          <CardDescription
            style={{
              color: "rgb(var(--custom-standard-color)/0.7)",
            }}
          >
            Détails de votre prochain paiement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:flex items-center justify-between">
            <div className="flex items-center justify-between md:block">
              <p className="text-sm md:text-md text-cStandard">
                Date de facturation
              </p>
              <p className="font-medium text-cPrimary/70">
                {invoiceData?.startSubscription
                  ? new Date(
                      new Date(invoiceData?.startSubscription).getTime() +
                        1 * 30 * 24 * 60 * 60 * 1000
                    )
                      .toISOString()
                      .split("T")[0]
                  : new Date().toISOString().split("T")[0]}
              </p>
            </div>
            <Tally1 className="h-5 w-5 text-cStandard hidden md:block" />
            <div className="flex items-center justify-between md:block">
              <p className="text-sm md:text-md text-cStandard">Montant €</p>
              <p className="font-medium text-cPrimary/70">
                {invoiceData?.amount}€
              </p>
            </div>
            <Tally1 className="h-5 w-5 text-cStandard hidden md:block" />
            <div className="flex items-center justify-between md:block">
              <p className="text-sm md:text-md text-cStandard">Méthode</p>
              <p className="font-medium text-cPrimary/70">
                {paymentMethod === "card" ? "Carte bancaire" : "PayPal"}
              </p>
            </div>
          </div>
        </CardContent>
        {invoiceData?.subscriptionStatus === "canceled" ? (
          <CardFooter className="md:flex justify-end mt-5">
            <Button
              variant="ghost"
              className="mr-2 bg-red-600 hover:bg-red-700 focus:ring-red-600 text-cForeground hover:text-cForeground"
            >
              Abonnement annulé
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="grid grid-cols-1 gap-3 md:flex justify-end mt-5">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => setAlertOpen(true)}
            >
              Annuler l'abonnement
            </Button>
            <Button
              variant="ghost"
              className="text-cForeground bg-cPrimary/90 hover:bg-cPrimaryHover hover:text-cForeground"
            >
              Mettre à jour le paiement
            </Button>
          </CardFooter>
        )}
      </Card> */}
      {alertOpen && (
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer l’annulation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir annuler votre abonnement ? <br />
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAlertOpen(false)}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancelSubscription(Number(invoiceData?.id))}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-cForeground hover:text-cForeground"
              >
                {loading ? "Annulation..." : "Confirmer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
