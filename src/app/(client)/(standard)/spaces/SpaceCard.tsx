import { Button } from "@/src/components/ui/button";
import { Clock, Coffee, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type espaceProps = {
  id: number,
  src: string;
  alt: string;
  badge: string;
  espace: string;
  capacitie: number;
  creneaux: string;
  equipements: string[];
  prix: number | string;
}

export default function SpaceCard({ id, src, alt, badge, espace, capacitie, creneaux, equipements, prix }: espaceProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col cursor-default">
      <div className="relative h-48 w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover hover:scale-105 duration-500 "
        />
        <span className="absolute top-4 right-4 bg-indigo-900 text-white text-xs px-3 py-1 rounded-full font-semibold">
          {badge}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-xl font-bold mb-1">{espace}</h2>
        <div className="text-sm text-gray-700 flex items-center gap-1 xl:gap-4 mb-2">
          <div>
            <Users size={16} className="inline-block text-indigo-800" /> Jusqu'à {capacitie} personnes
          </div>
          <div>
            <Clock size={16} className="inline-block ml-4 text-indigo-800" /> {creneaux}
          </div>
        </div>
        <div className="mb-2 mt-2">
          <span className="font-semibold text-sm text-gray-700">Équipements</span>
          <div className="flex flex-wrap gap-2 xl:gap-3 mt-1">
            {equipements.map((equipement) => (
              <span
                key={equipement}
                className="bg-gray-100 rounded-full flex items-center text-gray-700 px-2 py-0.5 text-xs"
              >
                <Coffee className="h-5 w-5 pr-2" />
                {equipement}
              </span>
            ))}
            <span className=" rounded px-2 py-0.5 text-xs">
              +1 autre
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between flex-1 mt-4">
          <div className="text-2xl font-bold text-indigo-900">
            {prix}€
            <span className="text-sm font-medium text-gray-600">/heure</span>
          </div>
          <Link href={`/spaces/${id}`}>
            <Button variant="ghost" className="bg-indigo-600 hover:bg-indigo-700 px-6 text-white hover:text-white">
              Réserver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
