import { Building2, CheckCircle, Download, Mail } from "lucide-react";
import React from "react";
import DomiciliationCard from "../components/DomiciliationCard";
import Link from "next/link";

export default function Domiciliation() {

  const domiciliationCardList = [
    {
      icon: <Building2 className="h-8 w-8 " />,
      color: "text-indigo-600 bg-indigo-100",
      title: "Adresse Professionnelle",
      description: "Utilisez notre adresse professionnelle prestigieuse comme siège social de votre entreprise. Parfait pour établir une présence professionnelle."
    },
    {
      icon: <Mail className="h-8 w-8 " />,
      color: "text-emerald-600 bg-emerald-100",
      title: "Gestion du Courrier",
      description: "Reception et tri professionnel de votre courrier. Notifications instantanées et transfert selon vos préférences."
    },
    {
      icon: <Download className="h-8 w-8 " />,
      color: "text-amber-600 bg-amber-100",
      title: "Numérisation",
      description: "Service de scan et d'archivage numérique de vos document. Accédez à votre courrier où que vous soyez."
    }
  ]

  return (
    <div className="container mx-auto px-4 sm:px-16 md:px-4">
      <div className="w-full mx-auto ">
        <div className="mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Domiciliation d'entreprise
          </h2>
          <p className="text-base xl:text-xl text-gray-600 max-w-[768px] mx-auto ">
            Une adresse professionnelle prestigieuse pour votre entreprise avec
            des services de gestion de courrier intelligents
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 xl:gap-8 mb-12">
          {
            domiciliationCardList.map((item, i) => (
              <DomiciliationCard key={i}
                icon={item.icon}
                color={item.color}
                title={item.title}
                description={item.description}
              />
            ))
          }
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 ">
            <div className="p-8 bg-indigo-900 text-white">
              <h3 className="text-2xl font-bold mb-4">Pourquoi nous choisir</h3>
              <ul className=" space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-3" />{" "}
                  Adresse commerciale prestigieuse
                </li>
                <li className="flex items-center">
                  {" "}
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-3" />
                  Gestion professionnel du courrier
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-3" />
                  Notifications en temps réel
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-3" />
                  Service client dédié
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-3" />
                  Accès aux salles de réuninon
                </li>
              </ul>
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Prêt à démarrer ?
              </h3>
              <p className="text-gray-600 mb-6">
                {" "}
                Choisissez parmi nos formules flexibles à partir de 49€/mois
              </p>
              <div className="space-y-4">
                <Link
                  href="/tarifs"
                  className="block w-full text-center bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Voir nos tarifs
                </Link>
                <Link
                  href="/tarifs"
                  className="block w-full text-center bg-gray-100 text-gray-900 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
