"use client";

import { Button } from "@/src/components/ui/button";
import { Check, Edit, Plus, Trash2, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AddFormuleDialog, {
  FormuleForm,
} from "../components/forms/AddFormuleDialog";
import { Formule } from "@/src/lib/type";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useToast } from "@/src/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/components/ui/alert-dialog";
import { useAdminStore } from "@/src/store/useAdminStore";

export default function AddressOfferWrapper() {
  const [planOpen, setPlanOpen] = useState(false);
  const [editingFormule, setEditingFormule] = useState<Formule | undefined>();
  const [formules, setFormules] = useState<Formule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const adminCompany = useAdminStore((state) => state.adminCompany);

  const companyId = adminCompany?.id;

  const fetchAllFormules = useCallback(async () => {
    try {
      const response = await fetch("/api/virtual-office-offer");
      const data = await response.json();
      if (data.success) {
        setFormules(data.data);
      }
    } catch (error) {
      console.error("Error fetching formules:", error);
      toast.toast({
        title: "Error",
        description: "Erreur lors de la récupération des formules.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFormules();
  }, [fetchAllFormules]);

  const handleCreateFormule = async (formData: FormuleForm) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/virtual-office-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          features: formData.features,
          price: parseFloat(formData.price),
          is_tagged: formData.is_tagged || false,
          tag: formData.tag || null,
          id_company: companyId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newFormule = {
          id: result.insertedId,
          ...formData,
          monthlyPrice: parseFloat(formData.price),
        };

        setFormules((prev) => [...prev, newFormule]);

        toast.toast({
          title: "Succès",
          description: "La nouvelle formule a été créée avec succès.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.toast({
        title: "Error",
        description: "Erreur lors de la création de la formule.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdate = async (updatedFormule: Formule) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/virtual-office-offer/${updatedFormule.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: updatedFormule.name,
            description: updatedFormule.description,
            features: updatedFormule.features,
            price: updatedFormule.monthlyPrice,
            is_tagged: updatedFormule.isTagged,
            tag: updatedFormule.tag,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setFormules((prev) =>
          prev.map((formule) =>
            formule.id === updatedFormule.id
              ? { ...formule, ...updatedFormule }
              : formule
          )
        );

        setEditingFormule(undefined);

        toast.toast({
          title: "Succès",
          description: "Formule mis à jour avec succès.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.toast({
        title: "Error",
        description: "Erreur lors de la mise à jour de la formule."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFormule = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/virtual-office-offer/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        toast.toast({
          title: "Error",
          description: "Erreur lors de la suppression de la formule.",
        });
        return;
      }

      toast.toast({
        title: "Succès",
        description: "Formule supprimée avec succès."
      });
      setFormules((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Erreur suppression :", error);
      alert("Erreur interne lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = async (id: string) => {
    const formule = formules.find((f) => f.id === id);

    setEditingFormule(formule);
    setPlanOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="w-8 h-8 text-cDefaultPrimary-100 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between sm:flex-row sm:justify-between gap-2 mb-16">
        <div>
          <h1 className="text-xl xl:text-2xl font-bold text-cDefaultSecondary-100 order-2">
            Offres de Domiciliation
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Choisis la formule de domiciliation adapter à vos besoins.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => setPlanOpen(true)}
          className="bg-cDefaultPrimary-100 hover:bg-cPrimaryHover hover:text-white text-white font-medium px-6 "
        >
          <Plus className="w-5 h-5" /> Créer Formule
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {formules.map((formule) => (
          <Card
            key={formule.id}
            className={`${formule.isTagged ? "border-2 border-cDefaultPrimary-100" : "border border-gray-100"} relative lg:px-8`}
          >
            <CardHeader>
              <div className="lg:flex justify-between items-start">
                <div className="flex items-center justify-between lg:justify-normal lg:gap-3">
                  <CardTitle className="font-bold text-xl text-cDefaultSecondary-100 mt-2">
                    {formule.name}
                  </CardTitle>
                  {formule.isTagged && (
                    <Badge
                      variant={null}
                      className="text-xs font-medium bg-cDefaultPrimary-100 text-white w-fit p-1 rounded-xl"
                    >
                      {formule.tag}
                    </Badge>
                  )}
                </div>
                <div className="text-center mt-2 lg:mt-0">
                  <span className="text-3xl font-bold text-cDefaultPrimary-100">
                    {formule.monthlyPrice}€
                  </span>
                  <span className="text-neutral-500 text-sm">/mois</span>
                </div>
              </div>
              <CardDescription className=" text-sm text-cDefaultSecondary-100 mt-2">
                {formule.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-cDefaultSecondary-100">
                  Fonctionnalités incluses:
                </h4>
                <ul className="space-y-1 mt-4">
                  {formule.features?.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-neutral-500"
                    >
                      <Check className="w-4 h-4 text-cDefaultPrimary-100 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute right-4 md:right-8 bottom-2 grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(formule.id as string)}
                  className="bg-cDefaultSecondary-100 hover:bg-cDefaultSecondary-200 hover:text-white text-white font-medium px-6"
                >
                  <Edit className="w-4 h-4" />
                  Editer
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700 hover:text-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirmer la suppression
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer l'offre{" "}
                        <span className="font-semibold">{formule.name}</span> ?{" "}
                        <br />
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteFormule(formule.id as string)}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Oui, supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>
      {formules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 text-lg">
            Aucune formule créée pour le moment
          </p>
          <Button
            variant="ghost"
            onClick={() => setPlanOpen(true)}
            className="bg-cDefaultSecondary-100 hover:bg-cDefaultSecondary-200 hover:text-white text-white font-medium px-6"
          >
            Créer votre première formule
          </Button>
        </div>
      )}

      {editingFormule ? (
        <AddFormuleDialog
          open={planOpen}
          setOpen={setPlanOpen}
          onCreate={handleCreateFormule}
          editingFormule={editingFormule}
          onUpdate={onUpdate}
        />
      ) : (
        <AddFormuleDialog
          open={planOpen}
          setOpen={setPlanOpen}
          onCreate={handleCreateFormule}
        />
      )}
    </div>
  );
}
