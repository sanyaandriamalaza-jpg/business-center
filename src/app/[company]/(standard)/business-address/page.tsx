import {
  ArrowRight,
  Building2,
  Clock,
  Download,
  Mail,
  MapPin,
} from "lucide-react";
import React from "react";
import FormuleSection from "./FormuleSection";
import ServiceCard from "@/src/components/global/ServiceCard";
import { Formule } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

const fetchOfferInfo = async (): Promise<Formule[] | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/virtual-office-offer`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? (data.data as Formule[]) : null;
  } catch (error) {
    return null;
  }
};

export default async function DomciliationPage() {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;

  const formules = await fetchOfferInfo();
  if (!formules) {
    notFound();
  }
  return (
    <div className=" min-h-screen ">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <div className="text-center mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-cStandard">
              Nos Formules
            </h2>
            <p className="text-xl text-cStandard/60">
              Choisissez le plan qui correspond le mieux à vos besoins.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {formules.map((formule: Formule) => (
              <FormuleSection
                key={formule.id}
                formule={formule}
                userId={userId as string}
                session={session}
              />
            ))}
          </div>
          {session && session.user.profileType && (
            <div className="pt-6 text-center text-sm text-cPrimary">
              En tant qu'administrateur, vous ne pouvez pas souscrire à un plan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
