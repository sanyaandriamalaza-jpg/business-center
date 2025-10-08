import { ArrowRight, Building2, Clock, Download, Mail, MapPin } from "lucide-react";
import React from "react";
import ServiceCard from "../../components/serviceCard";
import FormuleSection from "./formuleSection";

const services = [
  {
    title: "Adresse professionnelle",
    description:
      "Utilisez notre adresse prestigieuse comme siège social de votre entreprise. Parfait pour établir une présence professionnelle.",
    icon: <Building2 />,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Gestion du courrier",
    description:
      "Réception et tri professionnel de votre courrier. Notifications instantanées et transfert selon vos préférences.",
    icon: <Mail />,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Numérisation",
    description:
      "Service de scan et d'archivage numérique de vos documents. Accédez à votre courrier où que vous soyez.",
    icon: <Download />,
    color: "bg-amber-100 text-amber-600",
  },
];

const formules = [
  {
    title: "Basic",
    prix: 190000,
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
    prix: 290000,
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

const offres = [
  {
    title: "Emplacement Premium",
    description:
      "Une adresse prestigieuse au cœur des affaires pour valoriser votre image professionnelle.",
    icon: <MapPin />,
    color: "text-indigo-600",
  },
  {
    title: "Gestion en Temps Réel",
    description:
      "Notifications instantanées et accès à vos documents 24/7 via notre plateforme sécurisée.",
    icon: <Clock />,
    color: "text-indigo-600",
  },
  {
    title: "Service Personnalisé",
    description:
      "Une équipe dédiée pour gérer votre courrier selon vos préférences spécifiques.",
    icon: <Mail />,
    color: "text-indigo-600",
  },
];

export default function DomciliationPage() {
  return (
    <div className=" min-h-screen ">
      <div className=" overflow-hidden mb-12">
          <div className="relative h-96 w-full">
            <img
              src="/officebg.png"
              alt="Bureau coworking"
              className="object-cover w-full h-full"
              style={{ filter: "brightness(0.5)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-900/70 flex items-center" />
            <div className="absolute max-3xl inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-white font-bold text-4xl md:text-5xl mb-6">
                Domiciliation d'Entreprise
              </h1>
              <p className="text-indigo-100 text-xl  max-w-3xl mx-auto">
                Une adresse professionnelle prestigieuse pour votre entreprise
                avec des services de gestion de courrier intelligents
              </p>
            </div>
          </div>
        </div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              color={service.color}
            />
          ))}
        </div>
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Nos Formules
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui correspond le mieux à vos besoins.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {formules.map((formule) => (
              <FormuleSection
                key={formule.title}
                badge={formule.badge}
                title={formule.title}
                prix={formule.prix}
                offres={formule.offres}
              />
            ))}
          </div>
        </div>
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-600">
              Des services professionnels pour une image impeccable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offres.map((offre, index) => (
              <ServiceCard
                key={index}
                title={offre.title}
                description={offre.description}
                icon={offre.icon}
                color={offre.color}
              />
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-12 text-center text-white mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Prêt à démarrer ?
        </h2>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
        Rejoignez les entreprises qui font confiance à notre service de domiciliation professionnelle
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <a href="/contact" className="px-8 py-3 bg-white hover:bg-indigo-50 text-indigo-900 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">Nous Contacter</a>
           <a href="/tarifs" className="px-8 py-3 flex flex-row  bg-indigo-600 hover:bg-indigo-700 gap-1 text-white border border-indigo-500 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">Voir les tarifs <ArrowRight/> </a>
        </div>
      </div>
      </div>
    </div>
  );
}
