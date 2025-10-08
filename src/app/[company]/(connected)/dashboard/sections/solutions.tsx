import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ArrowRight, Building2, MapPin, Search } from "lucide-react";
import Link from "next/link";

export default function Solutions() {
  return (
    <div className="container mx-auto px-4">
      <div className=" mx-auto w-full xl:max-w-5xl rounded-2xl shadow-lg bg-white p-6 xl:p-8 flex flex-col gap-4 -mt-32 relative z-20">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-3 xl:mb-6">
          Trouvez Votre Solution
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 w-full">
          {/* Réserver un Espace */}
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="w-full">
              <div className="font-medium mb-4 text-gray-700 ">
                Réserver un Espace
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <MapPin className="w-5" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Type d‘espace"
                    className="pl-10 py-5"
                  />
                </div>
                <button
                  className="md:ml-2 w-full sm:w-fit px-6 py-2 xl:py-1.5 text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 duration-300 focus:ring focus:ring-indigo-600/40 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </button>
              </div>
            </div>
          </div>
          {/* Domiciliation d'Entreprise */}
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="w-full">
              <div className="font-medium mb-4 text-gray-700 ">
                Domiciliation d'Entreprise
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Building2 className="w-5" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Nom de votre entreprise"
                    className="pl-10 py-5"
                  />
                </div>
                <Link
                  href="#"
                  className="md:ml-2 w-full sm:w-fit px-6 py-2 xl:py-1.5 text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 duration-300 focus:ring focus:ring-indigo-600/40 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Commencer
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}