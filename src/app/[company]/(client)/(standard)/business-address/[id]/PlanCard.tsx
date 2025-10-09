import { WalletCards } from "lucide-react";

export const PlanCard = () => (
  <div className="bg-white md:px-6 mb-16">
    <div className=" flex items-center gap-6 text-indigo-700 mb-4">
      <WalletCards className="w-6 h-6 " />
      <h2 className="md:text-xl font-bold">Plan choisi</h2>
    </div>
    <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-indigo-700 p-4 rounded-xl lg:flex justify-between">
        <div>
          <h3 className="font-bold md:text-lg text-white">Premium</h3>
          <p className="text-white mb-2 text-sm md:text-base">
            Solution complète pour les entreprises
          </p>
        </div>
        <div>
          <p className="md:text-3xl font-bold sm:mt-2 text-white">99€/mois</p>
        </div>
      </div>
      <div className="bg-gray-100 p-4 rounded-xl lg:flex justify-between">
        <div>
          <h3 className="font-bold md:text-lg text-gray-400">Basic</h3>
          <p className="text-gray-400 mb-2 text-sm md:text-base">
            Solution complète pour les entreprises
          </p>
        </div>
        <div>
          <p className="md:text-3xl font-bold sm:mt-2 text-gray-400">49€/mois</p>
        </div>
      </div>
    </div>
  </div>
);
