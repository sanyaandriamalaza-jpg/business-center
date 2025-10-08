import { Loader2, CreditCard, Check } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { useState } from "react";

const basicOffers = [
  "Adresse professionnelle",
  "Réception du courrier",
  "Notification par email",
  "Accès au scanner(payant)",
  "Support par email",
];

const premiumOffers = [
  "Tous les avantages Basic",
  "Scan illimité du courrier",
  "Transfert du courrier",
  "Accès aux salles de réunion (2h/mois)",
  "Support prioritaire",
  "Service de notification SMS",
];

export default function ActualPlan({
  currentPlan,
  setCurrentPlan,
  paymentMethod,
  setPaymentMethod,
  handlePaymentMethod
}: {
  currentPlan: string;
  setCurrentPlan: (plan: string) => void;
  paymentMethod: string;
  setPaymentMethod: (payement: string) => void;
  handlePaymentMethod: (method: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);

  const handlePlanChange = async (newPlan: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentPlan(newPlan);
    setIsLoading(false);
  };

  const handleAutoRenewalToggle = () => {
    setAutoRenewal(!autoRenewal);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-indigo-700 text-lg">
            Votre Formule Actuel
          </CardTitle>
          <CardDescription className="text-xs sm:text-base">
            Gérez votre abonnement et consultez les détails de votre formule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className=" font-medium text-[#341a6f]">
                  {currentPlan === "premium"
                    ? "Plan Premium"
                    : currentPlan === "basic"
                      ? "Plan Basic"
                      : "Aucun formule souscrit"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentPlan === "premium"
                    ? "Accès à toutes les fonctionnalités avancées"
                    : currentPlan === "basic"
                      ? "Parfait pour les petits projets"
                      : "Souscrivez-vous à un de nos formule"}
                </p>
              </div>
              <Badge
                variant={null}
                className="text-sm bg-indigo-800 text-white py-2"
              >
                {currentPlan === "premium"
                  ? "99€/mois"
                  : currentPlan === "basic"
                    ? "49€/mois"
                    : "49€/mois"}
              </Badge>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Changer de formule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer ${currentPlan === "basic" ? "border-2 border-indigo-800" : ""}`}
                  onClick={() => handlePlanChange("basic")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Basic</CardTitle>
                    <CardDescription>49€/mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {basicOffers.map((basic, idx) => (
                        <li key={idx} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          {basic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {currentPlan === "basic" && (
                    <CardFooter className="flex justify-center">
                      <Badge
                        variant={null}
                        className="text-md bg-indigo-800 text-white py-3 px-6 rounded-xl"
                      >
                        Actuel
                      </Badge>
                    </CardFooter>
                  )}
                </Card>

                <Card
                  className={`cursor-pointer ${currentPlan === "premium" ? "border-2 border-indigo-800" : ""}`}
                  onClick={() => handlePlanChange("premium")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Premium</CardTitle>
                    <CardDescription>99€/mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {premiumOffers.map((premium, idx) => (
                        <li key={idx} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          {premium}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {currentPlan === "premium" && (
                    <CardFooter className="flex justify-center">
                      <Badge
                        variant={null}
                        className="text-md bg-indigo-800 text-white py-3 px-6 rounded-xl"
                      >
                        Actuel
                      </Badge>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Méthode de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-700 text-lg">
            Méthode de Paiement
          </CardTitle>
          <CardDescription>
            Mettez à jour votre méthode de paiement et vos préférences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Méthode de paiement</Label>
            <Select
              value={paymentMethod}
              onValueChange={handlePaymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Visa •••• 4242
                  </div>
                </SelectItem>
                <SelectItem value="mastercard">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mastercard •••• 5555
                  </div>
                </SelectItem>
                <SelectItem value="paypal">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    PayPal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ajouter une carte</Label>
            <Input placeholder="Numéro de carte" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="MM/AA" />
              <Input placeholder="CVV" />
            </div>
            <Button
              variant="ghost"
              className="w-full text-white bg-emerald-600 hover:bg-emerald-700 hover:text-white"
            >
              Ajouter une carte
            </Button>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-renewal" className="text-gray-600 text-sm">Renouvellement automatique</Label>
            <Switch
              id="auto-renewal"
              checked={autoRenewal}
              onCheckedChange={handleAutoRenewalToggle}
            />
          </div>

          <div className="lg:pt-24">
            <Button
              variant="ghost"
              className="w-full bg-indigo-800 text-white hover:text-white hover:bg-indigo-900"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour le paiement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
