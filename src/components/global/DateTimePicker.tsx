import { useEffect, useMemo, useState } from "react";
import { fr } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";

import type { DayPickerProps } from "react-day-picker";
import { dayNameToIndex } from "@/src/lib/utils";
import { DisabledDay } from "@/src/lib/type";
type Props = {
  availableStartTimes: string[];
  availableEndTimes?: string[];
  dateInputLabel: string;
  initialDate?: Date;
  initialTimeStart?: string;
  initialTimeEnd?: string;
  minDate?: Date;
  minTime?: string;
  onChange?: (date?: Date, time?: string, end?: string) => void;
  disabledDays?: DisabledDay[];
  unavailableDayName?: string[] | null;
};

export default function DateTimePicker({
  availableStartTimes,
  availableEndTimes,
  dateInputLabel,
  initialDate,
  initialTimeStart,
  initialTimeEnd,
  minDate = new Date(),
  minTime,
  onChange,
  disabledDays,
  unavailableDayName,
}: Props) {
  const [openStart, setOpenStart] = useState(false);
  const [dateStart, setDateStart] = useState<Date | undefined>(initialDate);
  const [timeStart, setTimeStart] = useState(initialTimeStart ?? "");
  const [timeEnd, setTimeEnd] = useState(initialTimeEnd ?? "");
  const [hasUserSelectedTime, setHasUserSelectedTime] = useState(false);

  // Met à jour l'heure de début automatiquement si l'utilisateur n'en a pas sélectionné une
  useEffect(() => {
    if (dateStart && !hasUserSelectedTime) {
      const isSameDay = dateStart.toDateString() === minDate.toDateString();
      let fallback = isSameDay ? (minTime ?? "") : "08:00";

      if (!availableStartTimes.includes(fallback)) {
        fallback = availableStartTimes[0] ?? "";
      }

      setTimeStart(fallback);
    }
    if (timeStart) {
      setTimeStart(timeStart);
    }
  }, [
    dateStart,
    minDate,
    minTime,
    availableStartTimes,
    hasUserSelectedTime,
    timeStart,
  ]);

  useEffect(() => {
    onChange?.(dateStart, timeStart, timeEnd);
  }, [dateStart, timeStart, timeEnd, onChange]);

  const computedDisabledDays = useMemo<DisabledDay[]>(() => {
    const disabled: DisabledDay[] = [];

    if (minDate) {
      disabled.push({ before: minDate });
    }
    if (unavailableDayName?.length) {
      const disabledWeekdays = unavailableDayName
        .map((day) => dayNameToIndex[day.toLowerCase()])
        .filter((v): v is number => typeof v === "number");

      if (disabledWeekdays.length > 0) {
        disabled.push((date) => disabledWeekdays.includes(date.getDay()));
      }
    }
    if (disabledDays) {
      const normalized = Array.isArray(disabledDays)
        ? disabledDays
        : [disabledDays];
      disabled.push(...normalized);
    }

    return disabled;
  }, [minDate, unavailableDayName, disabledDays]);

  useEffect(() => {
    if (initialDate) {
      setDateStart(initialDate);
    }
    if (initialTimeStart) {
      setTimeStart(initialTimeStart);
    }
    if (initialTimeEnd) {
      setTimeEnd(initialTimeEnd);
    }
  }, [initialDate, initialTimeStart, initialTimeEnd]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      <div className="flex flex-col gap-3 flex-1">
        <Label htmlFor="date-picker" className="px-1 text-cStandard">
          {dateInputLabel}
        </Label>
        <Popover open={openStart} onOpenChange={setOpenStart}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-full justify-between font-normal bg-transparent text-cStandard hover:bg-cStandard/5 hover:text-cStandard"
            >
              {dateStart
                ? dateStart.toLocaleDateString("fr-FR")
                : dateInputLabel}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
            style={{
              backgroundColor: "rgb(var(--custom-background-color))",
              borderColor: "rgb(var(--custom-foreground-color)/0.1)",
            }}
          >
            <Calendar
              mode="single"
              selected={dateStart}
              captionLayout="dropdown"
              onSelect={(date) => {
                if (date) {
                  setDateStart(date);
                  setOpenStart(false);
                }
              }}
              locale={fr}
              disabled={computedDisabledDays}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-3 flex-1">
        {dateStart && (
          <div className="flex-1">
            <Label htmlFor="time-picker" className="px-1 text-cStandard">
              Heure de début
            </Label>
            <Select
              value={timeStart}
              onValueChange={(value) => {
                setTimeStart(value);
                setHasUserSelectedTime(true);
                setTimeEnd('')
              }}
            >
              <SelectTrigger
                id="time-picker"
                className="w-full text-cStandard cSelectTrigger"
              >
                <SelectValue placeholder="Choisir heure" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: "rgb(var(--custom-background-color))",
                  borderColor: "rgb(var(--custom-foreground-color)/0.1)",
                }}
              >
                {availableStartTimes.map((time) => (
                  <SelectItem
                    key={time}
                    value={time}
                    className="text-cStandard"
                  >
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {timeStart && availableEndTimes && (
          <div className="flex-1">
            <Label htmlFor="time-end-picker" className="px-1 text-cStandard">
              Heure de fin
            </Label>
            <Select
              value={timeEnd}
              onValueChange={(value) => setTimeEnd(value)}
            >
              <SelectTrigger
                id="time-end-picker"
                className="w-full text-cStandard cSelectTrigger"
              >
                <SelectValue placeholder="Choisir heure" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: "rgb(var(--custom-background-color))",
                  borderColor: "rgb(var(--custom-foreground-color)/0.1)",
                }}
              >
                {availableEndTimes.map((time) => (
                  <SelectItem
                    key={time}
                    value={time}
                    className="text-cStandard"
                  >
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
