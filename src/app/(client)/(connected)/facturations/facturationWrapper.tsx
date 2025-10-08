"use client";
import React, { useState } from "react";

type Invoice = {
  id_invoice: number;
  issue_date: string;
  reference: string;
  currency: string;
  status: "payée" | "en attente" | "en retard";
  payment_method: string;
  created_at: string;
  updated_at: string;
  reservation?: ReservationDetail;
};

type PaymentInfo = {
  clientName: string;
  company?: string;
  address: string;
  email: string;
  phone?: string;
  siret?: string;
  rib?: string;
};

type ReservationDetail = {
  space: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  duration: string;
  pricePerHour: string;
  total: string;
};

const invoices: Invoice[] = [
  {
    id_invoice: 1,
    reference: "INV-001",
    issue_date: "2025-06-15",
    currency: "EUR",
    status: "payée",
    payment_method: "Carte bancaire",
    created_at: "2025-07-02T12:00:00",
    updated_at: "2025-07-02T12:00:00",
    reservation: {
      space: "Bureau exécutif A",
      date: "mer. 2 juil.",
      timeStart: "09:00",
      timeEnd: "12:00",
      duration: "3 heures",
      pricePerHour: "35€/heure",
      total: "105€",
    },
  },
  {
    id_invoice: 2,
    reference: "INV-002",
    issue_date: "2025-06-15",
    currency: "EUR",
    status: "en attente",
    payment_method: "Virement",
    created_at: "2025-06-15T10:00:00",
    updated_at: "2025-06-15T10:00:00",
    reservation: {
      space: "Salle de réunion B",
      date: "lun. 16 juin",
      timeStart: "14:00",
      timeEnd: "16:00",
      duration: "2 heures",
      pricePerHour: "35€/heure",
      total: "70€",
    },
  },
];

const paymentInfo: PaymentInfo = {
  clientName: "Jean Dupont",
  company: "Dupont SARL",
  address: "123 Avenue des Affaires, Paris, 75001",
  email: "jean.dupont@email.com",
  phone: "06 12 34 56 78",
  siret: "123 456 789 00012",
  rib: "FR76 3000 6000 0112 3456 7890 189",
};

const statusStyle: Record<Invoice["status"], string> = {
  payée: "bg-emerald-100 text-emerald-600",
  "en attente": "bg-amber-100 text-amber-600",
  "en retard": "bg-red-100 text-red-600",
};

export default function FacturationWrapper() {
  const [selected, setSelected] = useState<Invoice>(invoices[0]);

  return (
    <div className="container mx-auto ">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mes Factures</h1>
      {/* infos client */}
      <section className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Informations client
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-bold">{paymentInfo.clientName}</div>
            {paymentInfo.company && <div>{paymentInfo.company}</div>}
            <div>{paymentInfo.address}</div>
          </div>
          <div>
            <div>
              Email : <span className="text-gray-700">{paymentInfo.email}</span>
            </div>
            {paymentInfo.phone && (
              <div>
                Tél : <span className="text-gray-700">{paymentInfo.phone}</span>
              </div>
            )}
            {paymentInfo.siret && (
              <div>
                SIRET :{" "}
                <span className="text-gray-700">{paymentInfo.siret}</span>
              </div>
            )}
            {paymentInfo.rib && (
              <div>
                RIB : <span className="text-gray-700">{paymentInfo.rib}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row gap-8">
        {/* liste des factures */}
        <div className="w-full md:w-1/2 border-r border-gray-100 pr-0 md:pr-6">
          <h3 className="font-semibold mb-4 text-gray-900">Factures</h3>
          <ul>
            {invoices.map((inv) => (
              <li
                key={inv.id_invoice}
                className={`flex items-center justify-between mb-2 cursor-pointer rounded px-2 py-2 transition ${
                  selected.id_invoice === inv.id_invoice
                    ? "bg-indigo-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelected(inv)}
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {inv.reference}
                  </div>
                  <div className="text-xs text-gray-500">{inv.issue_date}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusStyle[inv.status]
                  }`}
                >
                  {inv.status === "payée"
                    ? "Payée"
                    : inv.status === "en attente"
                    ? "En attente"
                    : "En retard"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* détails de la facture sélectionnée */}
        <div className="w-full md:w-1/2 pl-0 md:pl-6 mt-8 md:mt-0">
          <h3 className="font-semibold mb-4 text-gray-900">
            Détails de la facture
          </h3>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Référence : </span>
                <span className="text-indigo-900 font-semibold">
                  {selected.reference}
                </span>
              </div>
              {/*résumé réservation */}
              {selected.reservation && (
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-y-2 mt-1 text-indigo-900">
                    <div>Espaces</div>
                    <div className="text-right">
                      {selected.reservation.space}
                    </div>
                    <div>Date</div>
                    <div className="text-right">
                      {selected.reservation.date}
                    </div>
                    <div>Horaires</div>
                    <div className="text-right">
                      {selected.reservation.timeStart} -{" "}
                      {selected.reservation.timeEnd}
                    </div>
                    <div>Durée</div>
                    <div className="text-right">
                      {selected.reservation.duration}
                    </div>
                    <div>Tarif</div>
                    <div className="text-right">
                      {selected.reservation.pricePerHour}
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-indigo-700">
                      {selected.reservation.total}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium">Statut : </span>
                <span
                  className={`${
                    statusStyle[selected.status]
                  } px-2 py-1 rounded-full font-medium`}
                >
                  {selected.status === "payée"
                    ? "Payée"
                    : selected.status === "en attente"
                    ? "En attente"
                    : "En retard"}
                </span>
              </div>
              <div>
                <span className="font-medium">Moyen de paiement : </span>
                <span className="text-indigo-900">
                  {selected.payment_method}
                </span>
              </div>
              <div>
                <span className="font-medium">Créée le : </span>
                <span className="text-indigo-900">
                  {new Date(selected.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Dernière mise à jour : </span>
                <span className="text-indigo-900">
                  {new Date(selected.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              Sélectionnez une facture pour voir les détails
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
