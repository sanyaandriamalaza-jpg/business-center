"use client";

import Image from "next/image";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, MapPin, Users, Clock, Projector, Wifi, Utensils, Video, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import ReservationTabs from "../reservationTabs";

export default function ReservationPage() {
    const router = useRouter();
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 px-0 flex items-center gap-2 text-indigo-600 hover:bg-transparent hover:text-indigo-800">
          <ArrowLeft size={18} /> Retour aux espaces
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="relative rounded-lg overflow-hidden h-80 md:h-96">
              <img
                src="/office2.jpeg"
                alt="Bureau"
                className=" w-full h-full object-cover"
              />
              <span className="absolute top-4 right-4 bg-indigo-800 text-white rounded-full text-sm px-3 py-1 ">Salle de Réunion</span>
            </div>
          </div>
          <Card className="bg-white rounded-lg p-6 shadow-md">
            <CardContent >
              <h1 className="text-2xl font-bold mb-4 text-gray-900">Salle du Conseil</h1>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <MapPin size={18} className="text-indigo-700" /> 123 Avenue des Affaires, Paris
                </li>
                <li className="flex items-center gap-2">
                  <Users size={18} className="text-indigo-700"/> Capacité : jusqu&apos;à 12 personnes
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={18} className="text-indigo-700"/> Disponible : 08:00 - 20:00
                </li>
              </ul>
              <hr className="my-4" />
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-gray-900">Tarifs</h3>
                <div className="flex justify-between"><span className="text-gray-600">Tarif horaire</span><span className=" text-indigo-900">35€</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tarif journalier (8 heures)</span><span className=" text-indigo-900">140€</span></div>
              </div>
              <hr className="my-4" />
              <div>
                <div className="font-semibold mb-2 text-gray-900">Équipements</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"><Wifi className="h-3 w-3 mr-1" /> Wi-Fi</span>
                  <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"><Projector className="h-3 w-3 mr-1" /> Vidéoprojecteur</span>
                  <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"><ClipboardList className="h-3 w-3 mr-1" /> Tableau blanc</span>
                  <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"><Utensils className="h-3 w-3 mr-1" /> Restauration</span>
                  <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"><Video className="h-3 w-3 mr-1" /> Visioconférence</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-10 ">
          <Card className="bg-white rounded-lg shadow-md p-6 mb-8">
            <CardContent >
              <h2 className="font-bold text-xl mb-4 text-gray-900">À propos de cet espace</h2>
              <p className="text-gray-700">
              Une salle de réunion spacieuse idéale pour les présentations et les réunions d'équipe. Équipée de technologies modernes.
              </p>
            </CardContent>
          </Card>
        </div>
        <ReservationTabs/>
      </div>
    </div>
  );
}