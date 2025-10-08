import Link from "next/link";
import React from "react";
import SpaceExample from "../components/SpaceExample";

export default function WorkArea() {
  return (
    <div className="container mx-auto px-4 sm:px-16 md:px-4">
      <div className="w-full mx-auto ">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:text-center md:text-left">
              Découvrez nos espaces
            </h2>
            <p className="text-base xl:text-xl text-gray-600 sm:text-center md:text-left">
              Trouvez l'environnement parfait pour vos besoins professionnels.
            </p>
          </div>
          <div className="">
            <Link
              href="/spaces"
              className="bg-indigo-600 block hover:bg-indigo-700 font-medium rounded-lg text-white transition-colors md:mt-0 px-6 py-3"
            >
              Voir Tout les Espaces
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SpaceExample
            src={"/office1.png"}
            alt={"bureau privé"}
            title={"Bureaux Privés"}
            price={"À partir de 180€ / jour"}
          />
          <SpaceExample
            src={"/office2.jpeg"}
            alt={"salle de réunion"}
            title={"Salles de réunion"}
            price={"À partir de 25€ / heure"}
          />
          <SpaceExample
            src={"/office3.png"}
            alt={"espaces coworking"}
            title={"Espaces coworking"}
            price={"À partir de 15€ / heure"}
          />
        </div>
      </div>
    </div>
  );
}
