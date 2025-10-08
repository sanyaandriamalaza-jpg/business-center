import { baseUrl } from "@/src/lib/utils";
import ReservationDetailPageWrapper from "./ReservationDetailPageWrapper";
import { Invoice } from "@/src/lib/type";
import { notFound } from "next/navigation";

const fetchInvoiceData = async (invoiceId: number): Promise<Invoice | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/invoice/single/${invoiceId}`, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      console.error(`Erreur HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Erreur lors du fetch de la facture :", error);
    return null;
  }
};

export default async function ReservationDetail({
  params,
}: {
  params: { id: string };
}) {
  const invoiceId = Number(params.id);

  if (isNaN(invoiceId) || invoiceId <= 0) {
    console.log(invoiceId);
    throw new Error("ID de facture invalide.");
  }

  const invoice = await fetchInvoiceData(invoiceId);

  if (!invoice) {
    notFound();
  }

  return <ReservationDetailPageWrapper invoice={invoice} />;
}
