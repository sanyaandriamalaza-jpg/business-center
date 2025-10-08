import { Invoice } from "@/src/lib/type";
import Image from "next/image";
import FormatCoworkingOfferStatus from "../../components/FormatCoworkingOfferStatus";
import { Mail, MapPin, UserRound, Users } from "lucide-react";
import { allEquipments, cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { addDays, addHours, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import FormatInvoiceStatus from "../../components/FormatInvoiceStatus";
import { SubscriptionStatusBadge } from "../../components/SubscriptionStatusBadge";

export default function ReservationDetailPageWrapper({
  invoice,
}: {
  invoice: Invoice;
}) {
  const office = invoice.office;
  const featuresWithIcon = office?.features
    .map((feature) => {
      return allEquipments.find((item) => item.value === feature.value);
    })
    .filter((feature) => feature !== undefined);
  const address =
    office && office.specificAddress
      ? office.specificAddress
      : office?.companyAddress;

  const user = invoice.user;

  return (
    <div className="space-y-3 py-6 lg:px-4 pt-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Détail de la réservation
        </h1>
      </div>
      <div className="w-full bg-white rounded-md p-4 md:p-6 text-gray-600">
        <div className="grid grid-cols-12 gap-4 lg:divide-x divide-slate-200 ">
          <div className="col-span-12 lg:col-span-6">
            <div className="space-y-5">
              <div className="space-y-4">
                <h2 className="font-bold text-indigo-700">Réservation</h2>
                <div className="space-y-4">
                  {office && (
                    <div className="flex flex-col xl:flex-row gap-4">
                      <div className="h-[250px] aspect-video flex items-center justify-center overflow-hidden rounded">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${office.imageUrl}`}
                          alt={office.name}
                          width={(250 * 16) / 9}
                          height={250}
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        {office.coworkingOffer && (
                          <div>
                            <FormatCoworkingOfferStatus
                              type={office.coworkingOffer?.type}
                            />
                          </div>
                        )}
                        <div>
                          <p>{office?.name}</p>
                          <p className="text-sm"> {office.description} </p>
                        </div>
                        <ul className="space-y-2 text-gray-600 mb-6">
                          {address && (
                            <li className="flex items-start gap-2 text-sm">
                              <MapPin size={18} className="text-indigo-700" />
                              <div className="flex flex-col">
                                <span>{address.addressLine ?? ""}</span>
                                <span>
                                  {address.city ?? ""}{" "}
                                  {address?.postalCode ?? ""}{" "}
                                </span>
                                <span>{address.state ?? ""} </span>
                                <span>{address.country ?? ""} </span>
                              </div>
                            </li>
                          )}
                          <li className="flex items-center gap-2 text-sm">
                            <Users size={18} className="text-indigo-700" />{" "}
                            Capacité :{" "}
                            {office.maxSeatCapacity > 1 && "jusqu&apos;à"}{" "}
                            {office.maxSeatCapacity} personne
                            {office.maxSeatCapacity > 1 ? "s" : ""}
                          </li>
                        </ul>
                        {featuresWithIcon && (
                          <div>
                            <div className="font-semibold mb-2">
                              Équipements
                            </div>
                            <ul className="flex flex-wrap gap-2">
                              {featuresWithIcon.map((feature, i) => (
                                <li
                                  key={i}
                                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  <feature.icon className="h-4 w-4 mr-1" />{" "}
                                  {feature.label}{" "}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1 text-[0.92rem]  ">
                    <p>
                      Référence de la réservation : {invoice.reference}
                      {invoice.referenceNum}
                    </p>
                    <p>
                      Réservé le :{" "}
                      {format(invoice.issueDate, "dd/MM/yyyy", {
                        locale: fr,
                      })}{" "}
                      à {format(invoice.issueDate, "HH:mm", { locale: fr })}
                    </p>
                    <div>
                      Location :{" "}
                      <Badge
                        variant="outline"
                        className={cn(
                          invoice.durationType === "hourly"
                            ? "bg-blue-500"
                            : "bg-orange-600",
                          "text-white"
                        )}
                      >
                        {invoice.durationType === "hourly"
                          ? "Horaire"
                          : "Journalier"}
                      </Badge>
                    </div>
                    <>
                      {invoice.durationType === "hourly" ? (
                        <div>
                          <div>
                            Date :{" "}
                            {format(invoice.startSubscription, "dd/MM/yyyy", {
                              locale: fr,
                            })}{" "}
                            - De{" "}
                            {format(invoice.startSubscription, "HH:mm", {
                              locale: fr,
                            })}{" "}
                            à{" "}
                            {format(
                              addHours(
                                invoice.startSubscription,
                                invoice.duration
                              ),
                              "HH:mm",
                              { locale: fr }
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div>
                            Date de début :{" "}
                            {format(invoice.startSubscription, "dd/MM/yyyy", {
                              locale: fr,
                            })}
                          </div>
                          <div>
                            Date de fin:{" "}
                            {format(
                              addDays(
                                invoice.startSubscription,
                                invoice.duration
                              ),
                              "dd/MM/yyyy",
                              { locale: fr }
                            )}
                          </div>
                        </div>
                      )}
                    </>
                    <div>
                      Durée : {invoice.duration}{" "}
                      {invoice.durationType === "hourly" ? "heure" : "jour"}
                      {invoice.duration > 1 ? "s" : ""}
                    </div>
                    <div>
                      Statut de l‘abonnement :{" "}
                      <SubscriptionStatusBadge
                        status={invoice.subscriptionStatus}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-200/70">
                <h2 className="font-bold text-indigo-700">Paiement</h2>
                <div className="pt-2 text-[0.92rem] ">
                  <div className="flex gap-2 items-center">
                    <span>Statut : </span>
                    <FormatInvoiceStatus status={invoice.status} />
                  </div>
                  <p>
                    Montant :{" "}
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: invoice.currency,
                    }).format(invoice.amount * invoice.duration)}
                  </p>
                  {invoice.amountNet && (
                    <p className="flex gap-2 items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span> Montant net </span>
                          </TooltipTrigger>
                          <TooltipContent
                            style={{ backgroundColor: "#422dd7" }}
                          >
                            <p>
                              Il s‘agit du montant net que vous recevez sur
                              votre compte Stripe
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span>
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: invoice.currency,
                        }).format(invoice.amountNet)}
                      </span>
                    </p>
                  )}
                  <p>ID du paiement Stripe : {invoice.stripePaymentId}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 xl:col-span-5 xl:col-start-8">
            <div className="lg:pl-4 space-y-3 sticky top-[130px] ">
              <h2 className="font-bold text-indigo-700">
                Informations sur le client
              </h2>
              <div className="border border-slate-200 rounded-xl bg-white p-3 space-y-1 text-[0.92rem] ">
                <div className="flex gap-3 items-center">
                  <div>
                    <UserRound size={18} />
                  </div>
                  <div>
                    {user.name} {user.firstName}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div>
                    <Mail size={18} />
                  </div>
                  <div>{user.email}</div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="pt-1">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div>
                      {user.addressLine}, {user.postalCode} {user.city}
                    </div>
                    <div>
                      {" "}
                      {user.state}, {user.country}{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
