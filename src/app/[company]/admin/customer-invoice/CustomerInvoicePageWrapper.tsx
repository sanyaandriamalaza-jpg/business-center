"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Search,
  Building2,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { InvoiceDataFormat } from "@/src/lib/type";
import {
  translateStatus,
  translatePayment,
  getStatusColor,
} from "@/src/lib/utils";

interface InvoiceResponse {
  success: boolean;
  data: InvoiceDataFormat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface Props {
  initialData: InvoiceResponse;
  companySlug: string;
}

type FilterType = "all" | "virtual_office" | "office_reservation";

export default function CustomerInvoicePageWrapper({
  initialData,
  companySlug,
}: Props) {
  const [invoices, setInvoices] = useState<InvoiceDataFormat[]>(
    initialData.data
  );
  const [serviceFilter, setServiceFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const stats = useMemo(() => {
    const all = invoices.length;
    const virtualOffice = invoices.filter(
      (inv) => inv.service?.type === "virtual_office"
    ).length;
    const officeReservation = invoices.filter(
      (inv) => inv.service?.type === "office_reservation"
    ).length;
    return { all, virtualOffice, officeReservation };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (serviceFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.service?.type === serviceFilter
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice.reference.toLowerCase().includes(searchLower) ||
          String(invoice.invoice.referenceNum)
            .toLowerCase()
            .includes(searchLower) ||
          invoice.customer.firstName.toLowerCase().includes(searchLower) ||
          invoice.customer.name.toLowerCase().includes(searchLower) ||
          invoice.customer.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [invoices, serviceFilter, searchTerm]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatAmount = (amount: number, currency: string = "EUR") =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "virtual_office":
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case "office_reservation":
        return <MapPin className="w-[20px] h-[20px] text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getServiceLabel = (serviceType: string) => {
    switch (serviceType) {
      case "virtual_office":
        return "Domiciliation";
      case "office_reservation":
        return "Réservation";
      default:
        return "Service";
    }
  };

  const columns: ColumnDef<InvoiceDataFormat>[] = [
    {
      accessorKey: "service",
      header: "Service",
      cell: ({ row }) => {
        const service = row.original.service;
        return (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-muted">
              {getServiceIcon(service?.type)}
            </div>
            <div>
              <div className="font-medium">
                {getServiceLabel(service?.type)}
              </div>
              <div className="text-sm text-muted-foreground">
                {service?.name || "Non spécifié"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "invoice.reference",
      header: "Référence",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.invoice.reference}
            {row.original.invoice.referenceNum}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "customer.name",
      header: "Client",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.customer.firstName} {row.original.customer.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.customer.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "invoice.issueDate",
      header: "Date d'émission",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {formatDate(row.original.invoice.issueDate)}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(row.original.invoice.issueDate).toLocaleDateString(
              "fr-FR",
              {
                weekday: "short",
              }
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "invoice.amount",
      header: "Montant",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">
            {formatAmount(
              row.original.invoice.amount,
              row.original.invoice.currency
            )}
          </div>
          {/* {row.original.invoice.amountNet && (
            <div className="text-sm text-muted-foreground">
              HT:{" "}
              {formatAmount(
                row.original.invoice.amountNet,
                row.original.invoice.currency
              )}
            </div>
          )} */}
        </div>
      ),
    },
    {
      accessorKey: "invoice.paymentMethod",
      header: "Mode de Payement",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold bg-violet-100 text-violet-800 border-violet-300`}
        >
          {translatePayment(row.original.invoice.paymentMethod || "")}
        </span>
      ),
    },
    {
      accessorKey: "invoice.status",
      header: "Statut",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getStatusColor(
            row.original.invoice.status ||
              row.original.invoice.subscriptionStatus
          )}`}
        >
          {translateStatus(
            row.original.invoice.status ||
              row.original.invoice.subscriptionStatus
          )}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredInvoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });
  return (
    <div className=" py-8 min-h-screen">
      <div className=" mx-auto p-6 ">
        {/* HEADER */}
        <div className="mb-8 flex flex-col items-start justify-start">
          <h1 className="text-2xl font-bold text-cDefaultSecondary-100">
            Gestion des Factures
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            consulter, filtrer et imprimer toutes vos factures rapidement et
            facilement.
          </p>
        </div>

        {/* FILTERS */}
        <Card className="mb-6">
          <CardHeader className="!p-6 !pb-0">
            <CardTitle className="flex items-center justify-between ">
              <div className="flex flex-col gap-[20px] items-start justify-start">
                <span className="text-[14px] text-primaryColor bg-purple-100 p-2 rounded-md">
                  Total facture{stats.all !== 1 ? "s" : ""}: {stats.all}
                </span>
                <span className="pb-3">Filtres et Recherche</span>
              </div>
              <Badge variant="outline">
                {filteredInvoices.length} facture
                {filteredInvoices.length !== 1 ? "s" : ""} filtrée
                {filteredInvoices.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* SEARCH */}

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, email ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* DROPDOWN FILTER */}
              <div className="w-full sm:w-64">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {serviceFilter === "all"
                        ? "Tous les services"
                        : serviceFilter === "virtual_office"
                          ? "Domiciliation"
                          : "Espaces"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem onClick={() => setServiceFilter("all")}>
                      <span>Tous les services</span>
                      <Badge variant="outline" className="ml-auto">
                        {stats.all}
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setServiceFilter("virtual_office")}
                    >
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      <span>Domiciliation</span>
                      <Badge variant="outline" className="ml-auto">
                        {stats.virtualOffice}
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setServiceFilter("office_reservation")}
                    >
                      <Building2 className="w-[20px] h-[20px] mr-2 text-blue-600" />
                      <span>Espaces</span>
                      <Badge variant="outline" className="ml-auto">
                        {stats.officeReservation}
                      </Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronDown className="inline-block w-4 h-4 ml-1" />
                          ),
                          desc: (
                            <ChevronUp className="inline-block w-4 h-4 ml-1 " />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() =>
                      router.push(
                        `/${companySlug}/admin/customer-invoice/${row.original.invoice.id}`
                      )
                    }
                    className="cursor-pointer hover:bg-muted/20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {/* PAGINATION */}
          <CardContent className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                sur <span className="font-medium">{table.getPageCount()}</span>
              </div>
              {/* Lignes par page - style amélioré */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  Afficher :
                </span>
                <div className="relative inline-block">
                  <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={(value) =>
                      setPagination((prev) => ({
                        ...prev,
                        pageSize: Number(value),
                        pageIndex: 0,
                      }))
                    }
                  >
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                  factures par page
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
