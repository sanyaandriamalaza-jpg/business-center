"use client";

import { Input } from "@/src/components/ui/input";
import { useState } from "react";

const spaceTypes = [
  { label: "Bureau", value: "bureau" },
  { label: "Salle de Réunion", value: "salle" },
  { label: "Espace Coworking", value: "coworking" },
];

const equipements = [
  { label: "Wi-Fi", value: "wifi" },
  { label: "Tableau blanc", value: "tableau" },
  { label: "Service d'impression", value: "impression" },
  { label: "Restauration", value: "restauration" },
  { label: "Vidéoprojecteur", value: "videoprojecteur" },
  { label: "Machine à café", value: "cafe" },
  { label: "Climatisation", value: "clim" },
  { label: "Parking", value: "parking" },
];

export function AdvancedFilterComponent({ open }: { open: boolean }) {
  const [checkedSpaces, setCheckedSpaces] = useState<string[]>([]);
  const [checkedEquip, setCheckedEquip] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, 200]);

  if (!open) return null;

  return (
    <div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      
        {/* Type d'espace */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 mb-3">Type d'espace</h3>
          {spaceTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-2">
              <input
                id={type.value}
                type="checkbox"
                className="h-4 w-4 rounded text-indigo-500 focus:ring-indigo-500"
                checked={checkedSpaces.includes(type.value)}
                onChange={() =>
                  setCheckedSpaces((prev) =>
                    prev.includes(type.value)
                      ? prev.filter((v) => v !== type.value)
                      : [...prev, type.value]
                  )
                }
              />
              <span className="text-gray-700 cursor-pointer text-sm">
                {type.label}
              </span>
            </label>
          ))}
        </div>
        {/* Fourchette de prix */}
        <div>
          <h3 className="font-medium mb-3 text-gray-700">Fourchette de prix (€/heure)</h3>
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min={0}
              max={200}
              value={price[0]}
              onChange={e => setPrice([+e.target.value, price[1]])}
              className="appearence-none cursor-pointer w-full h-2 bg-gray-200 rounded-lg"
              step={5}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{price[0]}€</span>
              <span>{price[1]}€</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              value={price[1]}
              onChange={e => setPrice([price[0], +e.target.value])}
              className="appearence-none cursor-pointer w-full h-2 bg-gray-200 rounded-lg"
              step={5}
            />
            
          </div>
        </div>
        {/* Équipements */}
        <div>
          <h3 className="font-medium mb-3 text-gray-700">Équipements</h3>
          <div className="grid grid-cols-2 gap-x-4">
            {equipements.map((eq) => (
              <label key={eq.value} className="flex items-center gap-2">
              <input
                id={eq.value}
                type="checkbox"
                className="h-4 w-4 rounded text-indigo-500 focus:ring-indigo-500"
                checked={checkedSpaces.includes(eq.value)}
                onChange={() =>
                  setCheckedSpaces((prev) =>
                    prev.includes(eq.value)
                      ? prev.filter((v) => v !== eq.value)
                      : [...prev, eq.value]
                  )
                }
              />
              <span className="text-gray-700 cursor-pointer text-sm">
                {eq.label}
              </span>
            </label>
            ))}
          </div>
        </div>
      
    </div>
  );
}