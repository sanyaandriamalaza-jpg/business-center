'use client';

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import TarifSection from "./tarifSection";
import FormuleSection from "../business-address/formuleSection";
import { CircleQuestionMark, HelpCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

// const offers = [
//   {
//     title: "Espace Coworking",
//     description: "Idéal pour les freelances et les travailleurs nomades",
//     prix: 15,
//     offres: [
//       "Accès à l'espace de coworking",
//       "Wi-Fi haut débit",
//       "Café et thé inclus",
//       "Accès aux espaces communs",
//       "Casiers sécurisés",
//       "Service d'impression (100 pages/mois)",
//     ],
//   },
//   {
//     badge: "Populaire",
//     title: "Bureau Privé",
//     description: "Parfait pour les équipes et les professionnels",
//     prix: 45,
//     offres: [
//       "Bureau privé fermé",
//       "Capacité jusqu'à 4 personnes",
//       "Écran de présentation",
//       "Wi-Fi haut débit",
//       "Café et thé illimités",
//       "Service d'impression illimité",
//       "Climatisation individuelle",
//       "Accès 24/7",
//     ],
//   },
//   {
//     title: "Salle de Réunion",
//     description: "Pour vos réunions et présentations importantes",
//     prix: 35,
//     offres: [
//       "Capacité jusqu'à 10 personnes",
//       "Équipement vidéo complet",
//       "Tableau blanc interactif",
//       "Wi-Fi haut débit",
//       "Service de restauration (en option)",
//       "Configuration flexible de la salle",
//     ],
//   },
// ];

const formules = [
  {
    title: "Basic",
    prix: 49,
    offres: [
      "Adresse professionnelle",
      "Réception du courrier",
      "Notification par email",
      "Accès au scanner(payant)",
      "Support par email",
    ],
  },
  {
    badge: "Premium",
    title: "Premium",
    prix: 99,
    offres: [
      "Tous les avantages Basic",
      "Scan illimité du courrier",
      "Transfert du courrier",
      "Accès aux salles de réunion (2h/mois)",
      "Support prioritaire",
      "Service de notification SMS",
    ],
  },
];

const questions = [
  {
    question: "Comment fonctionne la domiciliation d'entreprise ?",
    answer:
      "La domiciliation vous permet d'utiliser notre adresse comme siège social de votre entreprise. Nous gérons la réception de votre courrier et vous le transmettons selon vos préférences.",
  },
  {
    question: "Quels documents sont nécessaires pour la domiciliation ?",
    answer:
      "Vous devrez fournir une pièce d'identité, un extrait Kbis ou projet de statuts, et un justificatif de domicile personnel. Nous vous guidons tout au long du processus.",
  },
  {
    question: "Comment est géré mon courrier ?",
    answer:
      "Votre courrier est réceptionné et trié quotidiennement. Selon votre formule, nous pouvons le scanner et vous l'envoyer par email ou le transférer à l'adresse de votre choix.",
  },
];

export default function TarifPage() {
  const [tab,setTab] = useState("domiciliation");
  return (
    <div className=" min-h-screen ">
      <div className="max-w-7xl mx-auto mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            Des tarifs adaptés à vos besoins
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez la formule qui vous convient, sans engagement.
          </p>
        </div>
        <div className="flex flex-col gap-4 mb-8">
          <Tabs value={tab} onValueChange={setTab}>
            {/* <TabsList className=" w-full flex justify-center mb-12 rounded-lg bg-transparent">
              <TabsTrigger
                value="espace"
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors  ${tab === "espace" ?"bg-indigo-600 text-white" : "text-gray-700 hover:text-indigo-600"} `}
              >
                Espace de travail{" "}
              </TabsTrigger>
              <TabsTrigger
                value="domiciliation"
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors  ${tab == "domiciliation" ? "bg-indigo-600 text-white" : "text-gray-700 hover:text-indigo-600"}`}
              >
                Domiciliation{" "}
              </TabsTrigger>
            </TabsList> */}
            {/* <TabsContent value="espace">
              <Tabs defaultValue="horraire">
                <TabsList className=" w-full flex justify-center mb-6 rounded-lg bg-transparent">
                  <TabsTrigger
                    value="horraire"
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white`}
                  >
                    Tarifs Horaire
                  </TabsTrigger>
                  <TabsTrigger
                    value="journalier"
                    className="px-6 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-indigo-600"
                  >
                    Tarifs Journalier
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="horraire">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {offers.map((offer) => (
                      <TarifSection
                        key={offer.title}
                        title={offer.title}
                        badge={offer.badge}
                        description={offer.description}
                        prix={offer.prix}
                        offres={offer.offres}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="journalier">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {offers.map((offer) => (
                      <TarifSection
                        key={offer.title}
                        title={offer.title}
                        badge={offer.badge}
                        description={offer.description}
                        prix={offer.prix}
                        offres={offer.offres}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent> */}
            <TabsContent value="domiciliation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {formules.map((formule) => (
                  <FormuleSection
                    key={formule.title}
                    title={formule.title}
                    badge={formule.badge}
                    prix={formule.prix}
                    offres={formule.offres}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {questions.map((q) => (
              <div
                key={q.question}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start">
                  <HelpCircle className="text-indigo-600 w-6 h-6 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {q.question}
                    </h3>
                    <p className="text-gray-600 mt-2">{q.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
