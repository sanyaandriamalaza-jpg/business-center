"use client";

import { DurationType, Invoice, SubscriptionStatus } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Eye, MapPin, Ban } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AccessCodeDialog from "./AccessCodeDialog";
import ReservationDetailsDialog from "./ReservationDetailsDialog";
import { Button } from "@/src/components/ui/button";

const statusStyle: Record<SubscriptionStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-600",
  pending: "bg-amber-100 text-amber-600",
  canceled: "bg-red-100 text-red-600",
};

const statusText: Record<SubscriptionStatus, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  canceled: "Annulé",
};

export default function ReservationCard({
  reservation,
}: {
  reservation: Invoice;
}) {
  const [code, setCode] = useState("");

  useEffect(() => {
    const fetchAccessCode = async () => {
      const res = await fetch(
        `${baseUrl}/api/access-code/${reservation.idAccessCode}`
      );
      const response = await res.json();
      const data = response.success ? response.data : null;
      setCode(data.code);
    };
    fetchAccessCode();
  }, []);

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

  const { start, end } = calculateReservationPeriod(
    reservation.startSubscription,
    reservation.duration,
    reservation.durationType
  );

  return (
    <div className="bg-cBackground p-6 border-b last:border-b-0 flex flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-3">
          <div className="w-[100px] aspect-video rounded overflow-hidden flex items-center ">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${reservation.office?.imageUrl}`}
              alt={reservation.office?.name as string}
              width={100}
              height={100}
            />
          </div>
          <div>
            <h3 className="font-medium text-cStandard">
              {reservation.office?.name}
            </h3>
            <span className="text-cStandard/60 text-xs">
              {reservation.reference}_{reservation.referenceNum}
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
            statusStyle[reservation.subscriptionStatus]
          }`}
        >
          {statusText[reservation.subscriptionStatus]}
        </span>
      </div>

      <div className=" flex items-center justify-between w-full border-b border-gray-200 ">
        <div className="flex justify-between w-2/5 mt-3 text-sm pb-6">
          <div className="flex gap-2 ">
            <Clock className="w-5 h-5 mt-1 text-cStandard/90" />
            <span>
              <span className="font-medium text-cStandard">
                {format(reservation.startSubscription, "EEEE dd MMMM yyyy", {
                  locale: fr,
                })}
              </span>
              <br />
              <span className="text-cStandard/60 text-xs">
                {isSameDay(start, end)
                  ? `${format(start, "dd/MM/yyyy")} ${format(start, "HH:mm")} → ${format(end, "HH:mm")}`
                  : `${format(start, "dd/MM/yyyy HH:mm")} → ${format(end, "dd/MM/yyyy HH:mm")}`}
              </span>
            </span>
          </div>
          <div className="flex gap-2 ">
            <MapPin className="w-5 h-5 mt-1 text-cStandard/90 " />
            <span>
              <span className="font-medium text-cStandard">
                {reservation.office?.specificAddress?.city}
              </span>
              <br />
              <span className="text-cStandard/60 text-xs">
                {reservation.office?.specificAddress?.addressLine}
              </span>
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-cStandard text-sm">Total</h3>
          <span className="text-cPrimary/60 text-lg font-bold">
            {reservation.amountNet} {reservation.currency === "eur" ? "€" : "$"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-6 mt-4 text-xs font-bold items-center">
          <ReservationDetailsDialog reservation={reservation}/>

          {reservation.subscriptionStatus === "confirmed" && (
            <div className="flex gap-6">
              <Button
                variant="ghost"
                className=" text-red-500 hover:text-red-700"
              >
                <Ban className="h-4 w-4 cursor-pointer" /> Annuler
              </Button>
            </div>
          )}
        </div>
        {reservation.subscriptionStatus === "confirmed" && (
          <AccessCodeDialog code={code}/>
        )}
      </div>
    </div>
  );
}
