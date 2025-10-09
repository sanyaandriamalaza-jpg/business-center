// app/[company]/admin/customer-invoice/[id]/page.tsx
import InvoiceDetailPageWrapper from "./InvoiceDetailPageWrapper";
import { baseUrl } from "@/src/lib/utils";
import { InvoiceDataFormat } from "@/src/lib/type";

interface InvoiceResponse {
  success: boolean;
  data: InvoiceDataFormat;
}

interface PageProps {
  params: {
    company: string;
    id: string;
  };
}

async function getInvoice(id: string): Promise<InvoiceResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/invoice/${id}`, {
      cache: "no-store", // Pour toujours avoir les données les plus récentes
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur SSR:", error);
    return {
      success: false,
      data: {} as InvoiceDataFormat,
    };
  }
}

export default async function InvoiceDetail({ params }: PageProps) {
  const invoiceResponse = await getInvoice(params.id);
  if (
    invoiceResponse.success &&
    invoiceResponse.data.company.slug !== params.company
  ) {
    return (
      <div className="mt-[90px] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mx-auto h-12 w-12 text-red-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800">
              Accès non autorisé
            </h3>
            <p className="mt-2 text-red-600">
              Cette facture n'appartient pas à votre entreprise.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceResponse.success) {
    return (
      <div className="mt-[90px] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mx-auto h-12 w-12 text-red-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800">
              Facture introuvable
            </h3>
            <p className="mt-2 text-red-600">
              La facture demandée n'existe pas ou n'est plus disponible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <InvoiceDetailPageWrapper
        initialData={invoiceResponse}
        companySlug={params.company}
        invoiceId={params.id}
      />
    </div>
  );
}
