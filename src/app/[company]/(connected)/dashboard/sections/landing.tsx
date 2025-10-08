import { Building2, MapPin } from "lucide-react";
import React from "react";
// import CardComponent from "../components/Card";


export default function Landing() {

  const featuresList = [
    {
      icon: Building2,
      title: "Espaces de travail",
      description: "Bureaux privés, salles de réunion et espaces de coworking équipés et flexibles",
      destination: "/",
      buttonText: "Découvrir les espaces"
    },
    {
      icon: MapPin,
      title: "Domiciliation",
      description: "Une adresse professionnelle prestigieuse avec gestion complète de votre courrier.",
      destination: "/",
      buttonText: "Voir les formules"
    },
  ]

  return (
    <>
      <div className="absolute inset-0 z-2">
        <div className="bg-[url('/officebg.png')] bg-cover bg-center absolute top-0 left-0 right-0 bottom-0 opacity-25 ">
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[150px] xl:h-[80px] bg-gradient-to-t from-white to-transparent z-to " />
      </div>
      <div className="w-full xl:max-w-5xl mx-auto px-4 xl:px-0 z-10 text-center pb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 xl:mb-6">
          Solutions Professionnelles{" "}
          <span className="text-emerald-400">Flexibles</span>
        </h1>
        <p className=" text-indigo-100 mb-12 max-w-3xl mx-auto text-sm sm:text-lg xl:text-xl sm:max-w-[400px] lg:max-w-[600px] ">
          Espaces de travail et domiciliation d&apos;entreprise dans un
          environnement premium
        </p>
        {/* <div className="container mx-auto px-4 xl:px-0">
          <div className="grid grid-cols-1 gap-8 mx-auto md:grid-cols-2">
            {
              featuresList.map((feature, i) => (
                <CardComponent
                  key={i}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  link={feature.destination}
                  buttonText={feature.buttonText}
                />
              ))
            }
          </div>
        </div> */}
      </div>
    </>
  );
}
