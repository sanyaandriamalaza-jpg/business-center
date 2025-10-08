"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import {
  Mail,
  Bell,
  User,
  Shield,
  Calendar,
  ArrowRight,
  Scan,
  Inbox,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Label } from "@/src/components/ui/label";
import { useSession } from "next-auth/react";
import { useToast } from "@/src/hooks/use-toast";

// Schéma de validation
const formSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    currentPlan: z.string(),
    startSubscription: z.string(),
    planExpiry: z.string(),
  }),
});

type FormValues = z.infer<typeof formSchema>;


export default function GeneralParameterWrapper() {
  const [clientData, setClientData] = useState<FormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const {data : session, status} = useSession();
  const {toast} = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalInfo: {
        name: "",
        email: "",
        currentPlan: "",
        startSubscription: "",
        planExpiry: "",
      }
    },
  });

  const userId =
  session?.user.profileType === "basicUser" ? session.user.id : null;

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/invoice/single?id_basic_user=${userId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la récupération des données");
      }

      const invoice = result.data[0];
      setInvoiceData(invoice);

      const mappedData: FormValues = {
        personalInfo: {
          name: `${invoice.user?.firstName} ${invoice.user?.name}`,
          email: invoice.user?.email,
          currentPlan: invoice.virtualOfficeOffer?.name || "Plan Standard",
          startSubscription: invoice.startSubscription ? new Date(invoice.startSubscription).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          planExpiry: invoice.startSubscription ? 
            new Date(new Date(invoice.startSubscription).getTime() + ( 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
        },
      //   digitalForwarding: {
      //     email: invoice.user?.email,
      //     backupEmail: "",
      //     scanQuality: "high" as const,
      //     notificationPreference: "daily" as const,
      //   },
      //   notificationPreferences: {
      //     email: true,
      //     sms: false,
      //     push: true,
      //   },
      //   mailProcessing: {
      //     automaticSorting: true,
      //     spamFilter: true,
      //     archiveUnopened: false,
      //   },
      //   security: {
      //     twoFactorAuth: false,
      //     encryptedDelivery: true,
        // },
      };

      setClientData(mappedData);
      form.reset(mappedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      setError(errorMessage);
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
  
    if (status === "authenticated" && userId) {
      fetchInvoiceData();
    } else {
      setError("Utilisateur non connecté ou ID invalide");
      setIsLoading(false);
    }
  }, [status, userId]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);
      
      console.log("Paramètres mis à jour:", values);
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setClientData(values);
      
      // toast.success("Paramètres mis à jour avec succès");
      
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      // toast.error("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="py-4 px-4 mx-auto container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-cPrimary" />
            <p className="text-cStandard/60">Chargement des paramètres...</p>
          </div>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="py-4 px-4 mx-auto container ">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="py-3 space-y-2 mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-cStandard">
            Paramètres Généraux
          </h1>
          <p className="text-cStandard/60 text-sm md:text-base">
            Les information généraux sur votre domiciliation.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section Informations du compte */}
          <Card
            style={{
              backgroundColor: "rgb(var(--custom-background-color))",
              borderColor: "rgb(var(--custom-foreground-color)/0.1)",
            }}
          >
            <CardHeader>
              <CardTitle className="text-cPrimary80 md:text-lg flex items-center text-cPrimary">
                <User className="h-5 w-5 mr-2" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-cStandard font-bold text-sm md:text-base">
                  Nom complet
                </Label>
                <Input
                  value={clientData?.personalInfo.name || ""}
                  className="text-sm text-cStandard/70"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cStandard font-bold text-sm md:text-base">
                  Email 
                </Label>
                <Input
                  value={clientData?.personalInfo.email || ""}
                  className="text-sm text-cStandard/70"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-cStandard font-bold text-sm md:text-base">
                  Formule actuelle
                </Label>
                <Input
                  value={clientData?.personalInfo.currentPlan || ""}
                  disabled
                  className="text-sm text-cStandard/70"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cStandard font-bold text-sm md:text-base">
                  Début d'abonnement
                </Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-cStandard/70" />
                  <Input
                    value={
                      clientData?.personalInfo.startSubscription
                        ? new Date(clientData.personalInfo.startSubscription).toLocaleDateString()
                        : ""
                    }
                    disabled
                    className="text-sm text-cStandard/70"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-cStandard font-bold text-sm md:text-base">
                  Date de renouvellement
                </Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-cStandard/70" />
                  <Input
                    value={
                      clientData?.personalInfo.planExpiry
                        ? new Date(clientData.personalInfo.planExpiry).toLocaleDateString()
                        : ""
                    }
                    disabled
                    className="text-sm text-cStandard/70"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="ghost"
                className="mr-2 bg-cPrimary text-cForeground hover:text-cForeground hover:bg-cPrimaryHover"
              >
                Changer de mot de passe
              </Button>
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="ghost"
              disabled={isSaving}
              className="mr-2 bg-cPrimary text-cForeground hover:text-cForeground hover:bg-cPrimaryHover"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  Enregistrer les modifications
                  <ArrowRight className="h-4 w-4 ml-2 hidden md:block" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}