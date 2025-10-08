"use client";
import { DurationType, Invoice } from "@/src/lib/type";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useState } from "react";

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

const statusStyle: Record<Invoice["status"], string> = {
  paid: "bg-emerald-100 text-emerald-600",
  pending: "bg-amber-100 text-amber-600",
  overdue: "bg-red-100 text-red-600",
  canceled: "bg-red-100 text-red-600",
  sent: "bg-cPrimary-100 text-cForeground",
};

export default function FacturationWrapper({
  invoices,
}: {
  invoices: Invoice[];
}) {
  const [selected, setSelected] = useState<Invoice>(invoices[0]);

  const { start, end } = calculateReservationPeriod(
    selected.startSubscription,
    selected.duration,
    selected.durationType
  );

  const getDurationText = () => {
    const durationMap = {
      hourly: `${selected.duration} heure${selected.duration > 1 ? "s" : ""}`,
      daily: `${selected.duration} jour${selected.duration > 1 ? "s" : ""}`,
      monthly: `${selected.duration} mois`,
      annualy: `${selected.duration} an(s)`,
    };
    return durationMap[selected.durationType];
  };

  return (
    <div className="container mx-auto px-4 py-3">
      <h1 className="text-2xl font-bold text-cStandard mb-8">Mes Factures</h1>
      {/* infos client */}
      <section className="bg-cBackground shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-cStandard">
          Informations client
        </h2>
        <div className="grid grid-cols-1 text-sm">
          <div>
            <div className="font-bold">
              {invoices[0].user.name} {""} {invoices[0].user.firstName}
            </div>
            <div>{invoices[0].user.addressLine}</div>
            <div>
              {invoices[0].user.postalCode} {""} {invoices[0].user.city}
            </div>
            <div>{invoices[0].user.country}</div>
            <div>
              Email :{" "}
              <span className="text-cStandard/70">
                {invoices[0].user.email}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-cBackground shadow rounded-lg p-6 flex flex-col md:flex-row gap-8">
        {/* liste des factures */}
        <div className="w-full md:w-1/2 border-r border-gray-100 pr-0 md:pr-6">
          <h3 className="font-semibold mb-4 text-cStandard">Factures</h3>
          <ul>
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className={`flex items-center justify-between mb-2 cursor-pointer rounded px-2 py-2 transition ${
                  selected.id === inv.id
                    ? "bg-cPrimary/20"
                    : "hover:bg-cStandard/20"
                }`}
                onClick={() => setSelected(inv)}
              >
                <div>
                  <div className="font-medium text-cStandard">
                    {inv.reference}_{inv.referenceNum}
                  </div>
                  <div className="text-xs text-cStandard/50">
                    {format(inv.startSubscription, "EEEE dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusStyle[inv.status]
                  }`}
                >
                  {inv.status === "paid"
                    ? "Payée"
                    : inv.status === "pending"
                      ? "En attente"
                      : "En retard"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* détails de la facture sélectionnée */}
        <div className="w-full md:w-1/2 pl-0 md:pl-6 mt-8 md:mt-0">
          <h3 className="font-semibold mb-4 text-cStandard">
            Détails de la facture
          </h3>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Référence : </span>
                <span className="text-cPrimary font-semibold">
                  {selected.reference}_{selected.referenceNum}
                </span>
              </div>
              {/*résumé réservation */}
              {selected && (
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-y-2 mt-1 text-cPrimary">
                    <div>Espaces</div>
                    <div className="text-right">{selected.office?.name}</div>
                    <div>Date</div>
                    <div className="text-right">
                      {format(selected.startSubscription, "EEEE dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                    <div>Horaires</div>
                    <div className="text-right">
                      {isSameDay(start, end)
                        ? `${format(start, "dd/MM/yyyy")} ${format(start, "HH:mm")} → ${format(end, "HH:mm")}`
                        : `${format(start, "dd/MM/yyyy HH:mm")} → ${format(end, "dd/MM/yyyy HH:mm")}`}
                    </div>
                    <div>Durée</div>
                    <div className="text-right">{getDurationText()}</div>
                    <div>Tarif</div>
                    <div className="text-right">
                      {selected.amount}€/
                      {selected.durationType === "hourly" ? "heure" : "jour"}
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-cPrimary/70">
                      {selected.amountNet}€
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
                  {selected.status === "paid"
                    ? "Payée"
                    : selected.status === "pending"
                      ? "En attente"
                      : "En retard"}
                </span>
              </div>
              <div>
                <span className="font-medium">Moyen de paiement : </span>
                <span className="text-cPrimary">{selected.paymentMethod}</span>
              </div>
              <div>
                <span className="font-medium">Créée le : </span>
                <span className="text-cPrimary">
                  {format(selected.createdAt, "EEEE dd MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>
              {selected.updatedAt ? (
                <div>
                  <span className="font-medium">Dernière mise à jour : </span>
                  <span className="text-cPrimary">
                    {format(selected.updatedAt, "EEEE dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            <div className="text-cStandard/80">
              Sélectionnez une facture pour voir les détails
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
