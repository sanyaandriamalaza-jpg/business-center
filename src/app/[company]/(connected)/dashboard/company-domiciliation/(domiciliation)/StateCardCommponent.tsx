import {
  ArrowRight,
  Check,
  Clock,
  File,
  MessageSquareWarning,
  Signature,
  User,
} from "lucide-react";
import Link from "next/link";

type CardStatus = "completed" | "in-progress" | "pending";

type CardProps = {
  title: string;
  description: string;
  status?: CardStatus | string;
  number?: number;
};

type StateCardsProps = {
  cards: CardProps[];
};

const steps = [
  {
    id: 1,
    title: "Souscription en ligne",
    description: "Formulaire complété et validé",
    icon: Check,
  },
  {
    id: 2,
    title: "Dépôt des documents",
    description: "Kbis, justificatifs d'identité du gérant, RIB reçus",
    icon: Check,
  },
  {
    id: 3,
    title: "Validation des documents",
    description: "Vérification en cours par notre équipe",
    icon: Clock,
  },
  {
    id: 4,
    title: "Envoi des contrats",
    description: "Contrats et mandat de prélèvement à envoyer",
    icon: File,
  },
  {
    id: 5,
    title: "Signature électronique",
    description: "Signature des contrats et mandats",
    icon: Signature,
  },
  {
    id: 6,
    title: "Espace client actif",
    description: "Création de votre espace domiciliation",
    icon: User,
  },
];

export default function StateCards({ currentStep }: { currentStep: number }) {
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  const getStepNotif = (step: number) => {
    switch (step) {
      case 2:
        return "Veuillez compléter vos documents justificatifs";
      case 3:
        return "En attente de validation de vos documents par l'admin";
      case 4:
        return "Vos documents ont été validés, en attente des contrats envoyés par l'admin";
      case 5:
        return "Vos contrats sont disponibles et attendent votre signature";
      case 6:
        return "Votre signature a été envoyée, en attente de la création de votre espace de domiciliation";
      case 7:
        return "Toutes les étapes sont validées, votre espace client est maintenant actif";
      default:
        return "Veuillez souscrire à une offre de domiciliation";
    }
  };

  return (
    <>
      <div className="md:mx-20 px-10 py-2 bg-cDefaultPrimary-100/60 text-cStandard/60 rounded-lg lg:flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <MessageSquareWarning w-5 h-5 />
          <span className="font-semibold">{getStepNotif(currentStep)}</span>
        </div>
        {currentStep === 2 && (
          <Link
            href={"/"}
            className="text-cPrimary font-semibold flex itmes-center gap-2 underline text-sm"
          >
            Compléter vos documents
            <ArrowRight className="w-4 h-4 mt-1" />
          </Link>
        )}
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-3 mb-5 gap-4 md:gap-20`}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={index} className="pl-5 md:pl-20">
              <div className="flex items-start gap-3">
                <div
                  className={`p-1 md:p-2 rounded-full flex items-center justify-center ${
                    status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : status === "current"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-cStandard/20 text-cStandard"
                  }`}
                >
                  {status === "completed" ? (
                    <Check className="w-5 h-5" />
                  ) : status === "current" ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <span className="font-medium text-sm w-5 h-5 text-center text-cStandard">
                      {step.id}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-semibold text-cStandard">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-cStandard/60 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
