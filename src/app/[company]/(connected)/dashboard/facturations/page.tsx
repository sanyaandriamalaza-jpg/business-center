import React from "react";
import FacturationWrapper from "./FacturationWrapper";
import { Invoice } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { notFound } from "next/navigation";

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

export default async function FaturationPage() {
  const session = await getServerSession(authOptions);
  const invoices = await fetchInvoices();
  if (!session || !invoices) {
    notFound();
  }

  const invoicesData = invoices.filter(
    (reservation) => reservation.idBasicUser === Number(session.user.id)
  );

  return <FacturationWrapper invoices={invoicesData} />;
}
