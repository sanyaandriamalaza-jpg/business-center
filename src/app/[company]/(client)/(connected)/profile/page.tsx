"use client";
import React, { useState } from "react";

type ClientInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

type CompanyInfo = {
  companyName: string;
  siret?: string;
  address?: string;
};

type NotificationPrefs = {
  email: boolean;
  sms: boolean;
};

const initialClient: ClientInfo = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean.dupont@email.com",
  phone: "06 12 34 56 78",
};

const initialCompany: CompanyInfo = {
  companyName: "Dupont SARL",
  siret: "123 456 789 00012",
  address: "123 Avenue des Affaires, Paris, 75001",
};

const initialPrefs: NotificationPrefs = {
  email: true,
  sms: false,
};

export default function ProfilPage() {
  const [client, setClient] = useState<ClientInfo>(initialClient);
  const [company, setCompany] = useState<CompanyInfo | null>(initialCompany);
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);
  const [showCompany, setShowCompany] = useState(!!initialCompany);

  // changements de champs
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!company) return;
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  const handlePrefsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPrefs({ ...prefs, [name]: checked });
  };

  // affichage entreprise
  const handleToggleCompany = () => {
    setShowCompany(!showCompany);
    if (!showCompany) setCompany({ companyName: "" });
    else setCompany(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profil mis à jour !");
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Paramètres du profil</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Infos client */}
        <section className="rounded-lg shadow-md bg-white p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                name="firstName"
                value={client.firstName}
                onChange={handleClientChange}
                className="mt-1 block w-full p-2 rounded bg-transparent border-b border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                name="lastName"
                value={client.lastName}
                onChange={handleClientChange}
                className="mt-1 block w-full rounded bg-transparent border-b p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse email</label>
              <input
                name="email"
                type="email"
                value={client.email}
                onChange={handleClientChange}
                className="mt-1 block w-full rounded bg-transparent border-b p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                name="phone"
                value={client.phone || ""}
                onChange={handleClientChange}
                className="mt-1 block w-full rounded bg-transparent border-b p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                autoComplete="tel"
              />
            </div>
          </div>
        </section>

        {/* Infos entreprise */}
        <section className="rounded-lg shadow-md bg-white p-6">
          <div className="flex items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900 mr-3">Entreprise</h2>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showCompany}
                onChange={handleToggleCompany}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
              />
              <span>Associer une entreprise</span>
            </label>
          </div>
          {showCompany && company && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Raison sociale</label>
                <input
                  name="companyName"
                  value={company.companyName}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full rounded bg-transparent border-b p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SIRET</label>
                <input
                  name="siret"
                  value={company.siret || ""}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full rounded bg-transparent border-b p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  name="address"
                  value={company.address || ""}
                  onChange={handleCompanyChange}
                  className="mt-1 block w-full rounded bg-transparent border-b p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </section>

        {/* Préférences de notification */}
        <section className="rounded-lg shadow-md bg-white p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Préférences de notification</h2>
          <div className="flex gap-10">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                name="email"
                checked={prefs.email}
                onChange={handlePrefsChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
              />
              <span>Recevoir les notifications par email</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                name="sms"
                checked={prefs.sms}
                onChange={handlePrefsChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
              />
              <span>Recevoir les notifications par SMS</span>
            </label>
          </div>
        </section>

        <div className="text-right">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}