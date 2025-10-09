'use client';

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Save } from "lucide-react";
import React, { useState } from "react";

export default function Parametrepage() {
    const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  return (
    <div className="py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paremètres</h1>
        <Button
          variant="ghost"
          className="bg-indigo-600 hover:bg-indigo-700 hover:text-white text-white font-medium px-6 "
        >
          <Save className="w-5 h-5" /> Enregistrer
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-md font-bold text-gray-900 mb-2">
          Paremètres Généreaux
        </h1>
        <div className="w-full mb-2">
          <span className="text-sm text-gray-800">Nom du centre d'affaire</span>
          <Input placeholder="FlexSpace" />
        </div>
        <div className="w-full mb-2">
          <span className="text-sm text-gray-800">Email de contact</span>
          <Input placeholder="contact@flexispace.com" />
        </div>
        <div className="w-full mb-2">
          <span className="text-sm text-gray-800">Telephone</span>
          <Input placeholder="+33 1 23 45 67 89" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-md font-bold text-gray-900 mb-2">
          Réservations
        </h1>
        <div className="w-full mb-2">
          <span className="text-sm text-gray-800">Délai minimum de réservation (heures)</span>
          <Input placeholder="1" />
        </div>
        <div className="w-full mb-2">
          <span className="text-sm text-gray-800">Délai d'annulation gratuite (heures)</span>
          <Input placeholder="24" />
        </div>
        <div className="w-full mb-2">
          <input type="checkbox" />
          <span className=" text-gray-800 text-xs ml-2">Confirmation automatique des réservations</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 ">
      <h1 className="text-md font-bold text-gray-900 mb-2">
          Notifications
        </h1>
        <div className="w-full mb-2 flex justify-between ">
            <div>
            <h3 className="text-sm text-gray-800">Notifications par email</h3>
            <span className="text-xs text-gray-600">Recevoir les notifications de nouvelles réservations par email</span>
            </div>
            <label className="ml-4 inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={() => setEmailEnabled((v) => !v)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 transition-all duration-200 relative">
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-200 rounded-full shadow transition-all duration-200 ${
                  emailEnabled ? "translate-x-5" : ""
                }`}
              />
            </div>
          </label>
        </div>
        <div className="w-full mb-2 flex justify-between">
            <div>
            <h3 className="text-sm text-gray-800">Notifications SMS</h3>
            <span className="text-xs text-gray-600">Recevoir les notifications de nouvelles réservations par SMS</span>
            </div>
            <label className="ml-4 inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={() => setSmsEnabled((v) => !v)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 transition-all duration-200 relative">
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-200 rounded-full shadow transition-all duration-200 ${
                  smsEnabled ? "translate-x-5" : ""
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
