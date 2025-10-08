import {
  ArrowRight,
  Bell,
  Building2,
  CalendarCheck,
  Clock,
  PanelTop,
} from "lucide-react";
import React from "react";
import DashboardCard from "../../components/DashboardCard";
import Link from "next/link";

const features = [
  {
    title: "Réserver un espace",
    description: "Trouvez et resérver votre prochain espace de travail.",
    link: "/spaces",
    icon: <Building2 />,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Mes réservations",
    description: "Gérez vos réservations actuelles et passées.",
    link: "/reservations",
    icon: <CalendarCheck />,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Facturation",
    description: "Consultez vos factures et informations de paiements.",
    link: "/facturations",
    icon: <PanelTop />,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Notifications",
    description: "Gérez vos préferences de notification.",
    link: "/profile",
    icon: <Bell />,
    color: "bg-purple-100 text-purple-600",
  },
];

const reservations = [
  {
    id: 1,
    date: "dimanche 24 mar",
    time: "09:00 - 12:00",
    space: "Salle de réunion A",
    status: "Confirmée",
  },
  {
    id: 2,
    date: "mardi 26 mars",
    time: "14:00 - 16:00",
    space: "Bureau partagé B",
    status: "En attente",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Réservation confirmée pour Bureau Exécutif A",
    date: "20 mars",
    time: "10:00",
  },
  {
    id: 2,
    action: "Code d'accès généré pour Salle de Réunion B",
    date: "19 mars",
    time: "15:45",
  },
  {
    id: 3,
    action: "Paiement reçu pour la réservation #RES-001",
    date: "18 mars",
    time: "09:01",
  },
];

export default function ClientDashboard() {
  return (
    <div className="container min-h-screen mx-auto ">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bienvenue sur votre espace personnel
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8 gap-6">
        {features.map((feature, index) => (
          <DashboardCard
            key={index}
            link={feature.link}
            icon={feature.icon}
            color={feature.color}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              Réservations à venir
            </h2>
            <Link
              href="/reservations"
              className="text-sm text-indigo-600 hover:text-indigo-800 flex gap-1"
            >
              Voir tout <ArrowRight className="h-4 w-4 mt-0.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {reservation.space}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {reservation.date} - {reservation.time}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    reservation.status === "Confirmée"
                      ? "text-emerald-600 bg-emerald-100"
                      : "text-amber-600 bg-amber-100"
                  }`}
                >
                  {reservation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Activité récente
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.date} à {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
