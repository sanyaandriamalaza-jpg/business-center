// app/[company]/admin/customer-invoice/page.tsx
import CustomerInvoicePageWrapper from "./CustomerInvoicePageWrapper";
import { baseUrl } from "@/src/lib/utils";
import { InvoiceDataFormat } from "@/src/lib/type";
import { transformInvoiceData } from "@/src/lib/utils";
interface InvoiceResponse {
  success: boolean;
  data: InvoiceDataFormat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface PageProps {
  params: {
    company: string;
  };
  searchParams: {
    page?: string;
    limit?: string;
  };
}

// Fonction pour transformer les données de la nouvelle API vers l'ancien format

async function getInvoices(
  page: number = 1,
  limit: number = 10,
  companySlug: string
): Promise<InvoiceResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/invoice`, {
      cache: "no-store", // Pour toujours avoir les données les plus récentes
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des factures");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Erreur dans la réponse de l'API");
    }

    // Transformer les données vers l'ancien format
    const transformedData = transformInvoiceData(result.data, companySlug);

    // Simuler la pagination (à adapter selon vos besoins)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = transformedData.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: transformedData.length,
      },
    };
  } catch (error) {
    console.error("Erreur SSR:", error);
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 10, total: 0 },
    };
  }
}

export default async function CustomerInvoice({
  params,
  searchParams,
}: PageProps) {
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");

  // Récupération des données côté serveur
  const invoiceResponse = await getInvoices(page, limit, params.company);

  // Filtrer les factures pour ne garder que celles de la company spécifiée
  const companyInvoices = {
    ...invoiceResponse,
    data: invoiceResponse.data.filter(
      (invoice) => invoice.company.slug === params.company
    ),
  };

  return (
    <div>
      <CustomerInvoicePageWrapper
        initialData={companyInvoices}
        companySlug={params.company}
      />
    </div>
  );
}
