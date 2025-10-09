import {
  ArrowRight,
  Calendar,
  Clock,
  Download,
  Eye,
  MapPin,
  Ban,
} from "lucide-react";
import React from "react";

export type Reservation = {
  id: string;
  space: string;
  number: string;
  date: string;
  hours: string;
  location: string;
  address: string;
  city: string;
  status: "confirmé" | "en attente";
  total: string;
};

const statusStyle: Record<Reservation["status"], string> = {
  confirmé: "bg-emerald-100 text-emerald-600",
  "en attente": "bg-amber-100 text-amber-600",
};

const statusText: Record<Reservation["status"], string> = {
  confirmé: "Confirmé",
  "en attente": "En attente",
};

export default function ReservationCard({
  reservation,
}: {
  reservation: Reservation;
}) {
  return (
    <div className="bg-white p-6 border-b last:border-b-0 flex flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-3">
          <span className="text-indigo-600 text-3xl mt-1">
            <Calendar />
          </span>
          <div>
            <h3 className="font-medium text-gray-900">{reservation.space}</h3>
            <span className="text-gray-600 text-xs">{reservation.number}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
            statusStyle[reservation.status]
          }`}
        >
          {statusText[reservation.status]}
        </span>
      </div>

      <div className=" flex items-center justify-between w-full border-b border-gray-200 ">
        <div className="flex justify-between w-2/5 mt-3 text-sm pb-6">
          <div className="flex gap-2 ">
            <Clock className="w-5 h-5 mt-1 text-gray-400" />
            <span>
              <span className="font-medium text-gray-900">
                {reservation.date}
              </span>
              <br />
              <span className="text-gray-600 text-xs">{reservation.hours}</span>
            </span>
          </div>
          <div className="flex gap-2 ">
            <MapPin className="w-5 h-5 mt-1 text-gray-400 " />
            <span>
              <span className="font-medium text-gray-900">
                {reservation.location}
              </span>
              <br />
              <span className="text-gray-600 text-xs">
                {reservation.address}
              </span>
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-gray-900 text-sm">Total</h3>
          <span className="text-indigo-600 text-lg font-bold">
            {reservation.total}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-6 mt-4 text-xs font-bold items-center">
          <a href="" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
            <Eye className="h-4 w-4 cursor-pointer" /> Voir les détails
          </a>
          {reservation.status === "confirmé" && (
            <div className="flex gap-6">
              <a href="" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                <Download className="h-4 w-4 cursor-pointer" /> Télécharger la facture
              </a>
              <a href="" className="flex items-center gap-1 text-red-500 hover:text-red-800">
                <Ban  className="h-4 w-4 cursor-pointer" /> Annuler
              </a>
            </div>
          )}
        </div>
        {reservation.status === "confirmé" && (
          <a href="" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md mt-4 text-sm font-medium hover:bg-indigo-700 transition">
            Code d'accès <ArrowRight />
          </a>
        )}
      </div>
    </div>
  );
}
