import React from "react";
import {
  CreditCard,
  FileCheck2,
  FileCog,
  Mailbox,
  PanelTop,
} from "lucide-react";
import StateCards from "./StateCardCommponent";
import FeatureCard from "./FeatureCard";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { baseUrl } from "@/src/lib/utils";

const fetchFiles = async (userId: string) => {
  try {
    const res = await fetch(
      `${baseUrl}/api/upload-file-user?id_basic_user=${userId}`,
      {
        cache: "no-store",
      }
    );
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
    return null;
  }
};

const fetchContract = async (userId: string) => {
  try {
    const res = await fetch(
      `${baseUrl}/api/contract-file?id_basic_user=${userId}`,
      {
        cache: "no-store",
      }
    );
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Erreur lors de la récupération des contracts :", error);
    return null;
  }
};

export default async function DomiciliationWrapper() {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const userId =
    session.user.profileType === "basicUser" ? session.user.id : null;

  const files = await fetchFiles(userId as string);
  const contract = await fetchContract(userId as string);
  let currentStep;

  if (!files && !contract) currentStep = 1;
  else if (
    files.files.total > 0 &&
    0 <= files.files.stats.validated &&
    files.files.stats.validated <= 3
  )
    currentStep = 3;
  else if (files.files.stats.validated === 4 && contract.length === 0)
    currentStep = 4;
  else if (
    files.files.stats.validated === 4 &&
    contract.length > 0 &&
    !contract[0].isContractSignedByAdmin &&
    !contract[0].isContractSignedByUser
  )
    currentStep = 5;
  else if (
    files.files.stats.validated === 4 &&
    contract.length > 0 &&
    !contract[0].isContractSignedByAdmin &&
    contract[0].isContractSignedByUser
  )
    currentStep = 6;
  else if (
    files.files.stats.validated === 4 &&
    contract.length > 0 &&
    contract[0].isContractSignedByAdmin &&
    contract[0].isContractSignedByUser
  )
    currentStep = 7;
  else currentStep = 2;

  const Features = [
    {
      icon: Mailbox,
      iconColor: "text-indigo-600 bg-indigo-100",
      title: "Courrier Scannés",
      description: "Consultez le courrier reçu à l'adresse de domiciliation.",
      href: `/${session.user.companySlug}/dashboard/company-domiciliation/scanned-letters`,
      isSm: false,
    },
    {
      icon: FileCheck2,
      iconColor: "text-emerald-600 bg-emerald-100",
      title: "Informations contractuelles",
      description:
        "Accès aux documents tels que le contart de domiciliation, factures, attestation de domiciliation, RIB, status, Kbis, etc",
      href: `/${session.user.companySlug}/dashboard/company-domiciliation/contractual-info`,
      isSm: true,
    },
    {
      icon: FileCog,
      iconColor: "text-gray-600 bg-gray-100",
      title: "Paramètres génèraux",
      description:
        "Configurez votre adresse de réexpédition de courrier et personnalisez vos préférences liées à votre domiciliation.",
      href: `/${session.user.companySlug}/dashboard/company-domiciliation/general-parameters`,
      isSm: true,
    },
    {
      icon: CreditCard,
      iconColor: "text-purple-600 bg-purple-100",
      title: "Factures mensuelles",
      description: "Gérer facilement votre abonnement et suivez vos factures",
      href: `/${session.user.companySlug}/dashboard/company-domiciliation/billing`,
      isSm: false,
    },
  ];
  return (
    <div className="container min-h-screen mx-auto px-4">
      <div className="py-3 space-y-2 mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-cStandard">
          Domiciliation
        </h2>
        <p className="text-cStandard/80 text-sm md:text-base">
          Suivez en temps réel l'etat d'avancement de votre souscription de
          Domiciliation.{" "}
        </p>
      </div>
      <div className="bg-cBackground py-8  w-full rounded-2xl shadow-sm">
        <div className="mb-10 ">
          <StateCards currentStep={currentStep as number} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:pr-16 md:pl-20">
          <div className="h-1/2 space-y-4">
            <FeatureCard
              icon={Features[0].icon}
              iconColor={Features[0].iconColor}
              title={Features[0].title}
              description={Features[0].description}
              href={Features[0].href}
              isSm={Features[0].isSm}
            />
            <FeatureCard
              icon={Features[2].icon}
              iconColor={Features[2].iconColor}
              title={Features[2].title}
              description={Features[2].description}
              href={Features[2].href}
              isSm={Features[2].isSm}
            />
          </div>
          <div className="h-1/2 space-y-4">
            <FeatureCard
              icon={Features[1].icon}
              iconColor={Features[1].iconColor}
              title={Features[1].title}
              description={Features[1].description}
              href={Features[1].href}
              isSm={Features[1].isSm}
            />
            <FeatureCard
              icon={Features[3].icon}
              iconColor={Features[3].iconColor}
              title={Features[3].title}
              description={Features[3].description}
              href={Features[3].href}
              isSm={Features[3].isSm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
