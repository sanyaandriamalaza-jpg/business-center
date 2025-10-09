"use client";

import { cn } from "@/src/lib/utils";
import Domiciliation from "../sections/domiciliation";
import Landing from "../sections/landing";
import GestionEspaces from "../sections/gestionEspaces";
import EspacesdDeTravail from "../sections/espacesdDeTravail";
import Commentaires from "../sections/commentaires";
import Contact from "../sections/contact";
import { Solutions } from "../sections/solutions";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Main Content */}
      <div className="flex flex-col">
        <section className="relative h-screen flex items-center justify-center bg-indigo-900 overflow-hidden">
          <Landing />
        </section>
        {/* <section className="py-16 bg-white">
          <Solutions />
        </section> */}
        <section className="py-16 bg-indigo-50">
          <Domiciliation />
        </section>
        {/* <section className="py-16 bg-gray-50">
          <GestionEspaces />
        </section>
        <section className="py-16 bg-white">
          <EspacesdDeTravail />
        </section> */}
        <section className="py-16 bg-indigo-900 text-white">
          <Commentaires />
        </section>
        <section className="py-16 bg-white">
          <Contact />
        </section>
      </div>
    </div>
  );
}
