"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { format, parse, subHours } from "date-fns";
import { fr } from "date-fns/locale";
import DateTimePicker from "../../../../../components/global/DateTimePicker";
import {
  formatDateToTime,
  generateTimeOptions,
  getDuration,
  getNumberOfDays,
  getRoundedMinTime,
} from "@/src/lib/customfunction";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/src/components/global/DateRangePicker";
import { DayName, DisabledDay, LocationTypeType, Office } from "@/src/lib/type";
import { useGlobalStore } from "@/src/store/useGlobalStore";

function addHoursToTime(time: string, hoursToAdd: number): string {
  const [h, m] = time.split(":").map(Number);
  const newDate = new Date();
  newDate.setHours(h + hoursToAdd, m, 0, 0);
  return newDate.toTimeString().slice(0, 5);
}

function getOfficeHour(
  office: Office,
  dayName: DayName,
  type: "open" | "close",
  defaultHour: string
): string {
  return (
    office.specificBusinessHour?.[dayName]?.[type] ??
    office.businessHour?.[dayName]?.[type] ??
    defaultHour
  );
}

function excludePeriodTimes(
  times: string[],
  fromTime: string,
  toTime: string,
  offset: number
): string[] {
  const startIndex = times.findIndex((t) => t === fromTime);
  const endIndex = times.findIndex((t) => t === toTime);
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex)
    return times;
  const from = Math.max(0, Math.floor(startIndex - offset / 0.5 - 1));
  const to = Math.min(times.length, Math.floor(endIndex + offset / 0.5));
  return times.slice(from, to);
}

interface DateSelectionStepProps {
  className?: string;
  setStep: (value: number) => void;
  onSaveChange: (
    locationType: LocationTypeType,
    dateStart?: Date,
    timeStart?: string,
    timeEnd?: string,
    dailyDateRange?: DateRange
  ) => void;
  price: {
    hourly?: number | null;
    daily?: number | null;
  };
  officeInfo: Office;
}

