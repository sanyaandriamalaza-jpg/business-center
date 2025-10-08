import { Building2, MapPin } from "lucide-react";
import React from "react";
import Card from "../components/card";

export default function Landing() {
  return (
    <>
      <div className="absolute inset-0 z-2">
        <div className="bg-[url('/officebg.png')] bg-cover bg-center absolute top-0 left-0 right-0 bottom-0 opacity-25 ">
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-to" />
      </div>
      <div className="w-full mx-auto px-4 z-10 text-center ">
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
          La solution parfaite pour votre{" "}
          <span className="text-emerald-400">Entreprise</span>
        </h1>
        <p className="text-xl text-indigo-100 mb-16 max-w-3xl mx-auto md:text-2xl">
          Obtenez une addresse de domiciliation légale et professionnelle pour votre entreprise
        </p>
        <div className=" max-w-4xl mx-auto hover:scale-100">
          {/* <Card
            icon={<Building2 className="text-emerald-400 mb-4 w-12 h-12" />}
            title={"Espaces de travail"}
            description={
              " Bureaux privés, salles de réunion et espaces de coworking équipés et flexibles"
            }
            link={"/"}
            buttonText={"Découvrir les espaces "}
          /> */}
          <Card
            icon={<MapPin className="text-emerald-400 mb-4 w-12 h-12" />}
            title={"Confiez-nous votre entreprise"}
            description={
              "Une adresse professionnelle prestigieuse avec gestion complète de votre courrier."
            }
            link={"/business-address"}
            buttonText={"Voir les Offres"}
          />
        </div>
      </div>
    </>
  );
}
