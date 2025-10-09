"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = segments.map((path, index) => ({
    label: translateLabel(formatLabel(path)),
    href: `/${segments.slice(0, index + 1).join("/")}`,
  }));

  if (breadcrumbItems.length === 0) return null;

  return (
    <Breadcrumb className="text-gray-900">
      <BreadcrumbList>
        {breadcrumbItems.map((item, i) => (
          <React.Fragment key={item.href}>
            {i !== 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const translateLabel = (label: string): string => {
  const translations: Record<string, string> = {
    Domiciliation: "Tableau de bord",
    "Courriers Scanners": "Courriers scannés",
    "General Parameters": "Paramètres généraux",
    "Contractual Info": "Informations contractuelles",
    Facturation: "Facturation",
  };
  return translations[label] || label;
};

function formatLabel(path: string): string {
  return path
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
