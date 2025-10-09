"use client";

import React from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  CreditCard,
  MapPin,
  User,
  Building,
  FileText,
  Clock,
  Euro,
  ClockAlert,
  Clock10,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GeneratePdfInvoice from "@/src/components/global/GeneratePdfInvoice";
import {
  getStatusColor,
  translateStatus,
  translatePayment,
  translateDuration,
} from "@/src/lib/utils";
import { InvoiceDataFormat } from "@/src/lib/type";

interface InvoiceResponse {
  success: boolean;
  data: InvoiceDataFormat;
}

interface Props {
  initialData: InvoiceResponse;
  companySlug: string;
  invoiceId: string;
}
export default function InvoiceDetailPageWrapper({
  initialData,
  companySlug,
  invoiceId,
}: Props) {
  const router = useRouter();
  const { data } = initialData;

  const handleBack = () => {
    router.push(`/${companySlug}/admin/customer-invoice`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "EUR",
    }).format(amount);
  };

  return (
    <div className=" py-8 min-h-screen">
      <div className=" mx-auto p-6 ">
        {/* Header avec bouton retour */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-purple-900 bg-purple-200  hover:bg-purple-300 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux factures
            </button>
          </div>
          <GeneratePdfInvoice
            invoiceData={data}
            onGenerate={() => console.log("PDF généré!")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales de la facture */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Référence de facture: {data.invoice.reference}
                      {data.invoice.referenceNum}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatAmount(data.invoice.amount, data.invoice.currency)}
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.invoice.status)}`}
                    >
                      {translateStatus(data.invoice.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Date d'émission
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(data.invoice.issueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Date de début
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(data.invoice.serviceStartDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock10 className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Durée</p>
                      <p className="text-sm text-gray-600">
                        {data.invoice.duration} Mois
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockAlert className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Modalité de paiement
                      </p>
                      <p className="text-sm text-gray-600">
                        {translateDuration(data.invoice.durationType)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Méthode de paiement
                      </p>
                      <p className="text-sm text-gray-600">
                        {translatePayment(data.invoice.paymentMethod)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${data.invoice.isProcessed ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Statut de traitement
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.invoice.isProcessed ? "Traitée" : "En cours"}
                      </p>
                    </div>
                  </div>
                  {Number(data.invoice.stripePaymentId) > 0 && (
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full bg-blue-500`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Identifiant du payement:
                        </p>
                        <p className="text-sm text-gray-600">
                          {data.invoice.stripePaymentId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {data.invoice.note && (
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Note
                    </h3>
                    <p className="text-sm text-gray-600">{data.invoice.note}</p>
                  </div>
                </div>
              )}
            </div>

            {data.service && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Service facturé
                </h3>

                {data.service.type === "virtual_office" ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {data.service.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.service.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-blue-600">
                        {formatAmount(
                          data.service.price,
                          data.invoice.currency
                        )}
                      </span>
                      {data.service.isTagged && data.service.tag && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {data.service.tag}
                        </span>
                      )}
                    </div>
                    {data.service.features &&
                      data.service.features.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            Fonctionnalités:
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {data.service.features.map(
                              (feature: string, index: number) => (
                                <li key={index}>{feature}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                ) : data.service.type === "office_reservation" ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {data.service.office.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.service.office.description}
                      </p>
                    </div>

                    {data.service.coworkingOffer && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Offre coworking
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {data.service.coworkingOffer.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span>
                            Tarif horaire:{" "}
                            {formatAmount(
                              data.service.coworkingOffer.hourlyRate,
                              data.invoice.currency
                            )}
                          </span>
                          <span>
                            Tarif journalier:{" "}
                            {formatAmount(
                              data.service.coworkingOffer.dailyRate,
                              data.invoice.currency
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {data.service.accessCode && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Code d'accès
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Code: </span>
                            <span className="font-mono font-medium">
                              {data.service.accessCode.code}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Statut: </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${getStatusColor(data.service.accessCode.status)}`}
                            >
                              {data.service.accessCode.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Début: </span>
                            <span>
                              {formatDate(
                                data.service.accessCode.startValidity
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Fin: </span>
                            <span>
                              {formatDate(data.service.accessCode.endValidity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Sidebar avec informations client et entreprise */}
          <div className="space-y-6">
            {/* Informations client */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Client
              </h3> */}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {data?.customer?.profilePictureUrl ? (
                    <Image
                      src={data.customer.profilePictureUrl}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {data.customer.firstName} {data.customer.name}
                    </p>


                    {data.customer.email &&(                 <p className="text-sm text-gray-600">
                      {data.customer.email}
                    </p>)}
   
                  </div>
                </div>

                <div className="space-y-2">
                  {data.customer.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Téléphone:</span>
                      <span className="text-sm font-medium">
                        {data.customer.phone}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">
                        {data.customer.address.addressLine}
                      </p>
                      <p className="text-gray-600">
                        {data.customer.address.postalCode}
                        {data.customer.address.city}
                      </p>
                      <p className="text-gray-600">
                        {data.customer.address.state},
                        {data.customer.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Client depuis: {formatDate(data.customer.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations entreprise */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Entreprise
              </h3> */}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {data?.company?.logoUrl ? (
                    <Image
                      src={data.company.logoUrl}
                      alt="Logo"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {data.company.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {data.company.legalForm}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {data.company.siren && (
                    <div>
                      <span className="text-gray-600">SIREN: </span>
                      <span className="font-medium">{data.company.siren}</span>
                    </div>
                  )}

                  {data.company.siret && (
                    <div>
                      <span className="text-gray-600">SIRET: </span>
                      <span className="font-medium">{data.company.siret}</span>
                    </div>
                  )}

                  {data?.company?.email && (
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <span className="font-medium">{data.company.email}</span>
                    </div>
                  )}

                  {data?.company?.phone && (
                    <div>
                      <span className="text-gray-600">Téléphone: </span>
                      <span className="font-medium">{data.company.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">
                        {data.company.address.addressLine}
                      </p>
                      <p className="text-gray-600">
                        {data.company.address.postalCode}{" "}
                        {data.company.address.city}
                      </p>
                      <p className="text-gray-600">
                        {data.company.address.state},{" "}
                        {data.company.address.country}
                      </p>
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
