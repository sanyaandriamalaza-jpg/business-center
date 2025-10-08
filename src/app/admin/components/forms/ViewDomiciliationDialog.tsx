"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";

type DomiciliationType = {
  entreprise: {
    name: string;
    siret: string;
    since: string;
    address: string;
  };
  representant: {
    name: string;
    role: string;
    email: string;
  };
  plan: { label: string; color: string; price: string };
  statut: { value: string; color: string; icon: JSX.Element };
  docs: { label: string; color: string }[];
  warnings: { label: string; icon: JSX.Element }[];
  id: number;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  domiciliation: DomiciliationType | null;
};

export function ViewDomiciliationDialog({
  open,
  onOpenChange,
  domiciliation,
}: Props) {
  if (!domiciliation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-indigo-900 font-semibold text-center">
            Détails de la domiciliation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2 ">
          <div className="py-2 border-b">
            <h2 className=" text-gray-900 text-medium mb-1">Entreprise :</h2>
            <div className="font-semibold text-sm text-gray-600">
              {domiciliation.entreprise.name}
            </div>
            <div className="text-xs text-muted-foreground">
              SIRET : {domiciliation.entreprise.siret}
            </div>
            <div className="text-xs text-muted-foreground">
              Adresse : {domiciliation.entreprise.address}
            </div>
            <div className="text-xs text-muted-foreground">
              Depuis le {domiciliation.entreprise.since}
            </div>
          </div>
          <div className="py-2 border-b md:flex-row gap-3">
            <h2 className="text-gray-900 text-medium mb-1">Représentant :</h2>

            <div className="font-semibold text-sm text-gray-600">
              {domiciliation.representant.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {domiciliation.representant.role}
            </div>
            <div className="text-xs text-muted-foreground">
              {domiciliation.representant.email}
            </div>
          </div>
          <div className="py-2 border-b flex md:flex-row gap-3">
            <h2 className="text-gray-900 text-medium mb-1">Plan :</h2>
            <span
              className={`${domiciliation.plan.color} font-medium text-xs px-3 py-1 rounded-full`}
            >
              {domiciliation.plan.label}
            </span>
            <span className="text-xs text-gray-600 font-medium ml-2 mt-1 ">
              {domiciliation.plan.price}
            </span>
          </div>
          <div className="py-2 border-b flex md:flex-row gap-3">
            <h2 className="text-gray-900 text-medium mb-1">Documents :</h2>
            <div className="flex gap-2 flex-wrap">
              {domiciliation.docs.map((d) => (
                <span
                  key={d.label}
                  className={`font-medium text-xs px-3 py-1 rounded-full ${d.color}`}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
          <div className="py-2 border-b flex md:flex-row gap-3">
            <h2 className="text-gray-900 text-medium mb-1">Statut :</h2>
            <div>
              <span
                className={`${domiciliation.statut.color} inline-flex text-xs items-center gap-1 font-medium px-3 py-1 rounded-full`}
              >
                {domiciliation.statut.icon}
                {domiciliation.statut.value}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            className="text-white bg-indigo-400 hover:bg-indigo-500"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
