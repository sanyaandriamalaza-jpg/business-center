import React from "react";
import TestimonialCard from "../components/TestimonialCard";

export default function Testimonials() {


  const list = [
    {
      comment: "Le système deLe système de réservation et d'accès automatisé a complètement transformé notre utilisation des espaces de réunion. Plus de gestion de clés ni de conflits de planning.",
      name: "Marie Laurent",
      job: "PDG, TechStart"
    },
    {
      comment: "Nous apprécions la flexibilité de pouvoir réserver un espace professionnel quand nous en avons besoin, sans nous engager sur un bail à long terme.",
      name: "Thomas Dubois",
      job: "Fondateur, CreativeHub"
    },
    {
      comment: "Les codes d'accès numériques et la facturation automatisée nous font gagner beaucoup de temps. De plus, le chatbot IA est étonnamment utile pour les questions rapides.",
      name: "Sophie Martin",
      job: "Directrice des Opérations, Innovate"
    }
  ]

  return (
    <div className="container mx-auto px-2">
      <div className="w-full mx-auto ">
        <div className="mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ce que Disent Nos Clients</h2>
          <p className="text-base xl:text-xl text-indigo-200">
            {" "}
            Découvrez l'expérience des entreprises qui ont transformé leur façon
            de travailler.{" "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {
            list.map((item, i) => (
              <TestimonialCard
                key={i}
                comment={item.comment}
                name={item.name}
                job={item.job}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}
