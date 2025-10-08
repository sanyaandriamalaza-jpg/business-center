"use client";

import { Button } from "@/src/components/ui/button";
import { Check, EllipsisVertical, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CoworkingOffer } from "@/src/lib/type";
import {
  capitalizeFirstLetter,
  translateCoworkingOfferType,
} from "@/src/lib/customfunction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/src/store/useAdminStore";

interface AdminOffersListProps {
  offersList: CoworkingOffer[];
  modifyCoworkingOffer: (coworkingOffer: CoworkingOffer) => void;
  deleteCoworkingOffer: (coworkingOffer: CoworkingOffer) => void;
}

export default function AdminOffersList({
  offersList,
  modifyCoworkingOffer,
  deleteCoworkingOffer,
}: AdminOffersListProps) {
  const [isAlertDialogVisible, setIsAlertDialogVisible] =
    useState<boolean>(false);
  const router = useRouter();

  const [coworkingOfferToDelete, setCoworkingOfferToDelete] =
    useState<CoworkingOffer>();

  const adminCompany = useAdminStore((state) => state.adminCompany);

  return (
    <>
      <div className="text-sm">
        {offersList && Array.isArray(offersList) && offersList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {offersList.map((offer, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-lg p-4 relative space-y-2 flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <div className="right-1 top-1">
                    {offer.isTagged ? (
                      <div className="text-xs font-medium bg-cDefaultPrimary-100 text-white w-fit p-1 rounded-md">
                        {offer.tag}{" "}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size={"icon"}>
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => modifyCoworkingOffer(offer)}
                        >
                          Editer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setCoworkingOfferToDelete(offer);
                            setIsAlertDialogVisible(true);
                          }}
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="font-bold text-xl text-cDefaultSecondary-100 mt-2">
                  {" "}
                  {translateCoworkingOfferType(offer.type)}{" "}
                </p>
                <div className="text-neutral-500">{offer.description}</div>
                <div className="text-neutral-500">
                  <p>Tarif :</p>
                  <div className="ml-2">
                    {offer.hourlyRate && (
                      <p>
                        Horaire :{" "}
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(offer.hourlyRate)}{" "}
                      </p>
                    )}
                    {offer.dailyRate && (
                      <p>
                        Journalier :{" "}
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(offer.dailyRate)}{" "}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-1 text-neutral-500">
                  <p>Fonctionnalités :</p>
                  <div className="ml-2">
                    {offer.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span>
                          <Check className="text-emerald-600 w-4" />
                        </span>
                        <span>{capitalizeFirstLetter(feature)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3">
                  <Button
                    variant="ghost"
                    className="bg-cDefaultSecondary-100 hover:bg-cDefaultSecondary-200 hover:text-white text-white font-medium px-6 "
                    onClick={() =>
                      router.push(
                        `/${adminCompany?.slug}/admin/spaces/office?mode=create&offer-id=${offer.id}`
                      )
                    }
                  >
                    <Plus className="w-5 h-5" /> Nouvel espace
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-center text-indigo-600">
            {" "}
            La liste est vide{" "}
          </p>
        )}
      </div>
      <AlertDialog
        open={isAlertDialogVisible}
        onOpenChange={(value) => setIsAlertDialogVisible(value)}
      >
        <AlertDialogContent className="text-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette offre?</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous certain de vouloir supprimer cette offre ? Cela
              impliquera aussi la suppression de tous les bureaux qui y sont
              attachés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setCoworkingOfferToDelete(undefined)}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (coworkingOfferToDelete) {
                  deleteCoworkingOffer(coworkingOfferToDelete);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
