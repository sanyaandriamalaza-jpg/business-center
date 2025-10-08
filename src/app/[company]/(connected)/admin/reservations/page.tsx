import { baseUrl } from "@/src/lib/utils";
import { Invoice } from "@/src/lib/type";
import ReservationPageWrapper from "./ReservationPageWrapper";

const fetchInvoices = async (): Promise<Invoice[] | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/invoice?type=office`, {
      method: "GET",
      next: { revalidate: 1 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? (data.data as Invoice[]) : null;
  } catch (error) {
    console.error("Erreur récupération factures :", error);
    return null;
  }
};

export default async function ReservationPage() {
  const invoices = await fetchInvoices();
  if (!invoices) throw new Error("Impossible de récupérer les factures");

  return (
    <div className="py-6 px-4">
      <ReservationPageWrapper initialInvoices={invoices} />
    </div>
  );
}