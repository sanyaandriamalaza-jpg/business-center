"use client";

import { Card } from "@/src/components/ui/card";
import { Plus, Building2, Clock, Euro, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Domiciliation, VirtualOfficeData } from "@/src/lib/type";
import PartialLoading from "@/src/components/global/PartialLoading";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useAdminStore } from "@/src/store/useAdminStore";
import dynamic from 'next/dynamic';
import { apiUrl } from "@/src/lib/utils";

// Chargez VirtualOfficeLists en dynamique avec SSR désactivé
const VirtualOfficeLists = dynamic(
  () => import("./domiciliations/VirtualOfficeLists"),
  { 
    ssr: false,
    loading: () => <PartialLoading />
  }
);

export default function DomiciliationPage() {
  const [search, setSearch] = useState("");
  const [companiesData, setCompaniesData] = useState<VirtualOfficeData[]>([]);
  const [loadingOffersList, setLoadingOffersList] = useState<boolean>(true);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    totalRevenue: 0,
    actions: 0,
  });
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const setAdminCompany = useAdminStore((state) => state.setAdminCompany);
  const adminCompany = useAdminStore((state) => state.adminCompany);
  const adminCompanySlud = adminCompany?.slug;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirection si non authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchVirtualOffices = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/virtual-office`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const virtualOffices = result.data;
        const officeLists = virtualOffices.filter((i: any) => i.status !== "canceled");
        setCompaniesData(officeLists);
        
        const active = virtualOffices.filter((i: any) => i.status === "confirmed").length;
        const pending = virtualOffices.reduce((acc: number, i: any) => acc + (i.userFiles?.stats?.pending || 0), 0);
        const revenue = virtualOffices
          .filter((i: any) => i.status === "confirmed")
          .reduce((acc: number, i: any) => acc + (parseFloat(i.amount) || 0), 0);
        const totalRevenue = Math.round(revenue * 100) / 100;
        const actions = virtualOffices.reduce(
          (acc: number, i: any) =>
            acc +
            (i.contractFiles?.filter(
              (file: any) => !file.isContractSignedByAdmin && file.isContractSignedByUser
            ).length || 0),
          0
        );

        setStats({ active, pending, totalRevenue, actions });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des addresses virtuels :", error);
    } finally {
      setLoadingOffersList(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isClient) {
      fetchVirtualOffices();
    }
  }, [status, isClient]);

  // Afficher un loading pendant le chargement initial
  if (!isClient || status === "loading") {
    return <PartialLoading />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const filtered = companiesData.filter((c) => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return true;
    return (
      c.company.companyName?.toLowerCase().includes(searchValue) ||
      c.company.siret?.includes(searchValue)
    );
  });

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between sm:flex-row sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl xl:text-2xl font-bold text-cDefaultSecondary-100 order-2">
            Gestion des Domiciliations
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gérez les contrats de domiciliation et les documents associés
          </p>
        </div>
      </div>
      
      {/* Statistiques Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-4 bg-white flex gap-3">
          <div className="bg-green-100 p-2 h-10 rounded-lg text-green-600">
            <Building2 />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1">
              Domiciliations actives
            </h2>
            <p className="text-xl font-medium text-gray-900">{stats.active}</p>
          </div>
        </Card>
        
        <Card className="p-4 bg-white flex gap-3">
          <div className="bg-amber-100 p-2 h-10 rounded-lg text-amber-600">
            <Clock />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1">
              En attente
            </h2>
            <p className="text-xl font-medium text-gray-900">{stats.pending}</p>
          </div>
        </Card>
        
        <Card className="p-4 bg-white flex gap-3">
          <div className="bg-purple-100 p-2 h-10 rounded-lg text-purple-600">
            <Euro />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1">
              Revenus mensuels
            </h2>
            <p className="text-xl font-medium text-gray-900">
              {stats.totalRevenue}€
            </p>
          </div>
        </Card>
        
        <Card className="p-4 bg-white flex gap-3">
          <div className="bg-red-100 p-2 h-10 rounded-lg text-red-600">
            <TriangleAlert />
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-600 mb-1">
              Actions requises
            </h2>
            <p className="text-xl font-medium text-gray-900">{stats.actions}</p>
          </div>
        </Card>
      </div>

      {loadingOffersList ? (
        <PartialLoading />
      ) : (
        filtered && (
          <VirtualOfficeLists
            data={filtered}
            onReloadData={() => fetchVirtualOffices()}
          />
        )
      )}
    </div>
  );
}