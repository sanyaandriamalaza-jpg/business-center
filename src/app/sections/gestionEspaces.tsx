import React from "react";
import ServiceCard from "../[company]/(client)/components/serviceCard";
import { ArrowRight, CalendarMinus2, LockKeyhole } from "lucide-react";
import Link from "next/link";

export default function GestionEspaces() {
  return (
    <div className="w-full mx-auto px-44">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          La Gestion Intelligente de Votre Espace de Travail
        </h2>
        <p className="text-xl text-gray-600">
          Notre système automatisé s'occupe de tout, de la réservation à la
          facturation
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard icon={<CalendarMinus2 className="h-8 w-8"/>} title="Réservation Facile" color={"text-indigo-600 bg-indigo-100"} description={"Réservez votre espace en quelque seconde avec notre interface de calendrier intuitive. Choisissez parmi les créneaux disponible et confirmez instantanément"} redirect={<Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">Réservez maintenant <ArrowRight className="h-4 w-4 ml-1"/></Link>} />

        <ServiceCard icon={<LockKeyhole className="h-8 w-8"/>} title="Code d'Accès Numériques" color={"text-emerald-600 bg-emerald-100"} description={"Recevez automatiquement des codes sécurisés permettant l'accès sans clé à votre espace réservé à l'heure prévue"} redirect={<Link href="/" className="text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center">Comment ça marche <ArrowRight className="h-4 w-4 ml-1"/></Link>} />
        
        <ServiceCard icon={<CalendarMinus2 className="h-8 w-8"/>} title="Facturation Automatisée" color={"text-amber-600 bg-amber-100"} description={"Obtenez des factures transparentes et instantanées pour vos réservations avec un détail complet des frais et l'historiques de paiements."} redirect={<Link href="/" className="text-amber-600 hover:text-amber-800 font-medium inline-flex items-center">Voir les tarifs <ArrowRight className="h-4 w-4 ml-1"/></Link>} />
      </div>
    </div>
  );
}
