"use client";

import { Invoice } from "@/src/lib/type";
import { useEffect, useState } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { ReservationTable } from "./ReservationTable";
import { ToggleGroup, ToggleGroupItem } from "@/src/components/ui/toggle-group";
import { Funnel, RotateCcw } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { DateRangePicker } from "@/src/components/global/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

export default function ReservationPageWrapper({
  initialInvoices,
}: {
  initialInvoices: Invoice[];
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >();

  const [filterOfficeTypes, setFilterOfficeTypes] = useState<Set<string>>(
    new Set()
  );
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState<
    Set<string>
  >(new Set());
  const [filterDurationTypes, setFilterDurationTypes] = useState<Set<string>>(
    new Set()
  );
  const [filterNewOnly, setFilterNewOnly] = useState(false);

  const [inputSearchValue, setInputSearchValue] = useState("");

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [invoicesFiltered, setInvoicesFiltered] =
    useState<Invoice[]>(initialInvoices);

  const { toast } = useToast();

  const reloadData = async () => {
    try {
      const res = await fetch(`/api/invoice?type=office`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Erreur",
          description: "Impossible de recharger les données.",
          variant: "destructive",
        });
        return;
      }

      setInvoices(data.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rechargement.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = inputSearchValue.trim().toLowerCase();

      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      if (selectedDateRange?.from && selectedDateRange?.to) {
        minDate = new Date(selectedDateRange.from);
        minDate.setHours(0, 0, 0, 0);
        maxDate = new Date(selectedDateRange.to);
        maxDate.setHours(23, 59, 59, 999);
      } else if (selectedPeriod) {
        const today = new Date();
        const min = new Date();
        const max = new Date();

        if (selectedPeriod === "today") {
          min.setHours(0, 0, 0, 0);
          max.setHours(23, 59, 59, 999);
        } else if (selectedPeriod === "last-7-days") {
          min.setDate(today.getDate() - 7);
          min.setHours(0, 0, 0, 0);
          max.setHours(23, 59, 59, 999);
        } else if (selectedPeriod === "last-30-days") {
          min.setDate(today.getDate() - 30);
          min.setHours(0, 0, 0, 0);
          max.setHours(23, 59, 59, 999);
        } else if (selectedPeriod === "last-3-months") {
          min.setMonth(today.getMonth() - 3);
          min.setHours(0, 0, 0, 0);
          max.setHours(23, 59, 59, 999);
        }

        minDate = min;
        maxDate = max;
      }

      const filtered = invoices.filter((invoice) => {
        const ref =
          `${invoice.reference ?? ""}${invoice.referenceNum ?? ""}`.toLowerCase();
        const user =
          `${invoice.user?.name ?? ""} ${invoice.user?.firstName ?? ""}`.toLowerCase();
        const matchSearch =
          !query || ref.includes(query) || user.includes(query);

        const officeType = invoice.office?.coworkingOffer?.type;
        const matchOfficeType =
          filterOfficeTypes.size === 0 ||
          (officeType && filterOfficeTypes.has(officeType));

        const subStatus = invoice.subscriptionStatus;
        const matchSubStatus =
          filterSubscriptionStatus.size === 0 ||
          filterSubscriptionStatus.has(subStatus);

        const durationType = invoice.durationType;
        const matchDuration =
          filterDurationTypes.size === 0 ||
          filterDurationTypes.has(durationType);

        const matchPeriod =
          (!minDate || new Date(invoice.startSubscription) >= minDate) &&
          (!maxDate || new Date(invoice.startSubscription) <= maxDate);

        const matchNewOnly =
          !filterNewOnly || (filterNewOnly && invoice.isProcessed === false);

        return (
          matchSearch &&
          matchOfficeType &&
          matchSubStatus &&
          matchDuration &&
          matchPeriod &&
          matchNewOnly
        );
      });

      setInvoicesFiltered(filtered);
    }, 200);

    return () => clearTimeout(timeout);
  }, [
    inputSearchValue,
    invoices,
    filterOfficeTypes,
    filterSubscriptionStatus,
    filterDurationTypes,
    selectedPeriod,
    selectedDateRange,
    filterNewOnly,
  ]);

  function toggleSetValue(
    set: Set<string>,
    value: string,
    setter: (s: Set<string>) => void
  ) {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setter(newSet);
  }

  const reinitAllFilter = () => {
    setSelectedPeriod(null);
    setSelectedDateRange(undefined);
    setFilterOfficeTypes(new Set());
    setFilterSubscriptionStatus(new Set());
    setFilterDurationTypes(new Set());
    setInputSearchValue("");
    setFilterNewOnly(false);
  };

  const hasActiveFilters =
    filterNewOnly ||
    filterOfficeTypes.size > 0 ||
    filterSubscriptionStatus.size > 0 ||
    filterDurationTypes.size > 0 ||
    selectedPeriod !== null ||
    selectedDateRange !== undefined ||
    inputSearchValue.trim() !== "";

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-5">
        <h1 className="text-2xl font-bold text-cDefaultSecondary-100">
          Liste des réservations
        </h1>
      </div>
      <div className="w-full bg-white px-4 rounded-md">
        <div className="flex justify-between py-4 ">
          <div className="w-[300px] ">
            <Input
              placeholder="Rechercher une réservation..."
              className="w-full "
              value={inputSearchValue}
              onChange={(e) => setInputSearchValue(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8"
                    onClick={reinitAllFilter}
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Réinitialiser tous les filtres</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 relative cButtonNoRing"
                >
                  <Funnel />
                  {hasActiveFilters && (
                    <div className="absolute top-0 right-0">
                      <div className=" bg-green-500/40 w-2 h-2 rounded-full animate-ping"></div>
                      <div className="bg-green-500 w-[6px] h-[6px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filtre</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterNewOnly}
                  onCheckedChange={() => setFilterNewOnly(!filterNewOnly)}
                >
                  Nouvelles réservations
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {/* Type de bureau */}
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterOfficeTypes.has("privateOffice")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterOfficeTypes,
                      "privateOffice",
                      setFilterOfficeTypes
                    )
                  }
                >
                  Bureau privé
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterOfficeTypes.has("coworkingSpace")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterOfficeTypes,
                      "coworkingSpace",
                      setFilterOfficeTypes
                    )
                  }
                >
                  Espace coworking
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterOfficeTypes.has("meetingRoom")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterOfficeTypes,
                      "meetingRoom",
                      setFilterOfficeTypes
                    )
                  }
                >
                  Salle de réunion
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                {/* Statut abonnement */}
                <DropdownMenuLabel>Statut</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterSubscriptionStatus.has("confirmed")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterSubscriptionStatus,
                      "confirmed",
                      setFilterSubscriptionStatus
                    )
                  }
                >
                  Confirmé
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterSubscriptionStatus.has("pending")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterSubscriptionStatus,
                      "pending",
                      setFilterSubscriptionStatus
                    )
                  }
                >
                  En attente
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterSubscriptionStatus.has("canceled")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterSubscriptionStatus,
                      "canceled",
                      setFilterSubscriptionStatus
                    )
                  }
                >
                  Annulé
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Location</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterDurationTypes.has("hourly")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterDurationTypes,
                      "hourly",
                      setFilterDurationTypes
                    )
                  }
                >
                  Horaire
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="cursor-pointer"
                  checked={filterDurationTypes.has("daily")}
                  onCheckedChange={() =>
                    toggleSetValue(
                      filterDurationTypes,
                      "daily",
                      setFilterDurationTypes
                    )
                  }
                >
                  Journalier
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="cToggleFilter">
              <ToggleGroup
                size={"sm"}
                variant="outline"
                type="single"
                value={selectedPeriod ?? undefined}
                onValueChange={(val) => {
                  setSelectedPeriod(val);
                  setSelectedDateRange(undefined);
                }}
                className="inline-flex space-x-0 rounded-md overflow-hidden gap-0"
              >
                <ToggleGroupItem
                  value="last-3-months"
                  aria-label="3 derniers mois"
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  3 derniers mois
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="last-30-days"
                  aria-label="30 derniers jours"
                  className="rounded-none first:rounded-l-md last:rounded-r-md border-x-0 "
                >
                  30 derniers jours
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="last-7-days"
                  aria-label="7 derniers jours"
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  7 derniers jours
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="today"
                  aria-label="7 derniers jours"
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  Aujourd‘hui
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <DateRangePicker
                forAdmin={true}
                value={selectedDateRange}
                disabledDays={[]}
                onChange={(range: DateRange | undefined) => {
                  setSelectedDateRange(range);
                  setSelectedPeriod(null);
                }}
              />
            </div>
          </div>
        </div>
        <ReservationTable invoices={invoicesFiltered} reloadData={reloadData} />
      </div>
    </div>
  );
}
