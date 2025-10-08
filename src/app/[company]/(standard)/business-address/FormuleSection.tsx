"use client";

import { Button } from "@/src/components/ui/button";
import { Formule } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import { Building2, Check } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function FormuleSection({
  formule,
  userId,
  session,
}: {
  formule: Formule;
  userId: string;
  session?: Session | null;
}) {
  const [activePlan, setActivePlan] = useState("");

  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );

  useEffect(() => {
    const getInvoices = async () => {
      const res = await fetch(
        `${baseUrl}/api/virtual-office?id_basic_user=${userId}`
      );
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const plan = data.data[0].virtualOfficeOffer.offerName;
        setActivePlan(plan);
      }
    };
    if (userId) {
      getInvoices();
    }
  }, [userId]);

  return (
    <div className="relative bg-cBackground rounded-2xl shadow-lg p-10 flex-1 flex flex-col overflow-hidden">
      {formule.isTagged === true && (
        <span className="absolute -top-1 right-0 text-cForeground bg-cPrimary text-sm px-6 py-1.5 rounded-bl-lg font-medium shadow z-10">
          {formule.tag}
        </span>
      )}
      <div className="flex items-center gap-3 mb-4">
        <Building2
          size={32}
          className={`${formule.name === "Premium" ? "text-cPrimary" : "text-cStandard"} `}
        />
        <span className="font-bold text-2xl text-cStandard">
          {formule.name}
        </span>
      </div>
      <div className="text-cStandard/70 mb-6">{formule.description}</div>
      <div className="text-4xl font-extrabold text-cPrimary mb-0 leading-none">
        {formule.monthlyPrice}€
        <span className="text-xl font-normal text-cStandard/70 align-super ml-1">
          /mois
        </span>
      </div>
      <ul className="flex-1 mt-6 space-y-3 mb-8">
        {formule.features?.map((offre) => (
          <li key={offre} className="flex items-center gap-2 text-sm">
            <Check className="text-cPrimary" />
            <span className="text-cStandard/70">{offre}</span>
          </li>
        ))}
      </ul>
      <>
        {(session?.user.profileType === "basicUser" || session == null) && (
          <>
            {activePlan === formule.name ? (
              <Button
                disabled
                className="bg-cPrimary/40 text-cForeground cursor-not-allowed font-medium rounded-lg py-6 w-full mt-auto"
              >
                Formule actuelle
              </Button>
            ) : (
              <Link
                href={`/${currentBusinessCenter?.slug}/business-address/${formule.id}`}
              >
                <Button
                  variant="ghost"
                  className={`${formule.name === "Premium" ? "bg-cPrimary text-cForeground hover:bg-cPrimaryHover hover:text-cForeground" : "bg-cBackground border border-cStandard/20 hover:bg-cPrimary hover:text-cForeground text-cPrimary"} font-medium rounded-lg py-6 w-full mt-auto hover:bg-cPrimaryHover transition `}
                >
                  {activePlan && activePlan === formule.name
                    ? "Passer"
                    : "Souscrire"}{" "}
                  au plan {formule.name}
                </Button>
              </Link>
            )}
          </>
        )}
      </>
    </div>
  );
}
