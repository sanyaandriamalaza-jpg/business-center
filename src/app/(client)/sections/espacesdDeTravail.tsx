import Link from "next/link";
import React from "react";
import ExempleEspace from "../components/exempleEspace";

export default function EspacesdDeTravail() {
  return (
    <div className="w-full mx-auto px-44">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Découvrez nos espaces
          </h2>
          <p className="text-xl text-gray-600">
            Trouvez l'environnement parfait pour vos besoins professionnels.
          </p>
        </div>
        <Link
          href="/espaces"
          className="bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-white transition-colors mt-4 md:mt-0 px-6 py-3"
        >
          Voir tout les espaces
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ExempleEspace
          src={"/office1.png"}
          alt={"bureau privé"}
          title={"Bureaux Privés"}
          price={"À partir de 180€ / jour"}
        />
        <ExempleEspace
          src={"/office2.jpeg"}
          alt={"salle de réunion"}
          title={"Salles de réunion"}
          price={"À partir de 25€ / heure"}
        />
        <ExempleEspace
          src={"/office3.png"}
          alt={"espaces coworking"}
          title={"Espaces coworking"}
          price={"À partir de 15€ / heure"}
        />
      </div>
    </div>
  );
}
