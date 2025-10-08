"use client";

import Image from "next/image";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { DayName, Office } from "@/src/lib/type";
import { translateCoworkingOfferType } from "@/src/lib/customfunction";
import { allEquipments, dayNameFrMap } from "@/src/lib/utils";
import ReservationTabs from "./ReservationTabs";
import Link from "next/link";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import dynamic from "next/dynamic";
import LoginRegisterModule from "@/src/components/global/LoginRegisterModule";
import { useSession } from "next-auth/react";
import ImageCarousel from "./ImageCarousel";

const KonvaViewer = dynamic(
  () =>
    import("@/src/app/[company]/(connected)/admin/interactive-map/KonvaViewer"),
  {
    ssr: false,
  }
);

export default function SingleOfficePageWrapper({
  office,
}: {
  office: Office;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const featuresWithIcon = office.features
    .map((feature) => {
      return allEquipments.find((item) => item.value === feature.value);
    })
    .filter((feature) => feature !== undefined);

  const address = office.specificAddress
    ? office.specificAddress
    : office.companyAddress;

  const openingHours = office.specificBusinessHour
    ? office.specificBusinessHour
    : office.businessHour;

  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );

  const imagesCarousel = (office.officeAdditionalImages || [])
    .map((element) =>
      element.urlImage
        ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${element.urlImage}`
        : null
    )
    .filter((url): url is string => !!url);


  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4">
        <div className="mb-2 xl:mb-6 ">
          <Button
            variant="ghost"
            asChild
            className="px-0 flex items-center gap-2 text-cPrimary hover:bg-transparent hover:text-cPrimaryHover"
          >
            <Link href={`/${currentBusinessCenter?.slug}/spaces`}>
              <ArrowLeft size={18} /> Retour aux espaces
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-8 mb-4 xl:mb-8">
          <div className="col-span-1 lg:col-span-2 w-full max-h-[400px]  lg:max-h-none xl:h-full">
            {office.officeAdditionalImages ? (
              <div className="relative rounded-lg overflow-hidden flex items-center ">
                <ImageCarousel
                  officeName={office.name}
                  imagesList={[
                    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${office.imageUrl}`,
                    ...imagesCarousel,
                  ]}
                />
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden h-full flex items-center">
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${office.imageUrl}`}
                  alt={office.name}
                  fill
                  className="object-cover h-full w-full"
                />

                {office.coworkingOffer?.type && (
                  <span className="absolute top-4 right-4 bg-cPrimary text-cForeground rounded-full text-sm px-3 py-1">
                    {translateCoworkingOfferType(office.coworkingOffer?.type)}
                  </span>
                )}
              </div>
            )}
          </div>
          <Card
            className="rounded-lg p-4  2xl:p-6 shadow-md"
            style={{
              backgroundColor: "rgb(var(--custom-background-color))",
              borderColor: "rgb(var(--custom-foreground-color)/0.1",
            }}
          >
            <CardContent className="px-4 pt-4">
              <h1 className="text-2xl font-bold mb-4 text-cStandard">
                {" "}
                {office.name}{" "}
              </h1>
              <ul className="space-y-2 text-gray-600 mb-6">
                {address && (
                  <li className="flex items-start gap-2 text-sm">
                    <MapPin size={18} className="text-cPrimary" />
                    <div className="flex flex-col text-cStandard">
                      <span>{address.addressLine ?? ""}</span>
                      <span>
                        {address.city ?? ""} {address?.postalCode ?? ""}{" "}
                      </span>
                      <span>{address.state ?? ""} </span>
                      <span>{address.country ?? ""} </span>
                    </div>
                  </li>
                )}
                <li className="flex items-center gap-2 text-sm text-cStandard">
                  <Users size={18} className="text-cPrimary" /> Capacité : {" "}
                  {office.maxSeatCapacity > 1 && "jusqu‘à"}{" "}
                  {office.maxSeatCapacity} personne
                  {office.maxSeatCapacity > 1 ? "s" : ""}
                </li>
              </ul>
              <hr className="my-4 border-cStandard/20" />
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-cStandard">Tarifs</h3>
                <div className="flex justify-between">
                  <span className="text-cStandard/80">Tarif horaire</span>
                  <span className=" text-cPrimary">
                    {" "}
                    {office.coworkingOffer?.hourlyRate} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cStandard/80">
                    Tarif journalier (8 heures)
                  </span>
                  <span className=" text-cPrimary">
                    {" "}
                    {office.coworkingOffer?.dailyRate} €
                  </span>
                </div>
              </div>
              <hr className="my-4 border-cStandard/20" />
              <div>
                <div className="font-semibold mb-2 text-cStandard">
                  Équipements
                </div>
                <ul className="flex flex-wrap gap-2">
                  {featuresWithIcon.map((feature, i) => (
                    <li
                      key={i}
                      className="bg-cPrimary/10 text-cPrimary px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {" "}
                      <feature.icon className="h-4 w-4 mr-1" />{" "}
                      {feature.label}{" "}
                    </li>
                  ))}
                </ul>
              </div>
              <hr className="my-4 border-cStandard/20" />
              <div>
                <div className="font-semibold mb-2 text-cStandard">
                  Horaire d‘ouverture
                </div>
                <>
                  {openingHours && (
                    <ul className="space-y-1 text-sm text-cStandard grid lg:grid-cols-2 lg:space-y-0 xl:grid-cols-1 2xl:grid-cols-2 2xl:space-y-0">
                      {Object.entries(openingHours).map(([day, info]) => (
                        <li key={day}>
                          {dayNameFrMap[day as DayName]} :{" "}
                          {info?.isClosed
                            ? "Fermé"
                            : `${info?.open ?? "--:--"} - ${
                                info?.close ?? "--:--"
                              }`}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="xl:mt-10 ">
          <Card
            className="rounded-lg shadow-md xl:p-6 mb-8"
            style={{
              backgroundColor: "rgb(var(--custom-background-color))",
              borderColor: "rgb(var(--custom-foreground-color)/0.1",
            }}
          >
            <CardContent className="px-4 pt-4 space-y-3 lg:space-y-4">
              <h2 className="font-bold text-xl text-cStandard">
                À propos de cet espace
              </h2>
              <p className="text-cStandard/90 text-sm md:text-base">
                {office.description}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="hidden md:block">
          {office.idKonvaMap && (
            <div className="mb-3">
              <KonvaViewer id={office.idKonvaMap} isAdmin={false} />
            </div>
          )}
        </div>
        {(status === "unauthenticated" ||
          !session ||
          session.user.profileType === "basicUser") && (
          <ReservationTabs
            officeInfo={office}
            price={{
              hourly: office.coworkingOffer?.hourlyRate,
              daily: office.coworkingOffer?.dailyRate,
            }}
          />
        )}
      </div>
    </div>
  );
}
