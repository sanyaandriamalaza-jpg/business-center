"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactRound, CreditCard, TriangleAlert, User } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  BasicUser,
  InvoiceUserInfo,
  LatestInvoiceRef,
  NotifUserForBookingOfficeInfoData,
  Office,
  ReservationResumeType,
} from "@/src/lib/type";
import {
  getDuration,
  getNumberOfDays,
  normalizeAndCapitalize,
} from "@/src/lib/customfunction";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "@/src/lib/convertToSubcurrency";
import CheckoutPage from "./CheckoutPage";
import { useToast } from "@/src/hooks/use-toast";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import { setHours, setMinutes } from "date-fns";
import { getCSSVariablesAsHex } from "@/src/lib/utils";
import LoginRegisterModule from "@/src/components/global/LoginRegisterModule";
import { useSession } from "next-auth/react";
import { Separator } from "@/src/components/ui/separator";
import { Textarea } from "@/src/components/ui/textarea";

function combineDateAndTime(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  return setMinutes(setHours(date, hours), minutes);
}

const formSchema = z.object({
  name: z.string().min(1, "Veuillez entrer votre nom."),
  firstName: z.string().min(1, "Veuillez entrer votre prénom."),
  emailAddress: z.string().email({
    message: "Veuillez entrer une adresse email.",
  }),
  addressLine: z.string().min(1, "Veuillez entrer votre adresse."),
  city: z.string().min(1, "Veuillez entrer votre ville."),
  postalCode: z.string().min(4, "Code postal invalide."),
  state: z.string().min(1, "Veuillez entrer votre région."),
  country: z.string().min(1, "Veuillez entrer votre pays."),
});

type Props = {
  officeInfo: Office;
  reservationResume?: ReservationResumeType;
  step: number;
  setStep: (val: number) => void;
  setOfficeReservationInfo: (
    invoiceRef: string,
    invoiceRefNum: number,
    accessCode?: string | null
  ) => void;
};

