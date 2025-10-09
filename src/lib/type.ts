import { LucideIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

export type ServiceType = {
  icon: string | React.ReactNode;
  color?: string;
  title: string;
  description: string;
  redirect?: string | React.ReactNode;
  isSm?: 'true' | 'false';
}

export type CommentType = {
  comment: string;
  name: string;
  job: string;
}

export type Center = {
  id: number;
  name: string;
  clients: number;
  activeContracts: number;
  revenue: number;
  alerts: string[];
};

export type ProfileType = "basicUser" | "adminUser" | "superAdminUser"

export type UserDataSession = {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  firstName: string;
  profilePictureUrl?: string | null;
  profileType: ProfileType,
  companyId: number,
  companySlug: string
}

export type LogType = {
  id: number,
  description: string,
  entityType: string,
  entityId: number,
  action: string,
  roleUser: ProfileType,
  createdAt: Date,
  idSuperAdminUser?: number | null,
  idAdminUser?: number | null,
  idBasicUser?: number | null,
}

export type ColorTheme = {
  id: number,
  name: string,
  category?: string,
  backgroundColor: string,
  primaryColor: string,
  primaryColorHover: string,
  foregroundColor: string,
  standardColor: string,
  companyId?: number,
  createdAt: Date
}

export type UserTheme = {
  backgroundColor: string,
  foregroundColor: string,
}

export type Company = {
  id: number,
  name: string,
  slug: string,
  description?: string | null,
  legalForm?: string | null,
  siren?: string | null,
  siret?: string | null,
  logoUrl?: string | null,
  phone?: string | null,
  email?: string | null,
  addressLine?: string | null,
  city?: string | null,
  postalCode?: string | null,
  state?: string | null,
  country?: string | null,
  businessHour: BusinessHour,
  googleMapIframe?: string | null,
  reservationIsActive?: boolean | null,
  managePlanIsActive?: boolean | null,
  virtualOfficeIsActive?: boolean | null,
  postMailManagementIsActive?: boolean | null,
  digicodeIsActive?: boolean | null,
  mailScanningIsActive?: boolean | null,
  electronicSignatureIsActive?: boolean | null,
  tvaIsActive?: boolean,
  tva?: number | null,
  stripePrivateKey?: string,
  stripePublicKey?: string,
  stripeWebhookSecret?: string,
  isBanned?: boolean | null,
  createdAt?: Date | null,
  updatedAt?: Date | null,
  adminUserList?: AdminUser[] | null,
  theme: ColorTheme,
  documents?: Documents[]
}

export type BasicUser = {
  id: number,
  name: string,
  firstName: string,
  email: string,
  phone?: string | null,
  addressLine?: string | null,
  city?: string | null,
  state?: string | null,
  postalCode?: string | null,
  country?: string | null,
  profilePictureUrl?: string | null,
  createdAt: Date,
  updatedAt?: Date | null,
  isBanned?: boolean,
  idAdmin?: boolean,
  idCompany?: number | null
  companyName?: string | null
}
export type AdminUser = {
  id: number,
  name: string,
  firstName: string,
  email: string,
  phone?: string | null,
  profilePictureUrl?: string | null,
  createdAt: Date,
  updatedAt?: Date | null,
  isBanned?: boolean,
  idCompany: number,
  companyInfo?: Company | null,
  id_sub_role: number,
  sub_role_label: string
}
export type SuperAdminUser = {
  id: number,
  name: string,
  firstName: string,
  email: string,
  profilePictureUrl?: string | null,
  createdAt: Date,
  updatedAt?: Date | null,
  isBanned?: boolean
}



export type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DailyBusinessHour = {
  open: string | null;  // format "HH:mm", ex: "08:00"
  close: string | null; // format "HH:mm", ex: "18:00"
  isClosed?: boolean | null;   // permet de marquer un jour fermé (fermeture exceptionnelle)
};

export type BusinessHour = {
  [key in DayName]: DailyBusinessHour;
};

export type OfficeFeature = {
  value: string,
  label: string
}

export type Address = {
  addressLine?: string | null,
  postalCode?: string | null,
  city?: string | null,
  state?: string | null,
  country?: string | null,
}

export type CoworkingOfferType = "privateOffice" | "coworkingSpace" | "meetingRoom";

export type CoworkingOffer = {
  id: number,
  type: CoworkingOfferType,
  description: string,
  hourlyRate?: number | null,
  dailyRate?: number | null,
  features: string[],
  isTagged: boolean,
  tag?: string | null,
  createdAt: Date,
  updatedAt?: Date | null,
  idCompany: number,
  officeList?: Office[] | null
}

export type UnavailablePeriod = {
  from: Date;
  to: Date;
  allDay?: boolean;
};

export type Office = {
  id: number,
  name: string,
  description: string,
  features: OfficeFeature[],
  specificBusinessHour?: BusinessHour | null,
  specificAddress?: Address | null,
  maxSeatCapacity: number,
  imageUrl: string,
  createdAt: Date,
  updatedAt?: Date | null,
  idCoworkingOffer: number,
  companyAddress?: Address | null,
  coworkingOffer?: CoworkingOffer | null,
  businessHour?: BusinessHour | null,
  unavailablePeriods?: UnavailablePeriod[];
  idKonvaMap?: number | null;
  konvaMap?: KonvaMap | null;
  officeAdditionalImages?: OfficeAdditionalImage[]
}

export type OfficeAdditionalImage = {
  id: number,
  urlImage: string,
  createdAt: Date,
  updatedAt?: Date | null
}

export type RGBAColor = { r: number; g: number; b: number; a: number };
export type ShapeType = "rectangle" | "circle" | "triangle" | "arrow" | "polyline" | "polygon" | "text";
export type FormType = ShapeType | "pointer";

export type Shape =
  | {
    id: string;
    type: Exclude<ShapeType, "polyline" | "polygon" | "text">;
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: RGBAColor;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    spaceAssociated?: {
      label: string;
      isOffice: boolean;
      office?: {
        id: number;
        name: string;
      };
    };
  }
  | {
    id: string;
    type: "polyline";
    points: number[];
    strokeColor: RGBAColor;
    strokeWidth: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
  }
  | {
    id: string;
    type: "polygon";
    x: number;
    y: number;
    points: { x: number; y: number }[];
    fillColor: RGBAColor;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    spaceAssociated?: {
      label: string;
      isOffice: boolean;
      office?: {
        id: number;
        name: string;
      };
    };
  } | {
    id: string;
    type: "text";
    x: number;
    y: number;
    text: string;
    fontSize?: number;
    fillColor: RGBAColor;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    spaceAssociated?: {
      label: string;
      isOffice: boolean;
      office?: {
        id: number;
        name: string;
      };
    };
  };

export type ImageOnStage = {
  id: string;
  image: HTMLImageElement;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
};

export type KonvaMap = {
  id: number,
  name: string,
  stageWidth: number,
  stageHeight: number,
  map: {
    shapes: Shape[],
    images: ImageOnStage[]
  },
  createdAt: Date,
  updatedAt?: Date | null
}

export type PngItem = {
  src: string;
  id: string;
};

export interface User {
  id: number
  name: string
  firstName: string
  email: string
  phone?: string | null
  addressLine?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  profilePictureUrl?: string
  role?: string | null
  createdAt?: string
  updatedAt?: string
  isBanned?: boolean
  isAdmin?: boolean
  idCompany?: number | null
  companyName?: string | null
  statut?: string | null
}

export type CentreFeatureKey =
  | "reservation"
  | "plan"
  | "domiciliation"
  | "mail"
  | "digicode"
  | "scan"
  | "signature";

export interface CentreFeatures {
  reservation: boolean;
  plan: boolean;
  domiciliation: boolean;
  mail: boolean;
  digicode: boolean;
  scan: boolean;
  signature: boolean;
}

export interface CentreAdmin {
  name: string;
  email: string;
  password?: string;
}
export interface Centre {
  id: number;
  name: string;
  address: string;
  admin: CentreAdmin;
  features: CentreFeatures;
}

export type CentreCreate = Omit<Centre, "id">;

export type CentreStepperForm = {
  name: string;
  address: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  features: CentreFeatures;
};

// type pour l'ajout d'espace
export interface WorkspaceSchedule {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface WorkspacePricingPolicy {
  label: string;
  value: string;
}

export interface Workspace {
  id: number;
  name: string;
  type: "bureau" | "coworking" | "salle_reunion" | "autre";
  capacity: number;
  schedules: WorkspaceSchedule[];
  equipments: string[];
  pricing: WorkspacePricingPolicy;
}

export type Offer = {
  id: number,
  type: CoworkingOfferType,
  description: string,
  isTagged: boolean,
  tag?: string | null,
  pricing: {
    horaire: number
    journalier: number
  },
  features: string[],
  officeList?: Office[] | null
}

// Type d'une domiciliation
export interface DomiciliationRepresentative {
  lastname: string;
  firstname: string;
  email: string;
  role: string;
}

export interface DomiciliationDocument {
  name: string;
  url: string;
}

export interface Domiciliation {
  id: number;
  companyName: string;
  siret: string;
  creationDate: string;
  representative: DomiciliationRepresentative;
  plan: "premium" | "basic";
  price: number;
  status?: "actif" | "en_attente" | "annule";
  documents: DomiciliationDocument[];
}

export type DomiciliationStepperForm = {
  companyName: string;
  siret: string;
  creationDate: string;
  repLastname: string;
  repFirstname: string;
  repEmail: string;
  repRole: string;
  plan: string;
  price: string;
  documents: { name: string; url: string }[];
};


export type Equipment = {
  label: string;
  icon: React.ElementType;
  value: string
};

export type LocationTypeType = "daily" | "hourly"

export type ReservationResumeType = {
  locationType: LocationTypeType,
  dateStart?: Date,
  timeStart?: string,
  timeEnd?: string,
  dailyDateRange?: DateRange
}

export const invoiceStatusList = ["paid", "pending", "sent", "overdue", "canceled"] as const;
export type InvoiceStatus = (typeof invoiceStatusList)[number];
export const subscriptionStatusList = ["confirmed", "canceled", "pending"] as const;
export type SubscriptionStatus = (typeof subscriptionStatusList)[number];

export type DurationType = "hourly" | "daily" | "monthly" | "annualy"
export type Invoice = {
  totalAmount?: any;
  endSubscription?(endSubscription: any): any;
  companyTva : number,
  id: number,
  reference: string,
  referenceNum: number,
  user: {
    name: string,
    firstName: string,
    email: string,
    addressLine: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  issueDate: Date,
  startSubscription: Date,
  duration: number,
  durationType: DurationType,
  note: string,
  amount: number,
  amountNet?: number | null,
  currency: string,
  status: InvoiceStatus,
  subscriptionStatus: SubscriptionStatus,
  paymentMethod: "card" | "paypal",
  stripePaymentId?: string | null,
  isProcessed: boolean,
  createdAt: Date,
  updatedAt?: Date | null,
  idBasicUser: number,
  idVirtualOfficeOffer?: number | null,
  virtualOfficeOffer?: Formule | null,
  idAccessCode?: number | null,
  idOffice?: number | null,
  office?: Office | null
}

export type InvoiceUserInfo = {
  name: string,
  firstName: string,
  addressLine: string,
  city: string,
  postalCode: string,
  state: string,
  country: string,
}

export const accessCodeStatuses = ["pending", "active", "expired"] as const;

export type AccessCodeStatus = (typeof accessCodeStatuses)[number];
export type AccessCode = {
  id: number,
  code: string,
  status: AccessCodeStatus,
  startValidity: string | Date,
  endValidity: string | Date,
  createdAt?: string | Date,
  updatedAt?: string | Date | null,
  idOffice?: number | null,
  idBasicUser?: number | null,
  basicUser?: BasicUser | null,
  office?: Office | null,
  invoice?: Invoice | null,
}

export type LatestInvoiceRef = {
  referenceNum: number,
  nextReferenceNum: number,
  invoiceOfficeRef?: string | null,
  invoiceVirtualOfficeRef?: string | null,
}

export type CompanyInfoForEmail = {
  name?: string,
  phone?: string | null,
  addressLine?: string | null,
  city?: string | null,
  state?: string | null,
  postalCode?: string | null,
  country?: string | null,
}


export type NotifUserForBookingOfficeInfoData = {
  logoUrl?: string | null,
  reservationRef: string,
  firstName: string,
  reservationResume?: ReservationResumeType | null,
  officeInfo: Office,
  accessCode?: string | null,
  companyInfoSummary: CompanyInfoForEmail
}

export type DisabledDay =
  | Date
  | { before: Date }
  | { after: Date }
  | { from: Date; to: Date }
  | ((date: Date) => boolean);

export type Documents = {
  id: string | number;
  file_type?: string;
  file_type_label?: string;
  file_description?: string;
  note?: string;
  created_at: string | null | Date;
  updated_at?: string;
  signed_at?: string;
  is_validate?: boolean | null;
  is_archived?: string,
  validate_at?: string | null | Date;
  size?: string;
  status?: "available" | "pending" | "expired";
  file_url?: string;
  idCategoryType?: string;
  idCompany?: string;
  categoryType?: CategoryFile;
}

export type Formule = {
  id?: string | number;
  name: string;
  description?: string;
  stripePriceId?: string;
  monthlyPrice: string | number;
  isTagged?: boolean | null;
  tag?: string | null;
  type?: string;
  features?: string[];
  idCompany?: number | string;
  company?: {
    id: string,
    name: string,
    slug: string,
    address: string,
    email: string,
    phone: string,
  };
};

export type NotifUserForVirtualOfficeData = {
  logoUrl?: string | null;
  firstName: string;
  contractId?: string;
  companyName?: string;
  startDate?: string | null;
  endDate?: string | null;
  companyInfoSummary: CompanyInfoForEmail;
  isNotComplete?: boolean;
}

export type MailItem = {
  id: string;
  sendAt?: string | Date;
  receivedFrom?: string;
  courrielObject?: string;
  type?: string;
  status: 'non-lu' | 'lu';
  fileUrl?: string;
  uploadedAt?: string;
  isSent?: boolean;
  isArchived?: boolean;
  companyId?: string | null;
  company?: {
    id: string | number,
    name: string,
    slug: string,
    address: string,
    email: string,
    phone: string,
  },
  userId?: string | number | null;
  user?: {
    id: string | number,
    name: string,
    firstName: string,
    email: string,
  }
}

export type ContractFile = {
  contractFileId: number,
  url?: string,
  contractFileUrl?: string,
  compensatoryFileUrl?: string,
  contractFileTag?: string,
  createdAt?: string | null,
  isContractSignedByUser: boolean,
  isContractSignedByAdmin: boolean,
  procedureId?: string,
  signedUrl?: string,
  company?: {
    id: string,
    name: string,
    slug: string,
  },
  user?: {
    id: string,
    name: string,
    firstName: string,
    email: string,
  } | null
}

export interface VirtualOfficeData {
  createdAt(createdAt: any): string;
  id: number;
  user: {
    userId?: string;
    name?: string;
    firstName?: string;
    email?: string;
    role?: string;
  };
  amount?: number;
  status?: string;
  idBasicUser: number;
  idVirtualOfficeOffer?: number | null;
  company: {
    idCompany?: number;
    companyName?: string;
    legalForm?: string;
    siret?: string;
  };
  userFiles: {
    total: number;
    stats: {
      total: number;
      validated?: number;
      pending?: number;
      rejected?: number;
    };
    documents?: Array<{
      id: number;
      file_type: string;
      file_type_label: string;
      file_url: string;
      note?: string;
      is_validate: boolean | null;
      validate_at: Date | string | null;
      created_at: Date | string | null;
      id_file_type?: string;
      id_category_file?: string;
      categoryName?: string;
      labelId?: string;
    }>;
  };
  contractFileToSign?: ContractFile[] | null;
  contractFiles?: ContractFile[] | null;
  virtualOfficeOffer: {
    offerId?: number;
    offerName?: string;
  };
}

export type ContractType = "contract" | "componsatory" | string;

export type ApiResponse<T> = {
  success: boolean,
  message: string,
  data: T
}

export type ReceivedFileStatusType = "not-scanned" | "scanned"

export type ReceivedFile = {
  id_received_file: number,
  received_from_name?: string | null,
  recipient_name?: string | null,
  courriel_object?: string | null,
  resume?: string | null,
  recipient_email: string | null,
  status?: ReceivedFileStatusType | null,
  send_at?: Date | null,
  file_url: string,
  uploaded_at: Date,
  is_sent: boolean,
  is_archived: boolean,
  id_company?: number | null,
  id_basic_user?: number | null,
  user_name?: string | null,
  user_first_name?: string | null,
  user_email_name?: string | null
}

export type AnalyzedFileResponse = {
  expediteur?: string | null,
  destinataire?: string | null,
  email?: string | null,
  objet?: string | null,
  resume?: string | null
}

export interface Signatory {
  name: string;
  type: "admin" | "client";
}

export interface SignaturePosition {
  x: number;
  y: number;
  page: number;
}

export interface SignatureData {
  admin: SignaturePosition | null;
  client: SignaturePosition | null;
  selectedPage: number;
}

export type CategoryFile = {
  idCategory: string,
  categoryName?: string,
  categoryDescription?: string,
  labels?: Array<{
    labelId?: string,
    labelDescription?: string
  }>

}


// Pour facturation (customer-invoice)

export interface InvoiceDataFormat {
  invoice: {
    id: number;
    reference: string;
    referenceNum: string;
    issueDate: string;
    serviceStartDate: string;
    duration: number;
    durationType: string;
    note: string;
    amount: number;
    amountNet: number | null;
    currency: string;
    status: string;
    subscriptionStatus: string;
    paymentMethod: string;
    stripePaymentId: string;
    isProcessed: boolean;
    createdAt: string;
  };
  company: {
    id: number;
    slug: string;
    name: string;
    description: string;
    legalForm: string;
    siren: string;
    siret: string;
    logoUrl: string;
    phone: string;
    email: string;
    socialLinks: any;
    address: {
      addressLine: string;
      postalCode: string;
      city: string;
      state: string;
      country: string;
    };
    businessHour: any;
  };
  customer: {
    id: number;
    name: string;
    firstName: string;
    email: string;
    phone: string;
    profilePictureUrl: string;
    address: {
      addressLine: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    createdAt: string;
  };
  service: any;
}