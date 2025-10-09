import DocumentUpload from "./DocumentUpload";
import { PlanCard } from "./PlanCard";
import { RegistrationForm } from "./RegistrationForm";



export default function SubscriptionWrapper() {
  return (
    <div className="py-6 px-3 container mx-auto">
      <div className="mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Souscription à une offre de domiciliation</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Obtenez une adresse professionnelle reconnue pour votre siège social,
          accompagnement personnalisé et services sur mesure adaptés à votre
          activité.
        </p>
      </div>
      <div className="bg-white py-8 px-4 md:px-12 w-full rounded-xl shadow-sm">
        <PlanCard/>
        <RegistrationForm/>
        <DocumentUpload/>
      </div>
    </div>
  );
}
