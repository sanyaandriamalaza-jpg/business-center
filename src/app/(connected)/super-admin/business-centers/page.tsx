"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Centre, Company } from "@/src/lib/type";
import CentreDialog, {
  CentreStepperForm,
} from "../components/centre-management/CentreDialog";
import CentresList from "../components/centre-management/CentreList";
import { useToast } from "@/src/hooks/use-toast";
import CompanyList from "../components/CompanyList";

const demoCentres: Centre[] = [
  {
    id: 1,
    name: "Centre Paris Opéra",
    address: "12 rue de la Paix, Paris",
    admin: {
      name: "Alice Martin",
      email: "alice@paris-centre.com",
    },
    features: {
      reservation: true,
      plan: true,
      domiciliation: true,
      mail: true,
      digicode: false,
      scan: false,
      signature: true,
    },
  },
  {
    id: 2,
    name: "Centre Paris Opéra",
    address: "12 rue de la Paix, Paris",
    admin: {
      name: "Alice Martin",
      email: "alice@paris-centre.com",
    },
    features: {
      reservation: true,
      plan: true,
      domiciliation: false,
      mail: true,
      digicode: false,
      scan: false,
      signature: true,
    },
  },
  {
    id: 3,
    name: "Centre Paris Opéra",
    address: "12 rue de la Paix, Paris",
    admin: {
      name: "Alice Martin",
      email: "alice@paris-centre.com",
    },
    features: {
      reservation: true,
      plan: true,
      domiciliation: false,
      mail: true,
      digicode: false,
      scan: false,
      signature: true,
    },
  },
];




export default function SuperAdminBusinessCenters() {
  const [centres, setCentres] = useState<Centre[]>(demoCentres);
  const [companyList, setCompanyList] = useState<Company[]>([])
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast()

  const fetchCompanies = useCallback(async () => {
    const res = await fetch(`/api/company`, {
      method: "GET"
    })
    const data = await res.json()
    if (data.success) {
      setCompanyList(data.data)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])


  const handleCreateCentre = async (form: CentreStepperForm) => {
    const { name, description, adminName, adminFirstName, adminEmail, adminPassword, features } = form;

    // CREATE COMPANY
    try {
      const res = await fetch(`/api/company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          description: description ?? null,
          reservation_is_active: features.reservation,
          manage_plan_is_active: features.plan,
          virtual_office_is_active: features.domiciliation,
          post_mail_management_is_active: features.mail,
          digicode_is_active: features.digicode,
          mail_scanning_is_active: features.scan,
          electronic_signature_is_active: features.signature,
          id_color_theme: 1
        })
      })

      const data = await res.json()
      if (data.success) {
        const companyId = Number(data.insertedId);
        if (!isNaN(companyId)) {
          const res = await fetch(`/api/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: adminName,
              first_name: adminFirstName,
              email: adminEmail,
              password: adminPassword,
              typeOfUser: "admin_user",
              id_company: companyId
            })
          })
          const data = await res.json()

          toast({
            title: data.success ? "Succès" : "Erreur",
            description: data.message,
            variant: data.success ? "success" : "destructive"
          })
        }
      } else {
        toast({
          title: "Erreur",
          description: data.message,
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      })
    } finally {
      setDialogOpen(false);
      fetchCompanies()
    }
  };

  return (
    <div className="mx-auto mt-10 space-y-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Liste des centres d‘affaires
        </h1>
        <Button
          variant="ghost"
          className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white transition-colors"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Nouvel entreprise
        </Button>
      </div>
      <CompanyList data={companyList} />
      {/* <CentresList centres={centres} /> */}
      <CentreDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onCreate={handleCreateCentre}
      />
    </div>
  );
}
