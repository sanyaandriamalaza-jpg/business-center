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
import { Formule } from "@/src/lib/type";

export default function ActualPlan({
  allPlan,
  currentPlan,
  setCurrentPlan,
  paymentMethod,
  handlePaymentMethod,
}: {
  allPlan: Formule[];
  currentPlan: string;
  setCurrentPlan: (plan: string) => void;
  paymentMethod: string;
  setPaymentMethod: (payement: string) => void;
  handlePaymentMethod: (method: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const handlePlanChange = async (newPlan: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentPlan(newPlan);
    setIsLoading(false);
  };

  const handleAutoRenewalToggle = () => {
    setAutoRenewal(!autoRenewal);
  };

  // TODO: rendre dynamique les noms

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card
        className="lg:col-span-3"
        style={{
          backgroundColor: "rgb(var(--custom-background-color))",
          borderColor: "rgb(var(--custom-foreground-color)/0.1)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-cPrimary/90 text-lg">
            Votre Formule Actuel
          </CardTitle>
          <CardDescription
            className="text-xs sm:text-base"
            style={{
              color: "rgb(var(--custom-standard-color)/0.8)",
            }}
          >
            Gérez votre abonnement et consultez les détails de votre formule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className=" font-medium text-cPrimary/80">
                  {currentPlan === "Premium"
                    ? "Plan Premium"
                    : currentPlan === "Basic"
                      ? "Plan Basic"
                      : "Aucun formule souscrit"}
                </h3>
                <p className="text-xs sm:text-sm text-cForeground">
                  {currentPlan === "Premium"
                    ? "Accès à toutes les fonctionnalités avancées"
                    : currentPlan === "Basic"
                      ? "Parfait pour les petits projets"
                      : "Souscrivez-vous à un de nos formule"}
                </p>
              </div>
              <Badge
                variant={null}
                className="text-sm bg-cPrimary text-cForeground border border-cPrimary py-2"
              >
                {currentPlan === "Premium"
                  ? "99€/mois"
                  : currentPlan === "Basic"
                    ? "49€/mois"
                    : "49€/mois"}
              </Badge>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-cStandard">Votre formule actuelle</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allPlan.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer ${plan.name === currentPlan ? "border-2 border-cPrimary" : ""}`}
                    onClick={() => setConfirmationOpen(true)}
                    style={{
                      backgroundColor: "rgb(var(--custom-background-color))"
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-cStandard">
                        {plan.name}
                      </CardTitle>
                      <CardDescription
                        style={{
                          color: "rgb(var(--custom-standard-color)/0.8)",
                        }}
                      >
                        {plan.monthlyPrice}€/mois
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-cPrimary" />
                            <span className="text-cStandard/70">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    {confirmationOpen === true && plan.name !== currentPlan && (
                      <CardFooter className="flex justify-center">
                        <Button
                          variant="ghost"
                          className="w-full bg-cPrimary text-cForeground hover:text-cForeground hover:bg-cPrimaryHover"
                          disabled={isLoading}
                          onClick={() => {
                            handlePlanChange(plan.name);
                            setConfirmationOpen(false);
                          }}
                        >
                          {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Confirmer le changement
                        </Button>
                      </CardFooter>
                    )}
                    {plan.name === currentPlan && (
                      <CardFooter className="flex justify-center">
                        <Badge
                          variant={null}
                          className="text-md bg-cPrimary text-cForeground border border-cPrimary py-3 px-6 rounded-xl"
                        >
                          Actuel
                        </Badge>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Méthode de paiement */}
      {/* <Card
        style={{
          backgroundColor: "rgb(var(--custom-background-color))",
          borderColor: "rgb(var(--custom-foreground-color)/0.1)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-cPrimary/90 text-lg">
            Méthode de Paiement
          </CardTitle>
          <CardDescription
            style={{
              color: "rgb(var(--custom-standard-color)/0.7)",
            }}
          >
            Mettez à jour votre méthode de paiement et vos préférences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-cStandard">Méthode de paiement</Label>
            <Select value={paymentMethod} onValueChange={handlePaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center text-cForeground/70">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Carte de crédit
                  </div>
                </SelectItem>
                <SelectItem value="paypal">
                  <div className="flex items-center text-cForeground/70">
                    <CreditCard className="h-4 w-4 mr-2" />
                    PayPal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-cStandard">Ajouter une carte</Label>
            <Input
              placeholder="Numéro de carte"
              className="text-cForeground/70"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="MM/AA" className="text-cForeground/70" />
              <Input placeholder="CVV" className="text-cForeground/70" />
            </div>
            <Button
              variant="ghost"
              className="w-full text-cForeground bg-cPrimary/90 hover:bg-cPrimaryHover hover:text-cForeground"
            >
              Ajouter une carte
            </Button>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-renewal" className="text-cStandard/60 text-sm">
              Renouvellement automatique
            </Label>
            <Switch
              id="auto-renewal"
              checked={autoRenewal}
              onCheckedChange={handleAutoRenewalToggle}
            />
          </div>

          <div className="lg:pt-24">
            <Button
              variant="ghost"
              className="w-full bg-cPrimary text-cForeground hover:text-cForeground hover:bg-cPrimaryHover"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour le paiement
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
