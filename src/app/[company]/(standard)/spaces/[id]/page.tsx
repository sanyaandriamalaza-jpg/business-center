import { Office } from "@/src/lib/type";
import SingleOfficePageWrapper from "./SingleOfficePageWrapper";
import { baseUrl } from "@/src/lib/utils";
import { notFound } from "next/navigation";

const fetchOfficeInfo = async (officeId: number): Promise<Office | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/office/${officeId}`, {
      cache : "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
};

export default async function SingleOffice({
  params,
}: {
  params: Promise<{ company: string; id: string }>;
}) {
  const parameters = await params;
  const idBrut = parameters.id;
  const officeId = Number(idBrut);

  if (isNaN(officeId)) {
    notFound();
  }
  const officeData = await fetchOfficeInfo(officeId);
  if (!officeData) {
    notFound();
  }

  return <SingleOfficePageWrapper office={officeData} />;
}
