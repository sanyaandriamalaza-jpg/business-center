"use client";

import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail, MapPin, Phone, Clock, MessageSquare } from "lucide-react";
import { useState } from "react";

// Schéma Zod pour validation
const contactSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Téléphone requis"),
  // service: z.enum(["Espaces de travail", "Domiciliation"]),
  subject: z.string().min(2, "Sujet requis"),
  message: z.string().min(5, "Message requis"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      // service: "Espaces de travail",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitted(true);
    form.reset();
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600">
            Notre équipe est à votre disposition pour répondre à toutes vos
            questions
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className=" bg-white rounded-2xl shadow-md p-8 ">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Envoyez-nous un message
            </h2>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
                autoComplete="off"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre nom"
                            {...field}
                            className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre email"
                            type="email"
                            {...field}
                            className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre numéro"
                            {...field}
                            className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service concerné</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            {...field}
                          >
                            <option>Espaces de travail</option>
                            <option>Domiciliation</option>
                            <option>Autres demande</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sujet</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sujet de votre message"
                          {...field}
                          className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Votre message"
                          rows={5}
                          {...field}
                          className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full mt-4 bg-[#5d40fb] hover:bg-[#4837b1] text-white text-base font-semibold flex items-center justify-center gap-2"
                  disabled={form.formState.isSubmitting}
                >
                  <Mail className="w-5 h-5" />
                  Envoyer le message
                </Button>
                {submitted && (
                  <p className="text-green-600 text-center mt-2">
                    Votre message a été envoyé avec succès.
                  </p>
                )}
              </form>
            </Form>
          </div>

          <div className="flex flex-col gap-6 w-full ">
            <div className="bg-white rounded-xl shadow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nos coordonnées
              </h3>
              <div className="flex items-start mb-4">
                <MapPin className="text-indigo-600 w-5 h-5 mt-1" />
                <div className="ml-4">
                  <h3 className="font-medium">Adresse</h3>
                  <div className="mt-1 text-gray-600 text-sm">
                    Imandry, Carrière arrêt bus 28
                    <br />
                    301 Fianarantsoa, Madagascar
                  </div>
                </div>
              </div>
              <div className="flex items-start mb-4">
                <Phone className="text-indigo-600 w-5 h-5 mt-1" />
                <div className="ml-4">
                  <h3 className="font-medium">Téléphone</h3>
                  <div className="mt-1 text-gray-600 text-sm">
                    +261 38 37 950 53
                  </div>
                </div>
              </div>
              <div className="flex items-start mb-4">
                <Mail className="text-indigo-600 w-5 h-5 mt-1" />
                <div className="ml-4">
                  <h3 className="font-medium">Email</h3>
                  <div className="mt-1 text-gray-600 text-sm">
                    sprayinfo@swbs.com
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="text-indigo-600 w-5 h-5 mt-1" />
                <div className="ml-4">
                  <h3 className="font-medium">Horaires d'ouverture</h3>
                  <div className="mt-1 text-gray-600 text-sm">
                    Lundi - Vendredi : 8h00 - 18h00
                    <br />
                    Samedi : Fermé
                    <br />
                    Dimanche : 14h00 - 17h30
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="bg-white rounded-2xl shadow p-8">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="text-indigo-600 w-5 h-5" />
                <span className="font-bold text-2xl text-gray-900 mb-4">
                  Besoin d'aide ?
                </span>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                Notre équipe de support est disponible pour répondre à toutes
                vos questions concernant nos services d'espaces de travail et de
                domiciliation.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="text-emerald-500 w-5 h-5" />
                  Réponse sous 24h ouvrées
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-emerald-500 w-5 h-5" />
                  Support multilingue
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-emerald-500 w-5 h-5" />
                  Accompagnement personnalisé
                </li>
              </ul>
            </div> */}
          </div>
        </div>
        {/* <div className="bg-black rounded-xl shadow-md overflow-hidden mb-16">
        <iframe width="100%" height="400px" ></iframe>
      </div> */}
      </div>
    </div>
  );
}
