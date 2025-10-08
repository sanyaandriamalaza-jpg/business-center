import React from "react";
import {
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";
// import StatistiqueCard from "@/src/app/(connected)/admin/components/StatistiqueCard";


const statistiques = [
  {
    icon: <CalendarCheck />,
    statIcon: <ArrowUpRight />,
    statPerCent: "+12.5%",
    title: "Réservation du mois",
    taux: "245",
    isRed: false,
  },
  {
    icon: <Users />,
    statIcon: <ArrowUpRight />,
    statPerCent: "+22.4%",
    title: "Nouveaux Utilisateurs",
    taux: "48",
    isRed: false,
  },
  {
    icon: <Building2 />,
    statIcon: <ArrowDownRight />,
    statPerCent: "-4.3%",
    title: "Taux d'occupations",
    taux: "84",
    isRed: true,
  },
  {
    icon: <TrendingUp />,
    statIcon: <ArrowUpRight />,
    statPerCent: "+8.2%",
    title: "Revenu mensuel",
    taux: "15 680£",
    isRed: false,
  },
];

const reservationsRecents = [
  {
    id: 1,
    bureau: "Bureau exécutif 1",
    durrer: "2h",
    client: "John Doe",
    montant: "90£",
  },
  {
    id: 2,
    bureau: "Bureau exécutif 2",
    durrer: "2h",
    client: "John Doe",
    montant: "90£",
  },
  {
    id: 3,
    bureau: "Bureau exécutif 3",
    durrer: "2h",
    client: "John Doe",
    montant: "90£",
  },
  {
    id: 4,
    bureau: "Bureau exécutif 4",
    durrer: "2h",
    client: "John Doe",
    montant: "90£",
  },
  {
    id: 5,
    bureau: "Bureau exécutif 5",
    durrer: "2h",
    client: "John Doe",
    montant: "90£",
  },
];

const espaceReserver = [
  {
    id: 1,
    salle: "Salle de réunion 1",
    reservation: "32 Réservations",
    taux: "90%",
  },
  {
    id: 2,
    salle: "Salle de réunion 2",
    reservation: "32 Réservations",
    taux: "85%",
  },
  {
    id: 3,
    salle: "Salle de réunion 3",
    reservation: "32 Réservations",
    taux: "80%",
  },
  {
    id: 4,
    salle: "Salle de réunion 4",
    reservation: "32 Réservations",
    taux: "80%",
  },
  {
    id: 5,
    salle: "Salle de réunion 5",
    reservation: "32 Réservations",
    taux: "80%",
  },
];

export default function Dashboard() {
  return (
    <div className="flex-1 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble des performances et statistiques
        </p>
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 ">
        {statistiques.map((statistique) => (
          <StatistiqueCard
            key={statistique.title}
            icon={statistique.icon}
            statIcon={statistique.statIcon}
            statPerCent={statistique.statPerCent}
            title={statistique.title}
            taux={statistique.taux}
            isRed={statistique.isRed}
          />
        ))}
      </div> */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Réservations récentes
          </h2>
          <div className="space-y-4">
            {reservationsRecents.map((reservation) => (
              <div
                key={reservation.id}
                className="py-3 border-b border-gray-200 last:border-0 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {reservation.bureau}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {reservation.client} • {reservation.durrer} •{" "}
                    {reservation.montant}
                  </p>
                </div>
                <span className="text-sm font-medium text-green-800 px-3 py-1 rounded-full bg-green-100">
                  Confirmé
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Espaces les plus réservés
          </h2>
          <div className="space-y-4">
            {espaceReserver.map((espace) => (
              <div
                key={espace.id}
                className="py-3 border-b border-gray-200 last:border-0 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center mr-4 w-12 h-12 rounded-lg bg-indigo-100">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className=" font-medium text-gray-900">
                      {espace.salle}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {espace.reservation}{" "}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {espace.taux}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
