import { baseUrl } from "@/src/lib/utils";
import SpacesPageWrapper from "./SpacesPageWrapper";
import { CoworkingOffer, Office } from "@/src/lib/type";
import { notFound } from "next/navigation";

const fetchOffer = async (companySlug: string): Promise<Office[] | null> => {
  try {
    const res = await fetch(
      `${baseUrl}/api/office?company_slug=${companySlug}`,
      {
        cache: "no-store",
      }
    );
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Erreur lors de la récupération des offres :", error);
    return null;
  }
};

export default async function Spaces({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const parameters = await params;
  const companySlug = parameters.company;

  const officeListData = await fetchOffer(companySlug);

  if (!officeListData) {
    notFound();
  }



  return <SpacesPageWrapper officeList={officeListData} />;
}
