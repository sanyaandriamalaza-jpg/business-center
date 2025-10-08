import { Formule } from "@/src/lib/type";
import SubscriptionWrapper from "./SubscriptionWrapper";
import { baseUrl } from "@/src/lib/utils";
import { notFound } from "next/navigation";

const fetchOffer = async (offerId: number): Promise<Formule | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/virtual-office-offer/${offerId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
};

export default async function Subscription({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;
  const idBrut = parameters.id;
  const offerId = Number(idBrut);

  if (isNaN(offerId)) {
    notFound();
  }
  const offerData = await fetchOffer(offerId);
  if (!offerData) {
    notFound();
  }
  return <SubscriptionWrapper offerData={offerData} />;
}
