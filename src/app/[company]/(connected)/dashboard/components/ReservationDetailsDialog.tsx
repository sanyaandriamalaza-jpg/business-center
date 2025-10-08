import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Separator } from "@/src/components/ui/separator";
import { DurationType, Invoice, SubscriptionStatus } from "@/src/lib/type";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Eye, MapPin } from "lucide-react";
import Image from "next/image";

export default function ReservationDetailsDialog({
  reservation,
}: {
  reservation: Invoice;
}) {
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

  const getDurationText = () => {
    const durationMap = {
      hourly: `${reservation.duration} heure${reservation.duration > 1 ? "s" : ""}`,
      daily: `${reservation.duration} jour${reservation.duration > 1 ? "s" : ""}`,
      monthly: `${reservation.duration} mois`,
      annualy: `${reservation.duration} an(s)`,
    };
    return durationMap[reservation.durationType];
  };

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

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-cPrimary/80 hover:text-cPrimaryHover hover:bg-transparent "
        >
          <Eye className="h-4 w-4" /> Voir les détails
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Détails de la réservation
          </DialogTitle>
          <DialogDescription>
            Référence: {reservation.reference}_{reservation.referenceNum}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold text-cStandard">
                {reservation.office?.name}
              </h3>
              <Badge
                variant={null}
                className={statusStyle[reservation.subscriptionStatus]}
              >
                {statusText[reservation.subscriptionStatus]}
              </Badge>
            </div>
            <div className="w-full h-44 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${reservation.office?.imageUrl}`}
                alt={reservation.office?.name as string}
                width={128}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Calendar className="w-5 h-5 mt-0.5 text-cPrimary/60" />
                <div>
                  <p className="font-medium text-sm">Date de début</p>
                  <p className="text-sm text-cStandard/60">
                    {format(
                      reservation.startSubscription,
                      "EEEE dd MMMM yyyy à HH:mm",
                      {
                        locale: fr,
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Clock className="w-5 h-5 mt-0.5 text-cPrimary/60" />
                <div>
                  <p className="font-medium text-sm">Durée</p>
                  <p className="text-sm text-cStandard/60">
                    {getDurationText()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <MapPin className="w-5 h-5 mt-0.5 text-cPrimary/60" />
                <div>
                  <p className="font-medium text-sm">Localisation</p>
                  <p className="text-sm text-cStandard/60">
                    {reservation.office?.specificAddress?.city}
                  </p>
                  <p className="text-xs text-cStandard/40">
                    {reservation.office?.specificAddress?.addressLine}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-sm mb-2">Période de réservation</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">
                {isSameDay(start, end)
                  ? `Le ${format(start, "dd/MM/yyyy")} de ${format(start, "HH:mm")} à ${format(end, "HH:mm")}`
                  : `Du ${format(start, "dd/MM/yyyy HH:mm")} au ${format(end, "dd/MM/yyyy HH:mm")}`}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Montant total</span>
            <span className="text-2xl font-bold text-cPrimary/60">
              {reservation.amountNet}{" "}
              {reservation.currency === "eur" ? "€" : "$"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
