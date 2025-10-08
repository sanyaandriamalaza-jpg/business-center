export type ServiceType = {
    icon : string | React.ReactNode;
    color: string;
    title: string;
    description: string;
    redirect?: string | React.ReactNode;
}

export type CommentType = {
    comment : string;
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
    profilePictureUrl?: string | null;
    profileType : ProfileType
}

// ajout utilisateur
export interface User {
  id:number;
  name: string,
  firstname:string,
  initials?: string,
  phone: string
  email: string
  role: string
  company: string
  statut?: string
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
  id: number
  type: 'coworking' | 'bureau_prive' | 'salle_reunion'
  isTaged: boolean
  pricing: {
    horaire: number
    journalier: number
  }
  features: string[]
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
