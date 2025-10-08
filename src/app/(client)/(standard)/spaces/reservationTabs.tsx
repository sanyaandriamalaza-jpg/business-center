"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import PaymentStep from "./[id]/payementEtape";
import ConfirmationStep from "./[id]/confirmationEtape";

function getDuration(start: string, end: string) {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

const heures = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const steps = [
  { label: "1.Sélectionner la date et l'heure" },
  { label: "2.Paiement" },
  { label: "3.Confirmation" },
];

export default function ReservationTabs() {
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  const availableEndHours = useMemo(() => {
    const idx = heures.indexOf(startTime);
    return idx >= 0 ? heures.slice(idx + 1) : heures;
  }, [startTime, heures]);

  // Tarif horaire
  const tarifHoraire = 35;

  // Calcul résumé
  const duration = useMemo(
    () => getDuration(startTime, endTime),
    [startTime, endTime]
  );
  const total = duration > 0 ? duration * tarifHoraire : 0;

  return (
    <div className="w-full mx-auto mb-8">
      <Card className="rounded-lg overflow-hidden shadow-md">
        <CardHeader className="bg-indigo-900 text-white px-6 py-4 text-lg font-bold">
          Réserver cet espace
        </CardHeader>
        <div className="flex mb-8 ">
          {steps.map((s, i) => (
            <div key={i} className="w-full flex items-center  border-b border-gray-200">
              <span
                className={cn(
                  "font-medium px-8 w-full flex-1 text-center text-sm py-2",
                  i === step ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 "
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <CardContent className="p-8">
            <div className="mb-6">
              <label className="block font-semibold mb-2">Date</label>
              <div className="flex items-center">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger
                    asChild
                    className="focus:ring-indigo-500 focus:border-transparent"
                  >
                    <div className="w-full flex items-center pl-5 rounded-md gap-1 border border-gray-300 py-2 cursor-pointer hover:border-indigo-500">
                      <CalendarIcon
                        size={20}
                        className="mr-2 text-gray-600"
                      />
                      <span className="text-gray-600">
                         { selectedDate
                          ? format(selectedDate, "EEE d MMM yyyy", {
                              locale: fr,
                            })
                          : "Selectionnez une date"}
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                      locale={fr}
                      fromDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block font-semibold mb-2">
                  Heure de début
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Clock size={20} />
                  </span>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300">
                      <SelectValue placeholder="Selectionnez l'heure de début" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Heure de début</SelectLabel>
                        {heures.map((heure) => (
                          <SelectItem key={heure} value={heure}>
                            {heure}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-2">Heure de fin</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                    <Clock size={20} />
                  </span>
                  <Select
                    value={endTime}
                    onValueChange={setEndTime}
                    disabled={!startTime}
                  >
                    <SelectTrigger className="pl-10 pr-4 py-5 text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300 cursor-default">
                      <SelectValue placeholder="Selectionnez l'heure de fin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Heure de fin</SelectLabel>
                        {availableEndHours.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {/* Résumé de la réservation */}
            {selectedDate && startTime && endTime && duration > 0 && (
              <div className="mt-8">
                <Card className="bg-indigo-50 border-0">
                  <CardContent className="py-6 px-6 flex flex-col md:flex-row md:justify-between">
                    <div>
                      <div className="font-bold mb-2 py-4 text-gray-900">
                        Résumé de la réservation
                      </div>
                      <div className="text-gray-600">Date</div>
                      <div className="text-gray-600">Horaires</div>
                      <div className="text-gray-600">Durée</div>
                      <div className="text-gray-600">Tarif</div>
                      <hr className="my-3" />
                      <div className="font-bold">Total</div>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                      <div className="mb-2">&nbsp;</div>
                      <div>
                        {selectedDate
                          ? format(selectedDate, "EEE d MMM yyyy", {
                              locale: fr,
                            })
                          : ""}
                      </div>
                      <div>
                        {startTime} - {endTime}
                      </div>
                      <div>
                        {duration} {duration > 1 ? "heures" : "heure"}
                      </div>
                      <div>{tarifHoraire}€/heure</div>
                      <hr className="my-3" />
                      <div className="font-bold text-indigo-700">{total}€</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div className="flex justify-end mt-8">
              <Button
              variant="ghost"
                onClick={() => setStep(1)}
                className={`${isDisabled ? "bg-indigo-100" : "bg-indigo-800"} text-gray-500  px-6 py-3 rounded-lg font-semibold`}
                disabled={!(selectedDate && startTime && endTime && isDisabled)}
              >
                Continuer vers le paiement
              </Button>
            </div>
          </CardContent>
        )}
        {step === 1 && (
          <CardContent className="p-8">
            <PaymentStep step={step} setStep={setStep}/>
          </CardContent>
        )}
        {step === 2 && (
          <CardContent className="p-8">
            <ConfirmationStep step={step} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
