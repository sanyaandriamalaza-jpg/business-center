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
  const breadcrumbItems = pathname
    .split("/")
    .filter(Boolean)
    .map((path, index, arr) => ({
      label: translateLabel(formatLabel(path)),
      href: `/${arr.slice(0, index + 1).join("/")}`,
    }))
    .slice(1);

  if (breadcrumbItems.length < 1) return null;

  return (
    <>
      {breadcrumbItems.length > 1 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, i) => (
              <React.Fragment key={item.href}>
                {i !== 0 && <BreadcrumbSeparator className="text-cStandard"/>}
                <BreadcrumbItem className="text-cStandard hover:text-cDefaultPrimary-100">
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </>
  );
}

const translateLabel = (label: string): string => {
  const translations: Record<string, string> = {
    Dashboard: "Tableau de bord",
    "Company Domiciliation": "Domiciliation",
    "Scanned Letters": "Courriers scannés",
    "General Parameters": "Paramètres généraux",
    "Contractual Info": "Informations contractuelles",
    Billing: "Facturations",
  };
  return translations[label] || label;
};

function formatLabel(path: string): string {
  return path
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
