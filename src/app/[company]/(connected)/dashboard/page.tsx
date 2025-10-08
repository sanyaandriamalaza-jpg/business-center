import {
  ArrowRight,
  User,
  Building2,
  CalendarCheck,
  Clock,
  PanelTop,
} from "lucide-react";
import React from "react";
import DashboardCard from "./components/DashboardCard";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";
import { authOptions } from "@/src/lib/auth";
import { baseUrl } from "@/src/lib/utils";
import { DurationType, Invoice } from "@/src/lib/type";

const fetchInvoices = async (): Promise<Invoice[] | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/invoice?type=office`, {
      method: "GET",
      next: { revalidate: 1 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? (data.data as Invoice[]) : null;
  } catch (error) {
    console.error("Erreur récupération factures :", error);
    return null;
  }
};

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

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  const invoices = await fetchInvoices();
  if (!session || !invoices) {
    notFound();
  }

  const reservations = invoices.filter(
    (reservation) => reservation.idBasicUser === Number(session.user.id)
  );

  const features = [
    {
      title: "Domiciliation",
      description:
        "Donnez à votre entreprise une adresse professionnelle prestigieuse et officielle.",
      link: `/${session.user.companySlug}/dashboard/company-domiciliation`,
      icon: <Building2 />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Mes réservations",
      description: "Gérez vos réservations actuelles et passées.",
      link: `/${session.user.companySlug}/dashboard/reservations`,
      icon: <CalendarCheck />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Facturation",
      description: "Consultez vos factures et informations de paiements.",
      link: `/${session.user.companySlug}/dashboard/facturations`,
      icon: <PanelTop />,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Profile",
      description: "Modifier facilement vos informations.",
      link: `/${session.user.companySlug}/dashboard/profile`,
      icon: <User />,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  function calculateReservationPeriod(
    start_subscription: string | Date,
    duration: number,
    duration_type: DurationType
  ) {
    const start = new Date(start_subscription);

    const end = new Date(start);

    if (duration_type === "hourly") {
      end.setHours(end.getHours() + duration);
    } else if (duration_type === "daily") {
      end.setDate(end.getDate() + duration);
    } else if (duration_type === "monthly") {
      end.setMonth(end.getMonth() + duration);
    }

    return { start, end };
  }

  return (
    <div className="container min-h-screen mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cStandard">Tableau de Bord</h1>
        <p className="mt-1 text-sm text-cStandard/60">
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
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-cBackground shadow-md rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-cStandard">
              Réservations à venir
            </h2>
            <Link
              href={`/${session.user.companySlug}/dashboard/reservations`}
              className="text-sm text-cPrimary/60 hover:text-cPrimary/90 flex gap-1"
            >
              Voir tout <ArrowRight className="h-4 w-4 mt-0.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {reservations && reservations.length !== 0 ? (
              reservations.map((reservation) => {
                const { start, end } = calculateReservationPeriod(
                  reservation.startSubscription,
                  reservation.duration,
                  reservation.durationType
                );
                return (
                  <Link href={`/${session.user.companySlug}/dashboard/reservations?highlight=${reservation.id}`}
                    key={reservation.id}
                    className="p-4 border border-cStandard/10 rounded-lg hover:bg-cStandard/10 transition-colors flex items-center"
                  >
                    <div className="p-3 bg-neutral-300 rounded-lg mr-4">
                      <Clock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-cStandard">
                        {reservation.office?.name}
                      </h3>
                      <p className="text-xs text-cStandard/60">
                        {start.toLocaleString()} → {end.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        reservation.subscriptionStatus === "confirmed"
                          ? "text-emerald-600 bg-emerald-100"
                          : "text-amber-600 bg-amber-100"
                      }`}
                    >
                      {reservation.subscriptionStatus === "confirmed"
                        ? "Confirmée"
                        : "En attente"}
                    </span>
                  </Link>
                );
              })
            ) : (
              <span>Aucune réservation disponible pour le moment</span>
            )}
          </div>
        </div>
        {/* <div className="bg-cBackground shadow-md rounded-xl p-6">
          <h2 className="text-lg font-medium text-cStandard mb-6">
            Activité récente
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-cPrimary/60 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cStandard">{activity.action}</p>
                  <p className="text-xs text-cStandard/60">
                    {activity.date} à {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