export default function PaymentStep({
  officeInfo,
  reservationResume,
  step,
  setStep,
  setOfficeReservationInfo,
}: Props) {
  const { data: session, status } = useSession();

  const [errorMessage, setErrorMessage] = useState<string>();

  const [colors, setColors] = useState<Record<string, string>>();

  useEffect(() => {
    const data = getCSSVariablesAsHex([
      "custom-background-color",
      "custom-primary-color",
      "custom-foreground-color",
      "custom-standard-color",
    ]);
    setColors(data);
  }, []);

  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
  const stripePromise = loadStripe(`${stripePublicKey}`);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    criteriaMode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      firstName: "",
      emailAddress: "",
      addressLine: "",
      city: "",
      postalCode: "",
      state: "",
      country: "France",
    },
  });

  const { reset } = form;

  const total = useMemo(() => {
    if (!reservationResume || !officeInfo?.coworkingOffer) return 0;

    if (reservationResume.locationType === "hourly") {
      const duration = getDuration(
        reservationResume.timeStart!,
        reservationResume.timeEnd!
      );
      return duration * (officeInfo.coworkingOffer.hourlyRate ?? 0);
    }

    if (reservationResume.locationType === "daily") {
      const duration = getNumberOfDays(reservationResume.dailyDateRange!);
      return duration * (officeInfo.coworkingOffer.dailyRate ?? 0);
    }

    return 0;
  }, [reservationResume, officeInfo]);

  const { toast } = useToast();

  const [noteForAdmin, setNoteForAdmin] = useState<string>("");

  const setIsGeneralLoadingVisible = useGlobalStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );

  const handlePaymentAndInvoice = async (
    success: boolean,
    paymentId?: string,
    error?: string
  ) => {
    if (
      session &&
      status === "authenticated" &&
      session.user.profileType === "basicUser"
    ) {
      if (!success) {
        console.error("Erreur lors du paiement :", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors du paiement. Paiement non effectué.",
          variant: "destructive",
        });
        return;
      }

      setIsGeneralLoadingVisible(true);

      try {
        // FETCH NET AMOUNT
        let amountNet: number | null = null;
        if (paymentId) {
          try {
            const res = await fetch(
              `/api/payment-net?paymentIntentId=${paymentId}`
            );
            if (!res.ok) throw new Error("Erreur réseau");
            const data = await res.json();
            amountNet = typeof data.net === "number" ? data.net : null;
          } catch (e) {
            console.error("Erreur lors de la récupération du montant net :", e);
            amountNet = null;
          }
        }

        // CREATE ACCESS CODE
        let idAccessCode: number | null = null;
        let accessCode: string | null | undefined = null;
        if (currentBusinessCenter && currentBusinessCenter.digicodeIsActive) {
          try {
            const res = await fetch(`/api/access-code`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                idOffice: officeInfo.id,
              }),
            });
            const data = await res.json();
            if (data.success) {
              idAccessCode = data.data.id;
              accessCode = data.data.code;
            } else {
              console.warn("Création du code d'accès échouée :", data.message);
            }
          } catch (e) {
            console.error("Erreur lors de la création du code d'accès :", e);
          }
        }

        const dataForm = form.getValues();

        const duration =
          reservationResume?.locationType === "hourly"
            ? getDuration(
                reservationResume.timeStart!,
                reservationResume.timeEnd!
              )
            : getNumberOfDays(reservationResume?.dailyDateRange!);

        let latestInvoiceRefData: LatestInvoiceRef | undefined | null =
          undefined;
        if (currentBusinessCenter) {
          const res = await fetch(
            `/api/invoice/latest/${currentBusinessCenter.id}`
          );
          const data = await res.json();
          latestInvoiceRefData = data.success ? data.data : null;
        }

        const invoiceRefTemp = normalizeAndCapitalize(
          `${officeInfo.name} ${officeInfo.id} `
        );
        const invoiceRef =
          latestInvoiceRefData && latestInvoiceRefData.invoiceOfficeRef
            ? latestInvoiceRefData.invoiceOfficeRef
            : invoiceRefTemp.toUpperCase();

        const invoiceRefNum =
          latestInvoiceRefData && latestInvoiceRefData.nextReferenceNum
            ? latestInvoiceRefData.nextReferenceNum
            : Date.now();

        const dataToSend = {
          reference: invoiceRef,
          referenceNum: invoiceRefNum,
          userName: dataForm.name,
          userFirstName: dataForm.firstName,
          userEmail: dataForm.emailAddress,
          userAddressLine: dataForm.addressLine,
          userCity: dataForm.city,
          userState: dataForm.state,
          userPostalCode: dataForm.postalCode,
          userCountry: dataForm.country,
          startSubscription:
            reservationResume?.locationType === "hourly" &&
            reservationResume.dateStart &&
            reservationResume.timeStart
              ? combineDateAndTime(
                  reservationResume.dateStart,
                  reservationResume.timeStart
                )
              : (reservationResume?.dailyDateRange?.from ?? null),
          duration: duration,
          durationType:
            reservationResume?.locationType === "hourly" ? "hourly" : "daily",
          amount:
            reservationResume?.locationType === "hourly"
              ? parseFloat(`${officeInfo.coworkingOffer?.hourlyRate}`)
              : parseFloat(`${officeInfo.coworkingOffer?.dailyRate}`),
          amountNet: amountNet,
          currency: "eur",
          status: "paid",
          paymentMethod: "card",
          stripePaymentId: paymentId,
          idBasicUser: Number(session.user.id),
          idVirtualOfficeOffer: null,
          idAccessCode,
          idOffice: officeInfo.id,
          note: noteForAdmin ?? "",
        };

        const res = await fetch(`/api/invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });

        const dataRes = await res.json();
        if (dataRes.success) {
          setOfficeReservationInfo(invoiceRef, invoiceRefNum, accessCode);
          // SEND EMAIL
          try {
            const dataForEmail: NotifUserForBookingOfficeInfoData = {
              logoUrl: currentBusinessCenter?.logoUrl ?? null,
              reservationRef: `${invoiceRef}${invoiceRefNum}`,
              firstName: dataForm.firstName,
              reservationResume: reservationResume,
              officeInfo: officeInfo,
              accessCode: accessCode,
              companyInfoSummary: {
                name: currentBusinessCenter?.name,
                phone: currentBusinessCenter?.phone,
                addressLine: officeInfo.companyAddress?.addressLine,
                city: officeInfo.companyAddress?.city,
                postalCode: officeInfo.companyAddress?.postalCode,
                country: officeInfo.companyAddress?.country,
                state: officeInfo.companyAddress?.state,
              },
            };
            const response = await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: dataForm.emailAddress,
                subject: `Détails de votre réservation - ${dataForEmail.reservationRef} - ${currentBusinessCenter?.name}`,
                dataForEmail,
              }),
            });

            const data = await response.json();
          } catch (error) {}
          setStep(2);
          toast({
            title: "Paiement réussi",
            description: "Votre réservation a été réussie.",
            variant: "success",
          });
        } else {
          const msg = `Une erreur est survenue lors de la création de votre facture, mais votre paiement a bien été enregistré. Voici votre référence de paiement : ${paymentId}. Veuillez la conserver précieusement et contacter un administrateur pour finaliser le processus.`;
          setErrorMessage(msg);
          toast({
            title: "Erreur",
            description: "Échec de la création de la facture.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Erreur lors du traitement post-paiement :", err);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la création de la facture.",
          variant: "destructive",
        });
      } finally {
        setIsGeneralLoadingVisible(false);
      }
    }
  };

  const fetchBasicUserInfo = useCallback(
    async (userId: number): Promise<BasicUser | null> => {
      try {
        const res = await fetch(`/api/user/basic-user/${userId}`);
        const data = await res.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    []
  );
  useEffect(() => {
    if (session && status === "authenticated") {
      const userId = session.user.id;
      const userInfo = async () => {
        const userIdFormated = Number(userId);
        if (!isNaN(userIdFormated)) {
          const data = await fetchBasicUserInfo(userIdFormated);
          if (data) {
            reset({
              name: session.user.name ?? "",
              firstName: session.user.firstName,
              emailAddress: session.user.email ?? "",
              addressLine: data.addressLine ?? "",
              city: data.city ?? "",
              postalCode: data.postalCode ?? "",
              state: data.state ?? "",
              country: data.country ?? "",
            });
          }
        }
      };
      userInfo();
    }
  }, [session, status, fetchBasicUserInfo]);

  return (
    <>
      <Form {...form}>
        <div className="space-y-8">
          <Card
            className=""
            style={{
              backgroundColor: "rgb(var(--custom-background-color))",
              borderColor: "rgb(var(--custom-foreground-color)/0.1",
            }}
          >
            <CardContent className="py-6 px-6 pt-6 flex flex-col md:flex-row md:items-end text-cStandard">
              <div className="flex-1">
                <h2 className="font-bold text-cPrimary mb-4">
                  Résumé de la réservation
                </h2>
                <div className="text-sm text-cStandard/80">
                  Espace : {officeInfo.name}
                </div>

                {reservationResume?.locationType === "hourly" &&
                  reservationResume.dateStart && (
                    <>
                      <div className="text-sm text-cStandard/80">
                        Date :{" "}
                        {format(reservationResume.dateStart, "EEE d MMM", {
                          locale: fr,
                        })}
                      </div>
                      <div className="text-sm text-cStandard/80">
                        Horaire : {reservationResume.timeStart} -{" "}
                        {reservationResume.timeEnd}
                      </div>
                      <div className="text-sm text-cStandard/80">
                        Durée :{" "}
                        {getDuration(
                          reservationResume.timeStart!,
                          reservationResume.timeEnd!
                        )}{" "}
                        {getDuration(
                          reservationResume.timeStart!,
                          reservationResume.timeEnd!
                        ) > 1
                          ? "heures"
                          : "heure"}
                      </div>
                    </>
                  )}

                {reservationResume?.locationType === "daily" && (
                  <>
                    <div className="text-sm text-cStandard/80">
                      Du{" "}
                      {format(
                        reservationResume.dailyDateRange?.from!,
                        "EEE d MMM yyyy",
                        {
                          locale: fr,
                        }
                      )}{" "}
                      au{" "}
                      {format(
                        reservationResume.dailyDateRange?.to!,
                        "EEE d MMM yyyy",
                        {
                          locale: fr,
                        }
                      )}
                    </div>
                    <div className="text-sm text-cStandard/80">
                      {getNumberOfDays(reservationResume.dailyDateRange!)}{" "}
                      {getNumberOfDays(reservationResume.dailyDateRange!) > 1
                        ? "jours"
                        : "jour"}
                    </div>
                  </>
                )}
                <hr className="my-4 border-cStandard/20" />
                <div className="font-bold text-cStandard">
                  Total : {total.toFixed(2)}€
                </div>
              </div>
            </CardContent>
          </Card>
          <Separator className="mb-4" />
          <div>
            <h2 className="font-bold text-cPrimary mb-4">
              Message pour l‘administrateur
            </h2>
            <Textarea
              value={noteForAdmin}
              onChange={(e) => {
                setNoteForAdmin(e.target.value);
              }}
              placeholder="Laissez une note à l‘administrateur ici..."
              rows={5}
            />
          </div>

          <div>
            <LoginRegisterModule />
          </div>
          {status === "authenticated" &&
            session.user.profileType === "basicUser" && (
              <>
                <Card
                  style={{
                    backgroundColor: "rgb(var(--custom-background-color))",
                    borderColor: "rgb(var(--custom-foreground-color)/0.1",
                  }}
                >
                  <CardContent className="py-6 px-6 pt-6">
                    <div className="flex items-center gap-2 mb-6">
                      <ContactRound className="text-cPrimary" />
                      <h3 className="font-bold text-lg text-cPrimary">
                        Informations de facturation
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          name: "name",
                          label: "Nom",
                          autoComplete: "family-name",
                        },
                        {
                          name: "firstName",
                          label: "Prénom",
                          autoComplete: "given-name",
                        },
                      ].map(({ name, label, autoComplete }) => (
                        <FormField
                          key={name}
                          name={name as keyof typeof formSchema.shape}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-cStandard/80">
                                {label}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="text-cStandard"
                                  autoComplete={autoComplete}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormField
                      name="emailAddress"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="text-cStandard/80">
                            Adresse email
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="text-cStandard"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="addressLine"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="text-cStandard/80">
                            Adresse
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="text-cStandard"
                              autoComplete="address-line1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {[
                        {
                          name: "city",
                          label: "Ville",
                          autoComplete: "address-level2",
                        },
                        {
                          name: "postalCode",
                          label: "Code postal",
                          autoComplete: "postal-code",
                          type: "number",
                        },
                      ].map(({ name, label, autoComplete, type }) => (
                        <FormField
                          key={name}
                          name={name as keyof typeof formSchema.shape}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-cStandard/80">
                                {label}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="text-cStandard"
                                  autoComplete={autoComplete}
                                  type={type}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {[
                        {
                          name: "state",
                          label: "Région",
                          autoComplete: "address-level1",
                        },
                        {
                          name: "country",
                          label: "Pays",
                          autoComplete: "country-name",
                        },
                      ].map(({ name, label, autoComplete }) => (
                        <FormField
                          key={name}
                          name={name as keyof typeof formSchema.shape}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-cStandard/80">
                                {label}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="text-cStandard"
                                  autoComplete={autoComplete}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {errorMessage && (
                  <div className="text-red-500 flex gap-2">
                    <span>
                      <TriangleAlert />
                    </span>
                    <span>{errorMessage}</span>
                  </div>
                )}
                {/* Paiement */}
                {total && total > 0 && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      mode: "payment",
                      amount: convertToSubcurrency(total),
                      currency: "eur",
                      payment_method_types: ["card"],
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorBackground: colors
                            ? colors["custom-background-color"]
                            : "#ffffff",
                          colorPrimary: "#2563eb",
                          colorText: colors
                            ? colors["custom-standard-color"]
                            : "#000000",
                          borderRadius: "8px",
                          fontFamily: "Inter, sans-serif",
                        },
                      },
                    }}
                  >
                    <CheckoutPage
                      amount={total}
                      onPaymentResult={handlePaymentAndInvoice}
                      verifyForm={form.trigger}
                    />
                  </Elements>
                )}
              </>
            )}
        </div>
      </Form>
    </>
  );
}
