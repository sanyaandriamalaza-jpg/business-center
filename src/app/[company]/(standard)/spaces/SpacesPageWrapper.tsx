"use client";

import { useEffect, useState } from "react";
import SpaceCard from "./SpaceCard";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import {
  BusinessHour,
  DayName,
  Office,
  UnavailablePeriod,
} from "@/src/lib/type";
import {
  formatDateToTime,
  generateTimeOptions,
  getDatesInRange,
  getRoundedMinTime,
  translateCoworkingOfferType,
} from "@/src/lib/customfunction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ChevronDownIcon, ChevronUp, Clock, Search, Users } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { allEquipments, cn, dayNames, spaceTypes } from "@/src/lib/utils";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import CRangeSlider from "@/src/components/global/CRangeSlider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { fr } from "date-fns/locale";
import { addHours, subHours, parse } from "date-fns";

const capacities = [1, 2, 4, 6, 8, 10];

function getMinMaxHours(bh: BusinessHour): {
  min: string | null;
  max: string | null;
} {
  let min: string | null = null;
  let max: string | null = null;

  dayNames.forEach((day) => {
    const hours = bh[day];
    if (hours?.isClosed || !hours.open || !hours.close) return;

    if (!min || hours.open < min) min = hours.open;
    if (!max || hours.close > max) max = hours.close;
  });

  return { min, max };
}

