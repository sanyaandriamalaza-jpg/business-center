'use client'

import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Calendar, ChevronDown, ChevronUp, Clock, Search, Users } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { AdvancedFilterComponent } from './AdvancedFilterComponent';

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

const capacities = [
  "1 personne",
  "2 personnes",
  "4 personnes",
  "6 personnes",
  "8 personnes",
  "10 + personnes",
]


export default function FilterComponent() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div>

      <div className="bg-white rounded-lg shadow p-5 mb-8">
        <div className="relative mb-6">
          <Search
            className="absolute left-3 inset-y-0 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Rechercher par nom ou emplacement..."
            type="search"
            className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cInputSearch"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <input type="date" className="pl-10 pr-4 h-[42px] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full border border-[#e4e4e4]" value="" />
          </div>
          <div className="relative w-full ">
            <Clock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Select>
              <SelectTrigger className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cSelectTrigger">
                <SelectValue placeholder="Heure de début"  />
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
          <div className="relative w-full ">
            <Clock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Select>
              <SelectTrigger className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <SelectValue placeholder="Heure de fin" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Heure de fin</SelectLabel>
                  {heures.map((heure) => (
                    <SelectItem key={heure} value={heure}>
                      {heure}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full ">
            <Users
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Select>
              <SelectTrigger className="pl-10 pr-4 py-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <SelectValue placeholder="Capacité" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Capacité</SelectLabel>
                  {capacities.map((capacitie) => (
                    <SelectItem key={capacitie} value={capacitie}>
                      {capacitie}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 font-medium cursor-pointer select-none">
          <Button variant="ghost" onClick={() => setShowAdvanced((prev) => !prev)} className="flex items-center gap-2 text-indigo-600 hover:bg-transparent hover:text-indigo-800">
            Filtres Avancés
            <span className="ml-1">
              <ChevronUp className={cn(showAdvanced ? '':'-rotate-180', "duration-100")} />
            </span>
          </Button>
          <AdvancedFilterComponent open={showAdvanced} />
        </div>
      </div>
    </div>
  )
}
