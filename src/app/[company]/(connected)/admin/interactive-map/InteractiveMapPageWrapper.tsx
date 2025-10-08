"use client";

import dynamic from "next/dynamic";
import {
  MousePointer2,
  MoveRight,
  RectangleHorizontal,
  Circle as LucideCircle,
  Triangle as LucideTriangle,
  PenLine,
} from "lucide-react";
import { useAdminStore } from "@/src/store/useAdminStore";
import {
  Company,
  CoworkingOffer,
  KonvaMap,
  Offer,
  Office,
} from "@/src/lib/type";
import { useCallback, useEffect, useState } from "react";
import PartialLoading from "@/src/components/global/PartialLoading";
import AdminMapList from "../components/AdminMapList";

const KonvaCreator = dynamic(() => import("./KonvaCreator"), {
  ssr: false,
});
const KonvaViewer = dynamic(() => import("./KonvaViewer"), {
  ssr: false,
});

export default function InteractiveMapPageWrapper({
  mode,
  id,
}: {
  mode?: string | null;
  id?: number | null;
}) {
  const [loadingMapList, setLoadingMapList] = useState<boolean>(true);
  const [loadingOffersList, setLoadingOffersList] = useState<boolean>(true);

  const iconSignificationList = [
    {
      icon: MousePointer2,
      text: "Sélection",
      usage: (
        <p>
          En cliquant sur l'outil de sélection (clic gauche), vous quittez le
          mode d'édition d'une forme. Vous pouvez également déplacer une forme,
          la redimensionner ou la faire pivoter.
        </p>
      ),
    },
    {
      icon: RectangleHorizontal,
      text: "Rectangle",
      usage: (
        <p>
          Pour dessiner un rectangle, cliquez sur l'icône, maintenez le clic
          gauche enfoncé et faites glisser pour agrandir ou réduire la forme
          jusqu'à obtenir la taille souhaitée.
        </p>
      ),
    },
    {
      icon: LucideCircle,
      text: "Cercle",
      usage: (
        <p>
          Pour dessiner un cercle, cliquez sur l'icône, maintenez le clic gauche
          et faites glisser pour ajuster le cercle, puis relâchez le clic
          lorsque la taille souhaitée est atteinte.
        </p>
      ),
    },
    {
      icon: LucideTriangle,
      text: "Triangle",
      usage: (
        <p>
          Pour dessiner un triangle, cliquez sur l'icône, maintenez le clic
          gauche et faites glisser pour ajuster le triangle, puis relâchez le
          clic lorsque la taille souhaitée est atteinte.
        </p>
      ),
    },
    {
      icon: MoveRight,
      text: "Flèche",
      usage: (
        <p>
          Pour dessiner une flèche, cliquez sur l'icône, maintenez le clic
          gauche pour définir le point de départ, puis déplacez la souris tout
          en maintenant le clic pour positionner la tête de la flèche.
        </p>
      ),
    },
    {
      icon: PenLine,
      text: "Polyline",
      usage: (
        <p>
          Pour tracer une polyline, cliquez pour placer chaque point
          successivement. Une fois terminé, appuyez sur la touche{" "}
          <code className="border border-gray-300 rounded-md px-2 py-[2px] bg-gray-100/60 font-semibold ">
            Entrée
          </code>{" "}
          pour finaliser la ligne. Tant que vous êtes en mode tracé, la ligne
          est en pointillés, puis elle devient continue une fois terminée.
        </p>
      ),
    },
  ];

  const [officeList, setOfficeList] = useState<Office[]>();

  const adminCompany = useAdminStore((state) => state.adminCompany);
  const [mapList, setMapList] = useState<KonvaMap[]>();
  const [mapIdList, setMapIdList] = useState<Set<number>>();

  const fetchOffice = useCallback(
    async (companySlug: string): Promise<Office[] | null> => {
      try {
        const res = await fetch(
          `/api/office?company_slug=${companySlug}&no_map=${true}`
        );
        const data = await res.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (!adminCompany) return;

    const loadOffices = async () => {
      const list = await fetchOffice(adminCompany.slug);
      if (list) {
        setOfficeList(list);
      }
    };

    loadOffices();
  }, [adminCompany, fetchOffice]);

  const fetchOffersData = useCallback(async () => {
    if (!adminCompany?.id) return;

    setLoadingOffersList(true);
    setLoadingMapList(true);

    try {
      const res = await fetch(
        `/api/coworking-offer?id_company=${adminCompany.id}`
      );
      const data = await res.json();

      if (!data.success) return;

      const officeFromOffers: Office[] = data.data.flatMap(
        (offer: Offer) =>
          offer.officeList?.map((office: Office) => ({
            ...office,
            idCoworkingOffer: offer.id,
            coworkingOffer: (({ officeList, ...rest }) => rest)(offer),
          })) || []
      );

      const mapListId = new Set(
        officeFromOffers
          .map((office) => office.idKonvaMap)
          .filter(Boolean) as number[]
      );

      if (mapListId.size > 0) {
        try {
          const queryString = `?ids=${Array.from(mapListId).join(",")}`;
          const mapRes = await fetch(`/api/konva-map${queryString}`);
          const mapData = await mapRes.json();
          if (mapData.success) {
            setMapList(mapData.data);
          } else {
            console.error("Erreur :", mapData.message, mapData.error);
          }
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOffersList(false);
      setLoadingMapList(false);
    }
  }, [adminCompany]);

  useEffect(() => {
    fetchOffersData();
  }, [fetchOffersData]);

  return (
    <div className="pt-8 py-6 px-4 space-y-10">
      {!loadingOffersList && (
        <>
          {loadingMapList ? (
            <PartialLoading />
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Liste des cartes
                </h1>
              </div>
              {mapList && mapList.length > 0 ? (
                <AdminMapList
                  mapList={mapList}
                  reloadData={() => {
                    fetchOffersData();
                  }}
                />
              ) : (
                <p className="text-sm italic text-center text-indigo-600">
                  La liste est vide
                </p>
              )}
            </div>
          )}
        </>
      )}
      <div className="grid grid-cols-12 gap-4">
        {mode && mode === "view" && id ? (
          <>
            <KonvaViewer id={id} isAdmin />
          </>
        ) : (
          <>
            <div className="col-span-8">
              <div className="space-y-3">
                <h2 className="text-xl xl:text-2xl font-bold text-cDefaultSecondary-100 order-2">
                  Créer un nouveau plan
                </h2>
                <div className="w-full aspect-square bg-white rounded-md ">
                  <KonvaCreator
                    officeList={officeList}
                    reloadData={() => fetchOffersData()}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="space-y-3">
                <div className="w-full aspect-square rounded-md p-2">
                  <h3 className="text-lg xl:text-xl font-bold text-cDefaultSecondary-100 order-2">
                    Guide d‘utilisation
                  </h3>
                  <div className="divide-y divide-gray-200 space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        Signification des icônes
                      </h4>
                      <div className="ml-3 space-y-3">
                        {iconSignificationList.map((item, i) => (
                          <div key={i}>
                            <div className="flex gap-2 items-center">
                              <div>
                                <item.icon size={16} />
                              </div>
                              <p className="font-semibold">{item.text}</p>
                            </div>
                            <div className="text-sm">{item.usage}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 pt-3">
                      <h4 className="font-semibold">Utilitaire</h4>
                      <div className="space-y-3">
                        <p className="text-sm">
                          En maintenant la touche{" "}
                          <code className="border border-gray-300 rounded-md px-2 py-[2px] bg-gray-100/60 font-semibold ">
                            Shift
                          </code>{" "}
                          sur votre clavier, vous activez la contrainte sur
                          l’axe horizontal ou vertical.
                        </p>
                        <p className="text-sm">
                          En faisant un clic droit sur une forme dessinée, vous
                          ouvrez le menu contextuel pour supprimer la forme,
                          assigner un élément, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