export default function SpacesPageWrapper({
  officeList,
}: {
  officeList: Office[];
}) {

  const [offsetTime] = useState<number>(2);
  const [delayBeforeReservation] = useState<number>(1);

  const [globalMinHour, setGlobalMinHour] = useState<string | null>(null);
  const [globalMaxHour, setGlobalMaxHour] = useState<string | null>(null);
  const [timeStartOptionsList, setTimeStartOptionsList] = useState<string[]>(
    []
  );
  const [timeEndOptionsList, setTimeEndOptionsList] = useState<string[]>([]);

  const [timeStartSelected, setTimeStartSelected] = useState<string>();
  const [timeEndSelected, setTimeEndSelected] = useState<string>();

  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );
  const [officeListFiltered, setOfficeListFiltered] =
    useState<Office[]>(officeList);

  const [checkedSpaces, setCheckedSpaces] = useState<string[]>([]);
  const [checkedEquipments, setCheckedEquipments] = useState<string[]>([]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [searchValue, setSearchValue] = useState<string>("");

  const [filterCapacity, setFilterCapacity] = useState<number>();

  const [priceFilterRangeValue, setPriceFilterRangeValue] =
    useState<number[]>();

  useEffect(() => {
    let minHour: string | null = null;
    let maxHour: string | null = null;

    officeList.forEach((office) => {
      const allHours: BusinessHour[] = [];

      if (office.businessHour) allHours.push(office.businessHour);
      if (office.specificBusinessHour)
        allHours.push(office.specificBusinessHour);

      allHours.forEach((hourSet) => {
        const { min, max } = getMinMaxHours(hourSet);

        if (min && (!minHour || min < minHour)) minHour = min;
        if (max && (!maxHour || max > maxHour)) maxHour = max;
      });
    });

    if (minHour && maxHour && selectedDate) {
      const isToday = new Date().toDateString() === selectedDate.toDateString();
      const minSelectable = isToday
        ? getRoundedMinTime(delayBeforeReservation)
        : undefined;
      const minSelectableStr = minSelectable
        ? formatDateToTime(minSelectable)
        : undefined;
      const list = generateTimeOptions(30, minHour, maxHour, minSelectableStr);
      setGlobalMinHour(minHour);
      setGlobalMaxHour(maxHour);
      setTimeStartOptionsList(list);
    }
  }, [officeList, selectedDate]);

  useEffect(() => {
    if (
      timeStartOptionsList.length > 0 &&
      timeStartSelected != null &&
      globalMaxHour
    ) {
      const indexOfTimeStartSelected = timeStartOptionsList.findIndex(
        (item) => item === timeStartSelected
      );
      const list = generateTimeOptions(
        30,
        timeStartOptionsList[indexOfTimeStartSelected + 2],
        globalMaxHour
      );
      setTimeEndOptionsList(list);
    }
  }, [timeStartOptionsList, timeStartSelected, globalMaxHour]);
  const isPeriodUnavailable = (
    office: Office,
    period: UnavailablePeriod
  ): boolean => {
    if (!selectedDate || !timeStartSelected) return false;

    const selected = new Date(selectedDate);
    const selectedDayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    })
      .format(selected)
      .toLowerCase() as DayName;

    // Obtenir les horaires d'ouverture pour le jour sélectionné
    const businessHour =
      office.specificBusinessHour?.[selectedDayName] ??
      office.businessHour?.[selectedDayName];

    // Vérifier si le bureau est fermé ce jour-là
    if (!businessHour || businessHour.isClosed) return true;

    const open = businessHour.open;
    const close = businessHour.close;

    // Vérifier la cohérence des horaires d'ouverture
    if (!open || !close || open >= close) return true;

    const from = period.allDay
      ? new Date(period.from)
      : subHours(new Date(period.from), offsetTime);
    const to = period.allDay
      ? new Date(period.to)
      : addHours(new Date(period.to), offsetTime);

    // Normaliser les dates pour la comparaison (ignorer l'heure)
    const selectedDateOnly = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate()
    );
    const fromDateOnly = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    const toDayOnly = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    // Vérifier si la date sélectionnée est dans la période d'indisponibilité
    const isDateInPeriod =
      selectedDateOnly >= fromDateOnly && selectedDateOnly <= toDayOnly;

    if (!isDateInPeriod) return false;

    // Si c'est une période "allDay", alors toute la journée est indisponible
    if (period.allDay) return true;

    // Pour les périodes horaires, vérifier les chevauchements
    const hourMinUnavailable = formatDateToTime(from);
    const hourMaxUnavailable = formatDateToTime(to);

    // Vérifier si l'heure de début est dans les horaires d'ouverture
    if (timeStartSelected < open || timeStartSelected >= close) {
      return true;
    }

    // Vérifier si l'heure de fin est dans les horaires d'ouverture (si définie)
    if (
      timeEndSelected &&
      (timeEndSelected <= open || timeEndSelected > close)
    ) {
      return true;
    }

    // Fonction helper pour vérifier les chevauchements horaires
    const hasTimeOverlap = (
      start1: string,
      end1: string,
      start2: string,
      end2: string
    ): boolean => {
      return start1 < end2 && end1 > start2;
    };


    const selectedEndTime = timeEndSelected || timeStartSelected;

    // Ajouter une marge de sécurité (1h avant pour éviter les réservations trop proches)
    const hourMinUnavailableWithMargin = subHours(from, 1);
    const hourMinWithMargin = formatDateToTime(hourMinUnavailableWithMargin);

    // Vérifier les différents cas de chevauchement
    return hasTimeOverlap(
      timeStartSelected,
      selectedEndTime,
      hourMinWithMargin,
      hourMaxUnavailable
    );
  };

  const isOfficeAvailable = (office: Office): boolean => {
    // Si aucune date/heure sélectionnée, on considère comme disponible
    if (!selectedDate || !timeStartSelected) return true;

    const selectedDayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    })
      .format(selectedDate)
      .toLowerCase() as DayName;

    // Vérifier les horaires d'ouverture de base
    const businessHour =
      office.specificBusinessHour?.[selectedDayName] ??
      office.businessHour?.[selectedDayName];

    if (!businessHour || businessHour.isClosed) return false;

    const { open, close } = businessHour;
    if (!open || !close || open >= close) return false;

    // Vérifier que les heures sélectionnées sont dans les horaires d'ouverture
    if (timeStartSelected < open || timeStartSelected >= close) return false;

    if (
      timeEndSelected &&
      (timeEndSelected <= open || timeEndSelected > close)
    ) {
      return false;
    }

    // Vérifier les périodes d'indisponibilité
    const unavailablePeriods = office.unavailablePeriods ?? [];

    return !unavailablePeriods.some((period) =>
      isPeriodUnavailable(office, period)
    );
  };

  useEffect(() => {
    if (!officeList) return;

    const normalizedSearch = searchValue.trim().toLowerCase();

    const filtered = officeList.filter((office) => {
      // Filtrage par recherche textuelle
      const name = office.name?.toLowerCase() ?? "";
      const addressObj = office.specificAddress || office.companyAddress;
      const address =
        `${addressObj?.addressLine ?? ""}, ${addressObj?.city ?? ""}, ${addressObj?.state ?? ""}, ${addressObj?.country ?? ""}`.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        address.includes(normalizedSearch);

      // Filtrage par type d'espace
      const offerType = office.coworkingOffer?.type ?? "";
      const matchesType =
        checkedSpaces.length === 0 || checkedSpaces.includes(offerType);

      // Filtrage par capacité
      const capacity = office.maxSeatCapacity ?? 0;
      const matchesCapacity = !filterCapacity || capacity >= filterCapacity;

      // Filtrage par équipements
      const features = office.features?.map((f) => f.value) ?? [];
      const matchesEquipments =
        checkedEquipments.length === 0 ||
        checkedEquipments.every((eq) => features.includes(eq));

      // Filtrage par prix
      const hourlyRate = office.coworkingOffer?.hourlyRate;
      const matchesPrice =
        !priceFilterRangeValue ||
        (hourlyRate != null &&
          hourlyRate >= priceFilterRangeValue[0] &&
          hourlyRate <= priceFilterRangeValue[1]);

      // Vérification de la disponibilité
      let isAvailable = isOfficeAvailable(office);

      // Retour du résultat final
      const result =
        matchesSearch &&
        matchesType &&
        matchesCapacity &&
        matchesEquipments &&
        matchesPrice &&
        isAvailable;

      return result;
    });

    setOfficeListFiltered(filtered);
  }, [
    officeList,
    searchValue,
    checkedSpaces,
    filterCapacity,
    checkedEquipments,
    priceFilterRangeValue,
    selectedDate,
    timeStartSelected,
    timeEndSelected,
  ]);

  const setInitialDateHourFilter = useGlobalStore(
    (state) => state.setInitialDateHourFilter
  );
  useEffect(() => {
    setInitialDateHourFilter(selectedDate, timeStartSelected, timeEndSelected);
  }, [selectedDate, timeStartSelected, timeEndSelected]);

  return (
    <div className="w-full mx-auto">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-cStandard mb-2">
          Espaces Disponibles
        </h1>
        <p className="text-lg text-grey-600 mb-8 text-cStandard">
          Trouvez et réservez votre espace de travail idéal parmi notre
          sélection de bureaux et salles de réunion.
        </p>
        <div>
          <div className="bg-cBackground rounded-lg shadow p-5 mb-8">
            <div className="relative mb-6">
              <Search
                className="absolute left-3 inset-y-0 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Rechercher par nom ou emplacement..."
                type="search"
                className="pl-10 pr-4 py-5 focus:ring-2 text-cStandard focus:ring-cPrimary focus:border-transparent cInputSearch"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
              <div>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      id="date"
                      className="w-full justify-between font-normal border pr-4 py-5 focus:ring-2 focus:ring-cPrimary focus:border-transparent cSelectTrigger text-cStandard hover:bg-transparent hover:text-cStandard"
                    >
                      {selectedDate
                        ? selectedDate.toLocaleDateString()
                        : "Selectionner une date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                    style={{
                      backgroundColor: "rgb(var(--custom-background-color))",
                    }}
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      captionLayout="dropdown"
                      locale={fr}
                      disabled={{ before: new Date() }}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative w-full ">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cStandard/80"
                  size={20}
                />
                <Select
                  value={timeStartSelected}
                  onValueChange={setTimeStartSelected}
                >
                  <SelectTrigger className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-cPrimary focus:border-transparent cSelectTrigger text-cStandard">
                    <SelectValue placeholder="Heure de début" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "rgb(var(--custom-background-color))",
                    }}
                  >
                    <SelectGroup>
                      <SelectLabel className="text-cStandard">
                        Heure de début
                      </SelectLabel>
                      {Array.isArray(timeStartOptionsList) &&
                      timeStartOptionsList.length > 0 ? (
                        timeStartOptionsList.map((heure) => (
                          <SelectItem
                            key={heure}
                            value={heure}
                            className="text-cStandard"
                          >
                            {heure}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="text-cStandard px-2 text-xs opacity-70">
                          Veuillez sélectionner une date d‘abord
                        </p>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full ">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Select
                  value={timeEndSelected}
                  onValueChange={setTimeEndSelected}
                >
                  <SelectTrigger className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-cPrimary focus:border-transparent cSelectTrigger">
                    <SelectValue placeholder="Heure de fin" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "rgb(var(--custom-background-color))",
                    }}
                  >
                    <SelectGroup>
                      <SelectLabel className="text-cStandard">
                        Heure de fin
                      </SelectLabel>
                      {Array.isArray(timeEndOptionsList) &&
                      timeEndOptionsList.length > 0 ? (
                        timeEndOptionsList.map((heure) => (
                          <SelectItem
                            key={heure}
                            value={heure}
                            className="text-cStandard"
                          >
                            {heure}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="text-cStandard px-2 text-xs opacity-70">
                          Veuillez sélectionner une date et heure de début
                          d‘abord
                        </p>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full ">
                <Users
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Select
                  value={
                    filterCapacity === undefined
                      ? undefined
                      : `${filterCapacity}`
                  }
                  onValueChange={(value) => setFilterCapacity(Number(value))}
                >
                  <SelectTrigger className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-cPrimary focus:border-transparent cSelectTrigger text-cStandard">
                    <SelectValue placeholder="Capacité" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "rgb(var(--custom-background-color))",
                    }}
                  >
                    <SelectGroup>
                      <SelectLabel className="text-cStandard">
                        Capacité
                      </SelectLabel>
                      {capacities.map((capacitie) => (
                        <SelectItem
                          key={capacitie}
                          value={`${capacitie}`}
                          className="text-cStandard"
                        >
                          {capacitie >= 10 ? "+" : ""} {capacitie} personne
                          {capacitie > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 font-medium cursor-pointer select-none">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex items-center gap-2 text-cPrimary hover:bg-transparent hover:text-cPrimaryHover"
              >
                Filtres Avancés
                <span className="ml-1">
                  <ChevronUp
                    className={cn(
                      showAdvanced ? "" : "-rotate-180",
                      "duration-100"
                    )}
                  />
                </span>
              </Button>
              <AnimatePresence initial={false}>
                {showAdvanced && (
                  <motion.div
                    key="advanced-filters"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden cFilterSearch"
                  >
                    <div className="border-t border-cStandard/20 mt-6 pt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:col-span-3 "
                      >
                        <div className="space-y-2">
                          <h3 className="font-medium text-cStandard mb-3">
                            Type d'espace
                          </h3>
                          {spaceTypes.map((type) => (
                            <div
                              key={type.value}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={type.value}
                                checked={checkedSpaces.includes(type.value)}
                                onCheckedChange={(checked: boolean) => {
                                  setCheckedSpaces((prev) =>
                                    checked
                                      ? [...prev, type.value]
                                      : prev.filter((v) => v !== type.value)
                                  );
                                }}
                              />
                              <Label
                                htmlFor={type.value}
                                className="text-sm text-cStandard cursor-pointer"
                              >
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="lg:col-span-4 xl:col-span-4"
                      >
                        <div className="mr-2">
                          <h3 className="font-medium mb-3 text-cStandard">
                            Fourchette de prix (€/heure)
                          </h3>
                          <div className="flex flex-col gap-2 advancedFilter">
                            <CRangeSlider
                              minDistance={10}
                              initialValue={[0, 200]}
                              onValueChange={(values) =>
                                setPriceFilterRangeValue(values)
                              }
                            />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-5 xl:col-start-9 xl:col-span-4"
                      >
                        <div>
                          <h3 className="font-medium mb-3 text-cStandard">
                            Équipements
                          </h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
                            {allEquipments.map((eq) => (
                              <div
                                key={eq.value}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  id={eq.value}
                                  checked={checkedEquipments.includes(eq.value)}
                                  onCheckedChange={(checked: boolean) => {
                                    setCheckedEquipments((prev) =>
                                      checked
                                        ? [...prev, eq.value]
                                        : prev.filter((v) => v !== eq.value)
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor={eq.value}
                                  className="text-sm text-cStandard cursor-pointer"
                                >
                                  {eq.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {officeListFiltered.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {officeListFiltered.map((office) => {
                    const city = office.specificAddress
                      ? office.specificAddress.city
                      : office.companyAddress?.city;
                    return (
                      <motion.div
                        key={office.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        layout
                      >
                        <SpaceCard
                          id={office.id}
                          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${office.imageUrl}`}
                          alt={office.name}
                          badge={translateCoworkingOfferType(
                            office.coworkingOffer?.type ?? null
                          )}
                          espace={office.name}
                          capacity={office.maxSeatCapacity}
                          city={city}
                          equipments={office.features}
                          prix={office.coworkingOffer?.hourlyRate}
                          destination={`/${currentBusinessCenter?.slug}/spaces/${office.id}`}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-center text-gray-500 mt-10"
            >
              Aucun espace disponible.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
