"use client";

import { BasicUser, Formule } from "@/src/lib/type";
import { LoaderCircle, User, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import OptionnalDocumentUpload from "../../components/OptionnalDocumentUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function NewSubscriptionWrapper() {
  const [formules, setFormules] = useState<Formule[]>([]);
  const [users, setUsers] = useState<BasicUser[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/virtual-office-offer`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setFormules(data.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des offres:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/basic-user`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchData(), fetchUser()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const selectedOffer = formules.find((formule) => formule.id === selectedOfferId);
  const selectedUser = users.find((user) => user.id === selectedUserId);
  const canShowUpload = selectedOfferId && selectedUserId;

  if (loading) {
    return (
      <div className="relative">
        <div className="py-8 xl:px-4 space-y-6 overflow-y-auto text-neutral-800">
          <div className="flex items-center justify-center h-64">
            <LoaderCircle className="w-8 h-8 animate-spin text-cPrimary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="py-8 xl:px-4 space-y-6 overflow-y-auto text-neutral-800">
        <div>
          <h2 className="text-xl xl:text-2xl font-bold text-cDefaultSecondary-200 mb-6">
            Souscrire à une offre de domiciliation
          </h2>
        </div>

        <div className="bg-white py-8 px-4 md:px-12 w-full rounded-xl shadow-sm">
          <div className="md:px-6 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sélection du plan */}
              <div>
                <div className="flex items-center gap-6 text-cPrimary/90 mb-4">
                  <WalletCards className="w-6 h-6" />
                  <h2 className="md:text-xl font-bold">Choisir un plan</h2>
                </div>
                
                <Select 
                  value={selectedOfferId?.toString() || ""} 
                  onValueChange={(value) => setSelectedOfferId(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une offre de domiciliation" />
                  </SelectTrigger>
                  <SelectContent>
                    {formules.map((formule) => (
                      <SelectItem key={formule.id} value={formule.id as string}>
                        <div className="flex flex-col">
                          <span className="font-medium">{formule.name}</span>
                          <span className="text-sm text-gray-500">
                            {formule.monthlyPrice}€/mois
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedOffer && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">{selectedOffer.name}</p>
                      <p className="text-blue-700">Prix: {selectedOffer.monthlyPrice}€/mois</p>
                      {selectedOffer.description && (
                        <p className="text-blue-600 mt-1">{selectedOffer.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sélection de l'utilisateur */}
              <div>
                <div className="flex items-center gap-6 text-cPrimary/90 mb-4">
                  <User className="w-6 h-6" />
                  <h2 className="md:text-xl font-bold">Assigner un utilisateur</h2>
                </div>

                <Select 
                  value={selectedUserId?.toString() || ""} 
                  onValueChange={(value) => setSelectedUserId(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.firstName} {user.name}
                          </span>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedUser && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium text-green-900">
                        {selectedUser.firstName} {selectedUser.name}
                      </p>
                      <p className="text-green-700">{selectedUser.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!canShowUpload && (
            <div className="md:px-6 mb-8">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <WalletCards className="h-5 w-5 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    Veuillez sélectionner une offre et un utilisateur pour continuer.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/*  affiché seulement si les deux sélections sont faites */}
          {canShowUpload && (
            <OptionnalDocumentUpload
              offerData={selectedOffer!}
              userId={String(selectedUserId!)}
            />
          )}
        </div>
      </div>
    </div>
  );
}