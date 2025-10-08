import React from "react";
import { CreditCard, FileCheck2, FileCog, Mailbox, PanelTop } from "lucide-react";
import DynamicBreadcrumb from "./DynamicBreadcrumb";
import StateCards from "./StateCardCommponent";
import FeatureCard from "./FeatureCard";


const cardsData = [
  {
    title: "Souscription en ligne",
    description: "Formulaire complété et validé",
    status: "completed",
  },
  {
    title: "Dépôt des documents",
    description: "Kbis, justificatifs d'identité du gérant, RIB reçus",
    status: "completed",
  },
  {
    title: "Validation des documents",
    description: "Vérification en cours par notre équite",
    status: "in-progress",
  },
];

const StatsData = [
  {
    title: "Envoie des contrats",
    description: "Contrats et mandat de prélèvement à envoyé",
    number: 4,
  },
  {
    title: "Signature électronique",
    description: "Signature des contrats et mandats",
    number: 5,
  },
  {
    title: "Espace client actif",
    description: "Création de votre espace domiciliation",
    number: 6,
  },
];

const Features = [
  {
    icon: Mailbox,
    iconColor: "text-indigo-600 bg-indigo-100",
    title: "Courrier Scannés",
    description: "Consultez le courrier reçu à l'adresse de domiciliation.",
    href: "/domiciliation/Courriers-Scanners",
    isSm: false,
  },
  {
    icon: FileCheck2,
    iconColor: "text-emerald-600 bg-emerald-100",
    title: "Informations contractuelles",
    description:
      "Accès aux documents tels que le contart de domiciliation, factures, attestation de domiciliation, RIB, status, Kbis, etc",
    href: "/domiciliation/contractual-info",
    isSm: true,
  },
  {
    icon: FileCog,
    iconColor: "text-gray-600 bg-gray-100",
    title: "Paramètres génèraux",
    description:
      "Configurez votre adresse de réexpédition de courrier et personnalisez vos préférences liées à votre domiciliation.",
    href: "/domiciliation/general-parameters",
    isSm: true,
  },
  {
    icon: CreditCard,
    iconColor: "text-purple-600 bg-purple-100",
    title: "Factures mensuelles",
    description: "Gérer facilement votre abonnement et suivez vos factures",
    href: "/domiciliation/Facturation",
    isSm: false,
  },
];

export default function DomiciliationWrapper() {
  return (
    <div className="py-4 px-3 md:px-0">
      <DynamicBreadcrumb />
      <div className="py-3 space-y-2 mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800">Domiciliation</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Suivez en temps réel l'etat d'avancement de votre souscription de
          Domiciliation.{" "}
        </p>
      </div>
      <div className="bg-white py-8  w-full rounded-2xl shadow-sm">
        <div className="mb-10 space-y-3">
          <StateCards cards={cardsData} />
          <StateCards cards={StatsData} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:pr-16 md:pl-20">
          <div className="h-1/2 space-y-4">
            <FeatureCard
              icon={Features[0].icon}
              iconColor={Features[0].iconColor}
              title={Features[0].title}
              description={Features[0].description}
              href={Features[0].href}
              isSm={Features[0].isSm}
            />
            <FeatureCard
              icon={Features[2].icon}
              iconColor={Features[2].iconColor}
              title={Features[2].title}
              description={Features[2].description}
              href={Features[2].href}
              isSm={Features[2].isSm}
            />
          </div>
          <div className="h-1/2 space-y-4">
            <FeatureCard
              icon={Features[1].icon}
              iconColor={Features[1].iconColor}
              title={Features[1].title}
              description={Features[1].description}
              href={Features[1].href}
              isSm={Features[1].isSm}
            />
            <FeatureCard
              icon={Features[3].icon}
              iconColor={Features[3].iconColor}
              title={Features[3].title}
              description={Features[3].description}
              href={Features[3].href}
              isSm={Features[3].isSm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
