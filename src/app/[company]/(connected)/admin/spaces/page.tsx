"use client";

import { Button } from "@/src/components/ui/button";
import { Plus, Pen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CoworkingOffer, KonvaMap, Offer, Office } from "@/src/lib/type";
import { useSession } from "next-auth/react";
import { useAdminStore } from "@/src/store/useAdminStore";
import { useToast } from "@/src/hooks/use-toast";
import AdminOffersList from "../components/AdminOffersList";
import WorkspaceOfferDialog, {
  FormValues,
} from "../components/forms/WorkspaceOfferDialog";
import PartialLoading from "@/src/components/global/PartialLoading";
import AdminOfficeListArray from "../components/AdminOfficeListArray";
import AdminMapList from "../components/AdminMapList";

export default function EspacesPage() {
  const { data: session, status } = useSession();

  const setIsGeneralLoadingVisible = useAdminStore(
    (state) => state.setIsGeneralLoadingVisible
  );
  const adminCompany = useAdminStore((state) => state.adminCompany);
  const { toast } = useToast();

  const [loadingOffersList, setLoadingOffersList] = useState<boolean>(true);

  const [offersList, setOffersList] = useState<CoworkingOffer[]>();
  const [officeList, setOfficeList] = useState<Office[]>();

  const [offerOpen, setOfferOpen] = useState(false);

  const [coworkingOfferToEdit, setCoworkingOfferToEdit] =
    useState<CoworkingOffer>();

  const [loadingMapList, setLoadingMapList] = useState<boolean>(true);
  const [mapIdList, setMapIdList] = useState<Set<number>>();
  const [mapList, setMapList] = useState<KonvaMap[]>();

  const fetchOffersData = useCallback(async () => {
    if (adminCompany && adminCompany.id) {
      try {
        setLoadingOffersList(true);
        const res = await fetch(
          `/api/coworking-offer?id_company=${adminCompany.id}`
        );
        const data = await res.json();
        if (data.success) {
          setOffersList(data.data);
          const officeFromOffers = data.data
            .filter(
              (offer: Offer) => offer.officeList && offer.officeList.length > 0
            )
            .flatMap((offer: Offer) => {
              const { officeList, ...rest } = offer;
              return offer.officeList!.map((office: Office) => ({
                ...office,
                idCoworkingOffer: offer.id,
                coworkingOffer: rest,
              }));
            });
          setOfficeList(officeFromOffers);

          const mapListId: Set<number> = new Set();
          officeFromOffers.forEach((office: Office) => {
            const idKonvaMap = office.idKonvaMap;
            if (idKonvaMap) {
              mapListId.add(idKonvaMap);
            }
          });
          setMapIdList(mapListId);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingOffersList(false);
      }
    }
  }, [adminCompany]);

  useEffect(() => {
    fetchOffersData();
  }, [fetchOffersData]);

  const handleCreateOffer = async (form: FormValues) => {
    if (adminCompany && adminCompany.id) {
      setIsGeneralLoadingVisible(true);
      const featuresArray =
        form.features
          ?.split("\n")
          .map((f: any) => f.trim())
          .filter((f: any) => f.length > 0) || [];

      try {
        const url = coworkingOfferToEdit
          ? `/api/coworking-offer/${coworkingOfferToEdit.id}`
          : `/api/coworking-offer`;
        const res = await fetch(url, {
          method: coworkingOfferToEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: form.type,
            description: form.description,
            hourly_rate: form.hourlyRate,
            daily_rate: form.dailyRate,
            features: featuresArray,
            is_tagged: form.isTagged,
            tag: form.tag,
            id_company: adminCompany.id,
          }),
        });
        const data = await res.json();
        toast({
          title: data.success ? "Succès" : "Erreur",
          description: data.message,
          variant: data.success ? "success" : "destructive",
        });
        fetchOffersData();
      } catch (error) {
        console.error(error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue.",
          variant: "destructive",
        });
      } finally {
        setIsGeneralLoadingVisible(false);
      }
    } else {
      toast({
        title: "Erreur",
        description: "L’entreprise que vous gérez est introuvable.",
        variant: "destructive",
      });
    }
    setOfferOpen(false);
  };

  const modifyCoworkingOffer = (coworkingOfferId: CoworkingOffer) => {
    setCoworkingOfferToEdit(coworkingOfferId);
    setOfferOpen(true);
  };

  const deleteCoworkingOffer = async (coworkingOffer: CoworkingOffer) => {
    try {
      setIsGeneralLoadingVisible(true);
      const res = await fetch(`/api/coworking-offer/${coworkingOffer.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      toast({
        title: data.success ? "Succès" : "Erreur",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsGeneralLoadingVisible(false);
      fetchOffersData();
    }
  };

  const deleteOffice = async (officeId: number) => {
    try {
      setIsGeneralLoadingVisible(true);

      const res = await fetch(`/api/office/${officeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      toast({
        title: data.success ? "Succès" : "Erreur",
        description: data.message,
        variant: data.success ? "success" : "destructive",
      });
      fetchOffersData();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsGeneralLoadingVisible(false);
    }
  };

  const fetchMapInfo = useCallback(async () => {
    if (mapIdList && mapIdList.size > 0) {
      try {
        setLoadingMapList(true);
        const mapIdsArray = Array.from(mapIdList);
        const queryString = `?ids=${mapIdsArray.join(",")}`;

        const response = await fetch(`/api/konva-map${queryString}`);
        const data = await response.json();

        if (data.success) {
          setMapList(data.data);
        } else {
          console.error("Erreur :", data.message, data.error);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingMapList(false);
      }
    } else {
      setLoadingMapList(false);
    }
  }, [mapIdList]);

  useEffect(() => {
    fetchMapInfo();
  }, [mapIdList, fetchMapInfo]);

  return (
    <div className="py-6 px-4 space-y-10">
      {
        <div className="space-y-3">
          <h2 className="text-xl xl:text-2xl font-bold text-cDefaultSecondary-100 order-2">
            Liste des offres
          </h2>
          <div className="rounded-md bg-white p-4 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 justify-end xl:items-center">
              <div className="order-1 sm:order-3 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setOfferOpen(true)}
                  className="bg-cDefaultPrimary-100 hover:bg-cDefaultPrimary-200 hover:text-white text-white font-medium px-2 lg:px-6 "
                >
                  <Plus className="w-5 h-5" /> Nouvelle offre
                </Button>
              </div>
            </div>
            {loadingOffersList ? (
              <PartialLoading />
            ) : (
              offersList && (
                <AdminOffersList
                  offersList={offersList}
                  modifyCoworkingOffer={modifyCoworkingOffer}
                  deleteCoworkingOffer={deleteCoworkingOffer}
                />
              )
            )}
          </div>
        </div>
      }

      {officeList ? (
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Espaces
            </h1>
          </div>
          {officeList.length > 0 ? (
            <AdminOfficeListArray
              data={officeList}
              deleteOffice={deleteOffice}
            />
          ) : (
            <p className="text-sm italic text-center text-indigo-600">
              La liste est vide
            </p>
          )}
        </div>
      ) : (
        ""
      )}
      
<WorkspaceOfferDialog
        open={offerOpen}
        setOpen={setOfferOpen}
        onCreate={handleCreateOffer}
        initialData={coworkingOfferToEdit}
        resetInitialData={() => setCoworkingOfferToEdit(undefined)}
      />
    </div>
  );
}
