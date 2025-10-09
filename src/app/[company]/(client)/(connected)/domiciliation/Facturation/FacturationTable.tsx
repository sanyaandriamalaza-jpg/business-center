import { Download, Receipt } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

export default function FacturationTable () {
    const [invoiceHistory, setInvoiceHistory] = useState([
        {
          id: "INV-001",
          date: "15 Jan 2024",
          amount: "298€",
          status: "paid",
          plan: "Pro"
        },
        {
          id: "INV-002",
          date: "15 Dec 2023",
          amount: "298€",
          status: "paid",
          plan: "Pro"
        },
        {
          id: "INV-003",
          date: "15 Nov 2023",
          amount: "218€",
          status: "paid",
          plan: "Starter"
        }
      ]);

      const downloadInvoice = (invoiceId: string) => {
        console.log(`Downloading invoice ${invoiceId}`);
      };

    return (
        <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-indigo-700 text-lg">Historique des Factures</CardTitle>
          <CardDescription>
            Consultez et téléchargez vos anciennes factures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-xs md:text-base">Facture</TableHead>
                <TableHead className="font-bold hidden md:block">Date</TableHead>
                <TableHead className="font-bold  text-xs md:text-base">Montant</TableHead>
                <TableHead className="font-bold  text-xs md:text-base">Formule</TableHead>
                <TableHead className="font-bold  text-xs md:text-base">Statut</TableHead>
                <TableHead className="md:text-center font-bold  text-xs md:text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-gray-600 text-xs md:text-base">{invoice.id}</TableCell>
                  <TableCell className="font-medium text-gray-600 hidden md:block">{invoice.date}</TableCell>
                  <TableCell className="font-medium text-gray-600  text-xs md:text-base">{invoice.amount}</TableCell>
                  <TableCell className="font-medium text-gray-600  text-xs md:text-base">{invoice.plan}</TableCell>
                  <TableCell>
                    <Badge variant={null} className={invoice.status === "paid" ? "bg-emerald-600 text-white md:px-4 rounded-xl" : "bg-amber-600 text-white md:px-4 rounded-xl"}>
                      {invoice.status === "paid" ? "Payé" : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="md:text-center">
                    <Button 
                      variant="ghost"  
                      className= "text-indigo-500 hover:text-[#341a6f] hover:bg-transparent"
                      onClick={() => downloadInvoice(invoice.id)}
                      title = "Télécharger"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden md:block">Télécharger</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    )
}