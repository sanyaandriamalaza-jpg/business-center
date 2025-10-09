"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import { Mail, Bell, User, Shield, Calendar, ArrowRight, Scan, Inbox } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import DynamicBreadcrumb from "../DynamicBreadcrumb";

// Schéma de validation
const formSchema = z.object({
    personalInfo: z.object({
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
        email: z.string().email("Email invalide"),
        currentPlan : z.string(),
        planExpiry : z.string()
      }),
    digitalForwarding: z.object({
        email: z.string().email("Email invalide"),
        backupEmail: z.string().email("Email invalide").optional().or(z.literal("")),
        scanQuality: z.enum(["standard", "high", "premium"]),
        notificationPreference: z.enum(["immediate", "daily", "weekly"]),
      }),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
  }),
  mailProcessing: z.object({
    automaticSorting: z.boolean().default(true),
    spamFilter: z.boolean().default(true),
    archiveUnopened: z.boolean().default(false),
  }),
  security: z.object({
    twoFactorAuth: z.boolean().default(false),
    encryptedDelivery: z.boolean().default(true),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function GeneralParameterWrapper() {
  const [clientData, setClientData] = useState<FormValues>({
    personalInfo: {
        name: "Jean Dupont",
        email: "jean.dupont@example.com",
        currentPlan: "Premium",
        planExpiry: "2024-12-31",
      },
    digitalForwarding: {
      email: "jean.pro@example.com",
      backupEmail: "jean.perso@example.com",
      scanQuality: "high",
      notificationPreference: "daily",
    },
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
    mailProcessing: {
      automaticSorting: true,
      spamFilter: true,
      archiveUnopened: false,
    },
    security: {
      twoFactorAuth: false,
      encryptedDelivery: true,
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: clientData
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Paramètres mis à jour:", values);
    setClientData({
      ...clientData,
      ...values,
    });
  };

  return (
    <div className="py-4 px-3 md:px-2 ">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="py-3 space-y-2 mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Paramètres Généraux</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Gérez votre adresse de réexpédition et vos préférences.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-700 md:text-lg flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Adresse de réexpédition
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Configurez comment vous recevez vos courriers numérisés
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="digitalForwarding.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-bold text-sm md:text-base">Email principal</FormLabel>
                    <FormControl>
                      <Input placeholder="votre@email.com" {...field} className="text-sm"/>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Adresse où seront envoyés vos courriers numérisés
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="digitalForwarding.backupEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-bold text-sm md:text-base">Email secondaire (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="backup@email.com" {...field} className="text-sm"/>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Adresse de secours pour la réception
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="digitalForwarding.scanQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-bold text-sm md:text-base">Qualité de numérisation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Sélectionnez une qualité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">
                          <div className="flex items-center">
                            <Scan className="h-4 w-4 mr-2" />
                            Standard (300 DPI)
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center">
                            <Scan className="h-4 w-4 mr-2" />
                            Haute qualité (600 DPI)
                          </div>
                        </SelectItem>
                        <SelectItem value="premium">
                          <div className="flex items-center">
                            <Scan className="h-4 w-4 mr-2" />
                            Premium (1200 DPI + OCR)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Qualité des scans et fonctionnalités supplémentaires
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="digitalForwarding.notificationPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 font-bold text-sm md:text-base">Fréquence de notification</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Sélectionnez une fréquence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immédiate (à réception)</SelectItem>
                        <SelectItem value="daily">Quotidienne (résumé)</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire (résumé)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Quand souhaitez-vous être informé des nouveaux courriers ?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-700 md:text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Préférences de Notification
              </CardTitle>
              <CardDescription className="text-xs md:text-base">
                Choisissez comment vous souhaitez recevoir les alertes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="notificationPreferences.email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email</FormLabel>
                      <FormDescription>
                        Recevoir les notifications par email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notificationPreferences.sms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">SMS</FormLabel>
                      <FormDescription>
                        Recevoir des alertes importantes par SMS
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section Informations du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-700 md:text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-900 font-bold text-sm md:text-base">Nom complet</Label>
                <Input value={clientData.personalInfo.name} disabled className="text-sm"/>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-bold text-sm md:text-base">Email principal</Label>
                <Input value={clientData.personalInfo.email} disabled className="text-sm"/>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-bold text-sm md:text-base">Formule actuelle</Label>
                <Input value={clientData.personalInfo.currentPlan} disabled className="text-sm"/>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-bold text-sm md:text-base">Date d'expiration</Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input value={new Date(clientData.personalInfo.planExpiry).toLocaleDateString()} disabled className="text-sm"/>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="ghost" className="mr-2 bg-indigo-800 text-white hover:text-white hover:bg-indigo-700">
                Changer de mot de passe
              </Button>
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="ghost" className="mr-2 bg-indigo-800 text-white hover:text-white hover:bg-indigo-700">
              Enregistrer les modifications <ArrowRight className="h-4 w-4 ml-2 hidden md:block" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}