export default function DateSelectionStep({
  setStep,
  price,
  onSaveChange,
  officeInfo,
  className,
}: DateSelectionStepProps) {
  const [dateStart, setDateStart] = useState<Date>();
  const [timeStart, setTimeStart] = useState<string>();
  const [timeEnd, setTimeEnd] = useState<string>();
  const [startRangeTime, setStartRangeTime] = useState<string[]>([]);
  const [endRangeTime, setEndRangeTime] = useState<string[]>([]);
  const [offsetTime] = useState<number>(2);
  const [delayBeforeReservation] = useState<number>(1);
  const [locationType, setLocationType] = useState<LocationTypeType>("hourly");
  const [dailyDateRange, setDailyDateRange] = useState<DateRange>();
  const [disabledDaysList, setDisabledDaysList] = useState<DisabledDay[]>([]);
  const [dayNameDisabledList, setDayNameDisabledList] = useState<string[]>([]);

  const [initialDate, setInitialDate] = useState<Date>();
  const [initialTimeStart, setInitialTimeStart] = useState<string>();
  const [initialTimeEnd, setInitialTimeEnd] = useState<string>();

  useEffect(() => {
    if (!dateStart) return;
    const isToday = new Date().toDateString() === dateStart.toDateString();
    const dayName = dateStart
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as DayName;
    const startHour = getOfficeHour(officeInfo, dayName, "open", "08:00");
    const endHour = getOfficeHour(officeInfo, dayName, "close", "20:00");
    const minSelectable = isToday
      ? getRoundedMinTime(delayBeforeReservation)
      : undefined;
    const minTimeStr = minSelectable
      ? formatDateToTime(minSelectable)
      : undefined;
    const maxTimeStrHeureDate = parse(endHour, "HH:mm", new Date());

    // On retire 1 heure à l‘heure de fermeture
    const maxTimeStr = formatDateToTime(subHours(maxTimeStrHeureDate, 1));

    const times = generateTimeOptions(
      30,
      startHour,
      endHour,
      minTimeStr,
      maxTimeStr
    );

    let filteredTimes = [...times];
    let timesToRemoveIntoList: string[] = [];

    officeInfo.unavailablePeriods?.forEach((period) => {
      if (
        !period.allDay &&
        new Date(period.from).toDateString() === dateStart.toDateString()
      ) {
        const fromTime = formatDateToTime(new Date(period.from));
        const toTime = formatDateToTime(new Date(period.to));
        const arr = excludePeriodTimes(
          filteredTimes,
          fromTime,
          toTime,
          offsetTime
        );
        timesToRemoveIntoList = [...timesToRemoveIntoList, ...arr];
      }
    });

    const timesFinal = filteredTimes.filter(
      (time) => !timesToRemoveIntoList.includes(time)
    );

    setStartRangeTime(timesFinal);
  }, [dateStart, officeInfo, delayBeforeReservation, offsetTime]);

  useEffect(() => {
    if (!timeStart || !dateStart) return;
    const dayName = dateStart
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as DayName;
    const startPlus1h = addHoursToTime(timeStart, 1);
    const endHour = getOfficeHour(officeInfo, dayName, "close", "20:00");
    const times = generateTimeOptions(30, startPlus1h, endHour);

    let filteredTimes = [...times];

    officeInfo.unavailablePeriods?.forEach((period) => {
      if (
        !period.allDay &&
        new Date(period.from).toDateString() === dateStart.toDateString()
      ) {
        const fromTime = formatDateToTime(new Date(period.from));
        const toTime = formatDateToTime(new Date(period.to));

        const indexOfFromTimeInTimes = filteredTimes.findIndex(
          (t) => t === fromTime
        );
        if (indexOfFromTimeInTimes !== -1) {
          const indexOfFromTimeInTimesWithOffsetTime =
            indexOfFromTimeInTimes - (offsetTime / 0.5 - 1);
          filteredTimes = filteredTimes.slice(
            0,
            indexOfFromTimeInTimesWithOffsetTime
          );
        }
      }
    });

    setEndRangeTime(filteredTimes);
  }, [timeStart, officeInfo, dateStart, offsetTime]);

  const duration = useMemo(() => {
    if (locationType === "hourly" && timeStart && timeEnd)
      return getDuration(timeStart, timeEnd);
    if (locationType === "daily" && dailyDateRange)
      return getNumberOfDays(dailyDateRange);
    return null;
  }, [locationType, timeStart, timeEnd, dailyDateRange]);

  const total =
    duration && duration > 0
      ? duration *
        (locationType === "hourly" ? (price.hourly ?? 0) : (price.daily ?? 0))
      : 0;

  const isValid = useMemo(() => {
    return locationType === "hourly"
      ? !!(dateStart && timeStart && timeEnd)
      : !!dailyDateRange;
  }, [locationType, dateStart, timeStart, timeEnd, dailyDateRange]);

  useEffect(() => {
    const bh = officeInfo.specificBusinessHour || officeInfo.businessHour;
    if (!bh) return setDayNameDisabledList([]);
    const closed = Object.entries(bh)
      .filter(([_, h]) => h.isClosed)
      .map(([d]) => d);
    setDayNameDisabledList(closed);

    const list: DisabledDay[] = [];
    officeInfo.unavailablePeriods?.forEach((p) => {
      if (p.allDay && p.from && p.to) {
        list.push({ from: new Date(p.from), to: new Date(p.to) });
      }
    });
    setDisabledDaysList(list);
  }, [officeInfo]);

  const initialDateHourFilter = useGlobalStore(
    (state) => state.initialDateHourFilter
  );
  useEffect(() => {
    if (initialDateHourFilter.date) setInitialDate(initialDateHourFilter.date);
    if (initialDateHourFilter.hourStart)
      setInitialTimeStart(initialDateHourFilter.hourStart);
    if (initialDateHourFilter.hourEnd)
      setInitialTimeEnd(initialDateHourFilter.hourEnd);
  }, [initialDateHourFilter]);

  return (
    <CardContent className={`px-4 xl:p-8 ${className ?? ""}`}>
      <div className="mb-6 space-y-4">
        <div className="space-y-2 text-cStandard">
          <p>Location</p>
          <div className="ml-3">
            {["hourly", "daily"].map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 cursor-pointer w-fit"
                onClick={() => setLocationType(type as LocationTypeType)}
              >
                <div
                  className={`border p-[1px] w-4 h-4 rounded-full ${locationType === type ? "border-cPrimary" : "border-gray-400"}`}
                >
                  {locationType === type && (
                    <div className="bg-cPrimary w-full h-full rounded-full"></div>
                  )}
                </div>
                <div>{type === "hourly" ? "À l’heure" : "Journalier"}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          {locationType === "hourly" ? (
            <DateTimePicker
              initialDate={initialDate}
              initialTimeStart={initialTimeStart}
              initialTimeEnd={initialTimeEnd}
              availableStartTimes={startRangeTime}
              availableEndTimes={endRangeTime}
              dateInputLabel="Date de début"
              onChange={(date, time, end) => {
                setDateStart(date);
                setTimeStart(time);
                setTimeEnd(end);
              }}
              disabledDays={disabledDaysList}
              unavailableDayName={dayNameDisabledList}
            />
          ) : (
            <DateRangePicker
              value={dailyDateRange}
              onChange={(range) =>
                setDailyDateRange(range ?? { from: undefined, to: undefined })
              }
              disabledDays={disabledDaysList}
              unavailableDayName={dayNameDisabledList}
            />
          )}
        </div>
      </div>

      {isValid && duration && duration > 0 && (
        <div className="mt-8">
          <Card
            className="bg-cPrimary/10 border-0"
            style={{
              backgroundColor: "rgb(var(--custom-background-color))",
              borderColor: "rgb(var(--custom-foreground-color)/0.1",
            }}
          >
            <CardContent className="py-6 px-6">
              <div className="font-bold mb-2 py-4 text-cStandard">
                Résumé de la réservation
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="hidden sm:block text-cStandard/80 space-y-1">
                  <div>Date</div>
                  <div>
                    {locationType === "hourly" ? "Horaires" : "Nombre de jours"}
                  </div>
                  {locationType === "hourly" && <div>Durée</div>}
                  <div>Tarif</div>
                </div>
                <div className="text-cStandard space-y-1 sm:text-right">
                  <div>
                    {locationType === "hourly"
                      ? dateStart &&
                        format(dateStart, "EEE d MMM yyyy", { locale: fr })
                      : dailyDateRange?.from &&
                        dailyDateRange?.to &&
                        `${format(dailyDateRange.from, "EEE d MMM yyyy", { locale: fr })} - ${format(dailyDateRange.to, "EEE d MMM yyyy", { locale: fr })}`}
                  </div>
                  <div>
                    {locationType === "hourly"
                      ? `${timeStart} - ${timeEnd}`
                      : `${duration} jour${duration > 1 ? "s" : ""}`}
                  </div>
                  {locationType === "hourly" && (
                    <div>
                      {duration} {duration > 1 ? "heures" : "heure"}
                    </div>
                  )}
                  <div>
                    {locationType === "hourly" ? price.hourly : price.daily} €/
                    {locationType === "hourly" ? "heure" : "jour"}
                  </div>
                </div>
              </div>
              <hr className="my-3 border-cStandard/20" />
              <div className="flex justify-between font-bold">
                <div className="text-cStandard">Total</div>
                <div className="text-cPrimary">{total}€</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <Button
          variant="ghost"
          onClick={() => {
            onSaveChange(
              locationType,
              dateStart,
              timeStart,
              timeEnd,
              dailyDateRange
            );
            setStep(1);
          }}
          className={`${!isValid ? "bg-indigo-100 cursor-not-allowed text-gray-500 opacity-50" : "bg-cPrimary text-cForeground hover:text-cForeground hover:bg-cPrimaryHover"} px-6 py-3 rounded-lg font-semibold`}
          disabled={!isValid}
        >
          Continuer vers le paiement
        </Button>
      </div>
    </CardContent>
  );
}
