"use client";

import { Center } from "@/src/lib/type";
import React, { useState } from "react";
import {
  Building2,
  Users,
  FileText,
  Euro,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Line } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const centers: Center[] = [
  {
    id: 1,
    name: "Centre Paris Opéra",
    clients: 150,
    activeContracts: 80,
    revenue: 55000,
    alerts: ["Baisse d’occupation sur 2 salles"],
  },
  {
    id: 2,
    name: "Centre Lyon Part-Dieu",
    clients: 90,
    activeContracts: 65,
    revenue: 37000,
    alerts: [],
  },
  {
    id: 3,
    name: "Centre Bordeaux Bastide",
    clients: 120,
    activeContracts: 72,
    revenue: 42000,
    alerts: ["Incident technique ascenseur"],
  },
];

const totalClients = centers.reduce((acc, c) => acc + c.clients, 0);
const totalContracts = centers.reduce((acc, c) => acc + c.activeContracts, 0);
const totalRevenue = centers.reduce((acc, c) => acc + c.revenue, 0);
const totalCentres = centers.length;
const allAlerts = centers.flatMap((c) =>
  c.alerts.length
    ? c.alerts.map((alert) => ({
        center: c.name,
        message: alert,
      }))
    : []
);

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e42", "#e11d48", "#a21caf"];

export default function SuperAdminDashboard() {
  const [selectedStat, setSelectedStat] = useState("clients");

  const chartLabels = centers.map((c) => c.name);
  const chartValues =
    selectedStat === "clients"
      ? centers.map((c) => c.clients)
      : selectedStat === "contracts"
      ? centers.map((c) => c.activeContracts)
      : centers.map((c) => c.revenue);

  const chartTitle =
    selectedStat === "clients"
      ? "Nombre de clients"
      : selectedStat === "contracts"
      ? "Contrats actifs"
      : "Chiffre d'affaires (€)";

  const doughnutData = {
    labels: chartLabels,
    datasets: [
      {
        label: chartTitle,
        data: chartValues,
        backgroundColor: CHART_COLORS.slice(0, chartLabels.length),
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.label || "";
            if (label) label += ": ";
            if (selectedStat === "revenue") {
              label += context.parsed.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              });
            } else {
              label += context.parsed;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className=" px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord Super Admin
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d’ensemble sur tous les centres enregistrés et comparaison des
          performances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 ">
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-amber-100 p-2 h-10 rounded-lg text-amber-600">
            <Building2 />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">
              Centres enregistrés
            </h2>
            <p className="text-xl font-medium text-gray-900">{totalCentres}</p>
          </div>
        </Card>
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-green-100 p-2 h-10 rounded-lg text-green-600">
            <Users />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">Clients</h2>
            <p className="text-xl font-medium text-gray-900">{totalClients}</p>
          </div>
        </Card>
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-amber-100 p-2 h-10 rounded-lg text-amber-600">
            <FileText />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">
              Contrats actifs
            </h2>
            <p className="text-xl font-medium text-gray-900">
              {totalContracts}
            </p>
          </div>
        </Card>
        <Card className="p-4 bg-white flex gap-3 ">
          <div className="bg-purple-100 p-2 h-10 rounded-lg text-purple-600">
            <Euro />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1 ">
              Chiffre d'affaires
            </h2>
            <p className="text-xl font-medium text-gray-900">
              {totalRevenue.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </div>
        </Card>
      </div>
      
{/* 
      <div className="grid md:grid-flow-col md:grid-rows-2 gap-6 mb-8">
        <Card className="row-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Comparaison des centres</CardTitle>
              <Tabs value={selectedStat} onValueChange={setSelectedStat}>
                <TabsList>
                  <TabsTrigger
                    value="clients"
                    onClick={() => setSelectedStat("clients")}
                    aria-selected={selectedStat === "clients"}
                  >
                    Clients
                  </TabsTrigger>
                  <TabsTrigger
                    value="contracts"
                    onClick={() => setSelectedStat("contracts")}
                    aria-selected={selectedStat === "contracts"}
                  >
                    Contrats
                  </TabsTrigger>
                  <TabsTrigger
                    value="revenue"
                    onClick={() => setSelectedStat("revenue")}
                    aria-selected={selectedStat === "revenue"}
                  >
                    CA
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-1 flex justify-center">
              <div style={{ width: 460, maxWidth: "100%" }}>
                <Doughnut
                  data={doughnutData}
                  options={doughnutOptions as any}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center gap-3">
            <Building2 className="text-indigo-500" />
            <CardTitle>Activité consolidée</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full mt-2 text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Centre</th>
                  <th className="text-right py-1">Clients</th>
                  <th className="text-right py-1">Contrats</th>
                  <th className="text-right py-1">CA</th>
                </tr>
              </thead>
              <tbody>
                {centers.map((c) => (
                  <tr key={c.id} className="border-b last:border-none">
                    <td className="py-1">{c.name}</td>
                    <td className="py-1 text-right">{c.clients}</td>
                    <td className="py-1 text-right">{c.activeContracts}</td>
                    <td className="py-1 text-right">
                      {c.revenue.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex flex-row gap-3">
              <AlertTriangle className="text-red-500" />
              Alertes critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allAlerts.length === 0 ? (
              <div className="text-green-600">
                Aucune alerte critique en cours.
              </div>
            ) : (
              <ul className="space-y-3">
                {allAlerts.map((alert, i) => (
                  <li key={i} className="flex items-center gap-2 text-red-600">
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      {alert.center} :
                    </span>
                    <span className="text-xs">{alert.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
