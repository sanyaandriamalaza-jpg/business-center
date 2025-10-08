import { Formule } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { WalletCards } from "lucide-react";
import { notFound } from "next/navigation";

const fetchOfferInfo = async (): Promise<Formule[] | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/virtual-office-offer`, {
      cache : "no-store",
    });
    const data = await res.json();
    return data.success ? (data.data as Formule[]) : null;
  } catch (error) {
    return null;
  }
};

export async function PlanCard ({name} : {name : string}) {
  const formules = await fetchOfferInfo();
  if (!formules) {
    notFound();
  }
  return (
  <div className="md:px-6 mb-16">
    <div className=" flex items-center gap-6 text-cPrimary/90 mb-4">
      <WalletCards className="w-6 h-6 " />
      <h2 className="md:text-xl font-bold">Plan choisi</h2>
    </div>
    <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
      {formules.map((formule) => (
        <div key={formule.id} className={`p-4 rounded-xl lg:flex justify-between ${formule.name == name ? "bg-cPrimary/90 text-cForeground" : "bg-cBackground text-cStandard/30"}`}>
        <div>
          <h3 className="font-bold md:text-lg">{formule.name}</h3>
          <p className=" mb-2 text-sm md:text-base">
            {formule.description}
          </p>
        </div>
        <div>
          <p className="md:text-3xl font-bold sm:mt-2">{formule.monthlyPrice}€/mois</p>
        </div>
      </div>
      ))}
    </div>
  </div>
)};
