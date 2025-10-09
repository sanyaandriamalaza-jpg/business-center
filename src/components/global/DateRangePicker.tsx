"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { DateRange, DayPickerProps } from "react-day-picker";
import { dayNameToIndex } from "@/src/lib/utils";
import { DisabledDay } from "@/src/lib/type";

type DateRangePickerProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabledDays?: DisabledDay[];
  forAdmin?: boolean;
  unavailableDayName?: string[] | null;
};


export function DateRangePicker({
  value,
  onChange,
  placeholder = "Sélectionnez une plage de dates",
  className = "",
  disabledDays,
  forAdmin,
  unavailableDayName,
}: DateRangePickerProps) {
  const [disabledDaysFormatted, setDisabledDaysFormatted] = React.useState<
    DisabledDay[]
  >([]);

  React.useEffect(() => {
    const today = new Date();

    const unavailableDayIndexes =
      unavailableDayName?.map((day) => dayNameToIndex[day.toLowerCase()]) ?? [];
    const baseDisabled = Array.isArray(disabledDays)
      ? disabledDays
      : disabledDays
        ? [disabledDays]
        : [];

    const weekdayDisabler = (date: Date) =>
      unavailableDayIndexes.includes(date.getDay());

    const rules: DisabledDay[] = [
      ...baseDisabled,
      ...(unavailableDayIndexes.length > 0 ? [weekdayDisabler] : []),
      ...(forAdmin ? [] : [{ before: today }]),
    ];

    setDisabledDaysFormatted(rules);
  }, [disabledDays, unavailableDayName, forAdmin]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`justify-start text-left font-normal text-sm border rounded-md px-3 flex items-center cursor-pointer ${
            forAdmin ? "h-[32px]" : "w-[300px] h-[38px] py-2 text-cStandard"
          } ${className}`}
        >
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd MMM yyyy", { locale: fr })} -{" "}
                {format(value.to, "dd MMM yyyy", { locale: fr })}
              </>
            ) : (
              format(value.from, "dd MMM yyyy", { locale: fr })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        style={{
          backgroundColor: forAdmin
            ? undefined
            : "rgb(var(--custom-background-color))",
          borderColor: forAdmin
            ? undefined
            : "rgb(var(--custom-foreground-color)/0.1)",
        }}
      >
        <Calendar
        forAdmin={true}
          initialFocus
          mode="range"
          selected={value}
          onSelect={(range: DateRange | undefined) => {
            onChange(range ?? { from: undefined, to: undefined });
          }}
          numberOfMonths={1}
          locale={fr}
          disabled={disabledDaysFormatted}
        />
      </PopoverContent>
    </Popover>
  );
}
