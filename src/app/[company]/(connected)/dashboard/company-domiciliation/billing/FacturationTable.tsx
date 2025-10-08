import { Download, Receipt } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useEffect, useState } from "react";
import { Invoice } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";

export default function FacturationTable({ userId }: { userId: string }) {
  const [invoicesData, setInvoicesData] = useState<Invoice[]>([]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/invoice/single`, {
        cache: "no-store",
      });
      const data = await res.json();
      return data.success ? setInvoicesData(data.data) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération des factures :", error);
      return null;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // const downloadInvoice = (invoiceId: string) => {
  //   console.log(`Downloading invoice ${invoiceId}`);
  // };
  const invoicesHistory = invoicesData.filter(
    (invoice) => invoice.idBasicUser === Number(userId)
  );

  return (
    <Card
      className="mt-6"
      style={{
        backgroundColor: "rgb(var(--custom-background-color))",
        borderColor: "rgb(var(--custom-foreground-color)/0.1)",
      }}
    >
      <CardHeader>
        <CardTitle className="text-cPrimary text-lg">
          Historique des Factures
        </CardTitle>
        <CardDescription
          style={{
            color: "rgb(var(--custom-standard-color)/0.7)",
          }}
        >
          Consultez et téléchargez vos anciennes factures.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-xs md:text-base">
                Facture
              </TableHead>
              <TableHead className="font-bold hidden md:block">Date</TableHead>
              <TableHead className="font-bold  text-xs md:text-base">
                Montant
              </TableHead>
              <TableHead className="font-bold  text-xs md:text-base">
                Formule
              </TableHead>
              <TableHead className="font-bold  text-xs md:text-base">
                Statut
              </TableHead>
              {/* <TableHead className="md:text-center font-bold  text-xs md:text-base">
                Actions
              </TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoicesHistory.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-cStandard/60 text-xs md:text-base">
                  {invoice.reference}
                  {invoice.referenceNum}
                </TableCell>
                <TableCell className="font-medium text-cStandard/60 hidden md:block">
                  {
                    new Date(invoice.startSubscription)
                      .toISOString()
                      .split("T")[0]
                  }
                </TableCell>
                <TableCell className="font-medium text-cStandard/60  text-xs md:text-base">
                  {invoice.amount}
                </TableCell>
                <TableCell className="font-medium text-cStandard/60  text-xs md:text-base">
                  {invoice.virtualOfficeOffer?.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={null}
                    className={
                      invoice.stripePaymentId !== null
                        ? "bg-cPrimary/70 text-cForeground border border-cPrimary/70 md:px-4 rounded-xl"
                        : "bg-amber-600 text-cForeground md:px-4 rounded-xl"
                    }
                  >
                    {invoice.stripePaymentId !== null ? "Payé" : "En attente"}
                  </Badge>
                </TableCell>
                {/* <TableCell className="md:text-center">
                  <Button
                    variant="ghost"
                    className="text-cPrimary hover:text-cPrimaryHover hover:bg-transparent"
                    onClick={() => downloadInvoice(String(invoice.id))}
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden md:block">Télécharger</span>
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
