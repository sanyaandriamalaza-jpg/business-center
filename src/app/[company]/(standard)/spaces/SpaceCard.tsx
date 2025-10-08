"use client";

import { Button } from "@/src/components/ui/button";
import { OfficeFeature } from "@/src/lib/type";
import { allEquipments } from "@/src/lib/utils";
import { Clock, Coffee, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type espaceProps = {
  id: number;
  src: string;
  alt: string;
  badge: string;
  espace: string;
  capacity: number;
  city?: string | null;
  creneaux?: string;
  equipments: OfficeFeature[];
  prix?: number | null;
  destination: string;
};

export default function SpaceCard({
  id,
  src,
  alt,
  badge,
  espace,
  capacity,
  creneaux,
  equipments,
  prix,
  destination,
  city,
}: espaceProps) {
  const numberOfEquipmentVisible = 3;
  const equipmentToShow = equipments?.slice(0, numberOfEquipmentVisible) || [];
  const equipmentRest = (equipments?.length || 0) - numberOfEquipmentVisible;
  return (
    <div className="bg-cBackground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col cursor-default h-full">
      <div className="relative h-48 w-full overflow-hidden flex items-center">
        <Image
          src={src}
          alt={alt}
          width={480}
          height={192}
          className="object-cover hover:scale-105 duration-500 "
        />
        <span className="absolute top-4 right-4 bg-cPrimary text-cForeground text-xs px-3 py-1 rounded-full font-semibold">
          {badge}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-xl font-bold mb-1 text-cStandard">{espace}</h2>
        <div className="text-sm text-cStandard flex items-center gap-1 xl:gap-6 mb-2">
          <div>
            <Users size={16} className="inline-block text-cPrimary/80" />{" "}
            Jusqu'à {capacity} personne{capacity > 1 ? "s" : ""}
          </div>
          {city && (
            <div className="flex items-center gap-1">
              <MapPin size={16} className="inline-block text-cPrimary/80" />{" "}
              {city}
            </div>
          )}
          {/* <div>
            <Clock size={16} className="inline-block ml-4 text-indigo-800" /> {creneaux}
          </div> */}
        </div>
        <div className="mb-2 mt-2">
          <span className="font-semibold text-sm text-cStandard">
            Équipements
          </span>
          <div className="flex flex-wrap gap-2 xl:gap-3 mt-1">
            {equipmentToShow.map((item) => {
              const equipment = allEquipments.find(
                (e) => e.value === item.value
              );
              return equipment ? (
                <div
                  key={equipment.value}
                  className="rounded bg-cBackground/80 shadow-md border border-cForeground/20 px-2 py-0.5 text-xs flex items-center justify-center gap-1 text-cStandard"
                >
                  <equipment.icon className="w-4" />
                  {equipment.label}
                </div>
              ) : null;
            })}
            {equipmentRest > 0 && (
              <span className=" rounded px-2 py-0.5 text-xs text-cStandard">
                +{equipmentRest} autre{equipmentRest > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-end justify-between flex-1 mt-4">
          {prix && (
            <div className="text-2xl font-bold text-cPrimaryHover">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: prix % 1 === 0 ? 0 : 2,
                maximumFractionDigits: 2,
              }).format(prix)}
              <span className="text-sm font-medium text-cPrimary/60">
                /heure
              </span>
            </div>
          )}
          <Link href={destination}>
            <Button
              variant="ghost"
              className="bg-cPrimary hover:bg-cPrimaryHover px-6 text-white hover:text-white"
            >
              Réserver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
