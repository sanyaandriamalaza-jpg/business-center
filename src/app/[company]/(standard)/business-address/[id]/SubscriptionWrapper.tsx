import { Formule } from "@/src/lib/type";
import DocumentUpload from "./DocumentUpload";
import { PlanCard } from "./PlanCard";
import { RegistrationForm } from "./RegistrationForm";

export default function SubscriptionWrapper({
  offerData,
}: {
  offerData: Formule;
}) {
  return (
    <div className="container w-full mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-cStandard mb-2">
          Domiciliation
        </h1>
        <p className="text-cStandard/70 text-sm md:text-base">
          Obtenez une adresse professionnelle reconnue pour votre siège social,
          accompagnement personnalisé et services sur mesure adaptés à votre
          activité.
        </p>
      </div>
      <div className="bg-cBackground/70 py-8 px-4 md:px-12 w-full rounded-xl shadow-sm">
        <PlanCard name={offerData.name} />
        <RegistrationForm isAdmin={false}/>
        <DocumentUpload offerData={offerData}/>
      </div>
    </div>
  );
}
