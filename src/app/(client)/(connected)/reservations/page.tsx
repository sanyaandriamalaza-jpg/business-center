"use client";

import React, { useState } from "react";
import ReservationCard, { Reservation } from "../../components/ReservationsCard";

const reservations: Reservation[] = [
  {
    id: "RES-001",
    space: "Bureau éxecutif A",
    number: "Réservation #RES-001",
    date: "lundi 25 mars 2024",
    hours: "09:00 - 12:00",
    location: "123 Avenue des Affaires",
    address: "Paris, 75001",
    city: "Paris, 75001",
    status: "confirmé",
    total: "135€",
  },
  {
    id: "RES-002",
    space: "Bureau éxecutif A",
    number: "Réservation #RES-002",
    date: "mercredi 27 mars 2024",
    hours: "14:00 - 16:00",
    location: "123 Avenue des Affaires",
    address: "Paris, 75001",
    city: "Paris, 75001",
    status: "en attente",
    total: "70€",
  },
  {
    id: "RES-003",
    space: "Bureau éxecutif A",
    number: "Réservation #RES-003",
    date: "lundi 1 avril 2024",
    hours: "10:00 - 18:00",
    location: "123 Avenue des Affaires",
    address: "Paris, 75001",
    city: "Paris, 75001",
    status: "confirmé",
    total: "120€",
  },
];

export default function ReservationsPage() {
  const [tab, setTab] = useState("venir");
  return (
    <div className="container min-h-screen mx-auto ">
      <div className="mb-8 ">
        <h1 className="text-2xl font-bold text-gray-900">Mes Réservations</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez vos réservations actuelles et passées
        </p>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex gap-6 border-b border-gray-200">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              tab === "venir"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-400"
            }`}
            onClick={() => setTab("venir")}
          >
            À venir
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              tab === "historique"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-400"
            }`}
            onClick={() => setTab("historique")}
          >
            Historique
          </button>
        </div>
        {tab === "venir" && (
        <div>
          {reservations.map((r) => (
            <ReservationCard reservation={r} key={r.id} />
          ))}
        </div>
      )}
      {tab === "historique" && (
        <div>
          {reservations.map((r) => (
            <ReservationCard reservation={r} key={r.id} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
