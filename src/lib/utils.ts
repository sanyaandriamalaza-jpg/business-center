// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

import {
  Wifi,
  Projector,
  Printer,
  Coffee,
  AirVent,
  Presentation,
  Utensils,
  SquareParking,
} from "lucide-react";
import { BusinessHour, DayName, Equipment, InvoiceDataFormat } from "./type";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

export function cn(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(" ");
}


export const baseUrl = process.env.NODE_ENV === "production" ? `${process.env.NEXT_PUBLIC_URL}` : `${process.env.NEXT_PUBLIC_URL_DEV}`

export const apiUrl = process.env.NODE_ENV === "production" ? `${process.env.NEXT_PUBLIC_URL}` : `${process.env.NEXT_PUBLIC_API_URL_DEV}`

export const allEquipments: Equipment[] = [
  { value: "wifi", label: "Wi-Fi", icon: Wifi },
  { value: "impression", label: "Service d‘impression", icon: Printer },
  { value: "videoprojecteur", label: "Vidéoprojecteur", icon: Projector },
  { value: "climatisation", label: "Climatisation", icon: AirVent },
  { value: "tableau-blanc", label: "Tableau blanc", icon: Presentation },
  { value: "restauration", label: "Restauration", icon: Utensils },
  { value: "machine-a-cafe", label: "Machine à café", icon: Coffee },
  { value: "parking", label: "Parking", icon: SquareParking }
];

export const spaceTypes = [
    { label: "Bureau privé", value: "privateOffice" },
    { label: "Salle de Réunion", value: "meetingRoom" },
    { label: "Espace Coworking", value: "coworkingSpace" },
];

export const dayNameFrMap: Record<DayName, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};


function rgbToHex(rgb: string): string {
  let r: string, g: string, b: string;

  // Cas classique : rgb(34, 38, 44)
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    [, r, g, b] = match;
  } else {
    // Cas sans parenthèses : "34 38 44"
    const parts = rgb.split(/\s+/);
    if (parts.length >= 3) {
      [r, g, b] = parts;
    } else {
      return rgb; // Inconvertible
    }
  }

  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}
export function getCSSVariablesAsHex(keys: string[]): Record<string, string> {
  const styles = getComputedStyle(document.documentElement);

  return keys.reduce((acc, key) => {
    const raw = styles.getPropertyValue(`--${key}`).trim();

    // Si la valeur est vide, on l’ignore
    if (!raw) {
      console.warn(`Variable CSS --${key} introuvable ou vide.`);
      return acc;
    }

    acc[key] = rgbToHex(raw);
    return acc;
  }, {} as Record<string, string>);
}

export const dayNames: (keyof BusinessHour)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const dayNameToIndex: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};



// Pour la page de facturation client


export function transformInvoiceData(
  rawInvoices: any[],
  companySlug?: string
): InvoiceDataFormat[] {
  return rawInvoices.map((invoice) => ({
    invoice: {
      id: invoice.id,
      reference: invoice.reference,
      referenceNum: invoice.referenceNum,
      issueDate: invoice.issueDate,
      serviceStartDate: invoice.startSubscription,
      duration: invoice.duration,
      durationType: invoice.durationType,
      note: invoice.note || "",
      amount: invoice.amount,
      amountNet: invoice.amountNet,
      currency: invoice.currency,
      status: invoice.status,
      subscriptionStatus: invoice.subscriptionStatus || invoice.status,
      paymentMethod: invoice.paymentMethod,
      stripePaymentId: invoice.stripePaymentId,
      isProcessed: invoice.isProcessed,
      createdAt: invoice.createdAt,
    },
    company: {
      id: invoice.office?.coworkingOffer?.idCompany || 0,
      slug: companySlug || invoice.company?.slug || "",
      name: invoice.office?.name || invoice.company?.name || "Entreprise",
      description: invoice.office?.description || "",
      legalForm: "",
      siren: "",
      siret: "",
      logoUrl: "",
      phone: "",
      email: "",
      socialLinks: null,
      address: {
        addressLine: invoice.office?.specificAddress?.addressLine || "",
        postalCode: invoice.office?.specificAddress?.postalCode || "",
        city: invoice.office?.specificAddress?.city || "",
        state: invoice.office?.specificAddress?.state || "",
        country: invoice.office?.specificAddress?.country || "",
      },
      businessHour: invoice.office?.specificBusinessHour || null,
    },
    customer: {
      id: invoice.idBasicUser,
      name: invoice.user?.name || "",
      firstName: invoice.user?.firstName || "",
      email: invoice.user?.email || "",
      phone: invoice.user?.phone || "",
      profilePictureUrl: "",
      address: {
        addressLine: invoice.user?.addressLine || "",
        city: invoice.user?.city || "",
        state: invoice.user?.state || "",
        postalCode: invoice.user?.postalCode || "",
        country: invoice.user?.country || "",
      },
      createdAt: invoice.createdAt,
    },
    service: invoice.office
      ? {
          type: "office_reservation",
          name: invoice.office.name,
          description: invoice.office.description,
        }
      : invoice.idVirtualOfficeOffer
        ? {
            type: "virtual_office",
            name: "Domiciliation virtuelle",
            description: "Service de domiciliation",
          }
        : null,
  }));
}

export   const translateStatus = (status: string) => {
    if (!status) return "Non défini";

    switch (status.toLowerCase()) {
      case "paid":
      case "payé":
        return "Payé";
      case "pending":
      case "en_attente":
        return "En attente";
      case "processing":
        return "En traitement";
      case "cancelled":
      case "annulé":
      case "canceled":
        return "Annulé";
      case "active":
      case "actif":
        return "Actif";
      case "inactive":
      case "inactif":
        return "Inactif";
      default:
        return status;
    }
  };

  export  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "payé":
          case "active":
        case "actif":
        return "bg-green-100 text-green-800";
      case "pending":
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
      case "en retard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };



export const translatePayment = (method: string) => {
  if (!method) return "Méthode inconnue";

  switch (method.toLowerCase()) {
    case "credit_card":
    case "card":
    case "carte":
      return "Paiement par carte  bancaire";

    case "paypal":
      return "PayPal";

    case "bank_transfer":
    case "transfer":
    case "virement":
      return "Virement ";

    case "cash":
    case "especes":
      return "Espèces";

    case "check":
    case "cheque":
      return "Chèque";

    case "stripe":
      return "Stripe";

    case "apple_pay":
      return "Apple Pay";

    case "google_pay":
      return "Google Pay";

    case "crypto":
    case "bitcoin":
    case "ethereum":
      return "Cryptomonnaie";


    case "other":
    case "autre":
      return "Autre";

    default:
      return method; 
  }
};


export const translateDuration = (duration: string) => {
  if (!duration) return "Non défini";

  switch (duration.toLowerCase()) {
    case "monthly":
    case "mensuel":
      return "Mensuel";
    case "yearly":
    case "annuel":
      return "Annuel";
    case "weekly":
    case "hebdomadaire":
      return "Hebdomadaire";
    case "daily":
    case "quotidien":
      return "Quotidien";
    default:
      return duration;
  }
};

