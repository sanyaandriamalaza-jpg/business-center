import React from "react";
import ReservationCard from "../components/ReservationsCard";
import { Invoice } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { notFound, useSearchParams } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

interface Props {
  searchParams?: { highlight?: string };
}

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

export default async function ReservationsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const invoices = await fetchInvoices();
  if (!session || !invoices) {
    notFound();
  }

  const highlightId = searchParams?.highlight;

  const reservations = invoices.filter(
    (reservation) => reservation.idBasicUser === Number(session.user.id)
  );

  const sortedReservations = highlightId
    ? [
        ...reservations.filter(r => r.id === Number(highlightId)),
        ...reservations.filter(r => r.id !== Number(highlightId)),
      ]
    : reservations;

  return (
    <div className="container min-h-screen mx-auto px-4 py-3 ">
      <div className="mb-8 ">
        <h1 className="text-2xl font-bold text-cStandard">Mes Réservations</h1>
        <p className="mt-1 text-sm text-cStandard/60">
          Gérez vos réservations actuelles et passées
        </p>
      </div>
      <div className="bg-cBackground shadow-md rounded-lg overflow-hidden">
        <div className="flex gap-6 border-b border-gray-200">
          <span
            className={`px-4 py-3 text-sm font-medium text-cPrimary/60 border-b-2 border-cPrimary/60 `}
          >
            Tout les réservations
          </span>
        </div>
        <div>
          {sortedReservations.map((reservation) => (
            <ReservationCard reservation={reservation} key={reservation.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
