import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { CoworkingOfferType, InvoiceStatus, UserDataSession } from './type';
import { BusinessHour, DayName } from "@/src/lib/type"
import { PhoneNumberUtil } from 'google-libphonenumber';
import { Session } from 'next-auth';


export const baseUrl = process.env.NODE_ENV === "production" ? `${process.env.NEXT_PUBLIC_URL}` : `${process.env.NEXT_PUBLIC_URL_DEV}`

export const cryptmessage = async (message: string) => {
    const saltRounds = 10
    const hashed = await bcrypt.hash(message, saltRounds)
    return hashed
}

export const decryptMessage = (ciphertext: string, secretKey: string) => {
    if (!secretKey) {
        throw new Error("Decryption failed because SECRET_KEY is missing");
    }

    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
    return originalMessage;
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword)
}

export const getUserByEmail = async (
    email: string
): Promise<UserDataSession | null> => {
    if (!email) {
        throw new Error("L'email est requis");
    }

    try {
        const url = new URL(`${baseUrl}/api/auth/password-hash`);
        url.searchParams.append("email", email);

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Erreur lors de la récupération de l'utilisateur");
        }

        const data = await res.json();

        if (data.success && data.data) {
            return data.data as UserDataSession;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erreur getUserByEmail:", error);
        throw error;
    }
};



export function formatBusinessHourFr(businessHour: BusinessHour): { jour: string; horaire: string }[] {
    const joursFr: Record<DayName, string> = {
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
        sunday: "Dimanche",
    }

    return Object.entries(businessHour).map(([day, value]) => {
        const { open, close, isClosed } = value
        const jour = joursFr[day as DayName]
        let horaire = "Fermé"

        if (!isClosed && open && close) {
            horaire = `${open} - ${close}`
        }

        return { jour, horaire }
    })
}

export function translateCoworkingOfferType(type: CoworkingOfferType | null): string {
    switch (type) {
        case "privateOffice":
            return "Bureau privé";
        case "coworkingSpace":
            return "Espace coworking";
        case "meetingRoom":
            return "Salle de réunion";
        default:
            return "Type inconnu";
    }
}

export function getCoworkingOfferColor(type: CoworkingOfferType): string {
    switch (type) {
        case "privateOffice":
            return "#982afa"; // violet
        case "coworkingSpace":
            return "#10B981"; // vert
        case "meetingRoom":
            return "#F59E0B"; // orange
        default:
            return "#45556c"; // gris pour inconnu
    }
}

export function capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function capitalizeWords(phrase: string): string {
    return phrase
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}


export interface UploadResponse {
    success: boolean;
    filename?: string;
    path?: string;
    error?: string;
}
interface UploadOptions {
    customFileName?: string;
    customFolder?: string;
}
export async function uploadImage(
    file: File,
    options?: UploadOptions
): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("image", file);

    if (options?.customFileName) {
        formData.append("customFileName", options.customFileName);
    }
    if (options?.customFolder) {
        formData.append("customFolder", options.customFolder);
    }

    try {
        //TODO : change base url
        const response = await fetch(`${process.env.NEXT_PUBLIC_FILE_BASE_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            error: "Erreur lors de l’upload.",
        };
    }
}
export async function uploadFile(
    file: File,
    options?: UploadOptions
): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    if (options?.customFileName) {
        formData.append("customFileName", options.customFileName);
    }
    if (options?.customFolder) {
        formData.append("customFolder", options.customFolder);
    }

    try {
        //TODO : change base url
        const response = await fetch(`${process.env.NEXT_PUBLIC_FILE_BASE_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            error: "Erreur lors de l’upload.",
        };
    }
}

export function generateId(str: string) {
    if (!str) return '';

    return str
        // Convertir en minuscules dès le début
        .toLowerCase()

        // Normaliser les caractères (enlever les accents)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

        // Remplacer les apostrophes et les guillemets par des tirets
        .replace(/[''`‛']/g, '-')  // Apostrophes droites et courbes
        .replace(/[""″«»]/g, '-')  // Différents types de guillemets

        // Remplacer les espaces et caractères de ponctuation par des tirets
        .replace(/[\s.,;:!?\/\\\(\)]+/g, '-')

        // Nettoyer les caractères non alphanumériques restants
        .replace(/[^a-z0-9-]/g, '-')

        // Enlever les tirets multiples
        .replace(/-+/g, '-')

        // Enlever les tirets au début et à la fin
        .replace(/^-+|-+$/g, '');  // Supprime les tirets au début et à la fin
}

export function formatDateToTime(date: Date): string {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function generateTimeOptions(
    stepMinutes = 30,
    start = "08:00",
    end = "20:00",
    minTime?: string,
    maxTime?: string
) {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const minTimeMs = minTime ? toTimeMs(minTime) : 0;
    const maxTimeMs = maxTime ? toTimeMs(maxTime) : Infinity;

    const options: string[] = [];

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    while (current <= endTime) {
        const h = current.getHours().toString().padStart(2, "0");
        const m = current.getMinutes().toString().padStart(2, "0");
        const currentTime = `${h}:${m}`;

        const currentMs = toTimeMs(currentTime);
        if (currentMs >= minTimeMs && currentMs <= maxTimeMs) {
            options.push(currentTime);
        }

        current = new Date(current.getTime() + stepMinutes * 60 * 1000);
    }

    return options;
}

function toTimeMs(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 3600000 + m * 60000;
}

export function getDuration(start: string, end: string) {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

export const getNumberOfDays = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from || !range?.to) return 0;

    const from = new Date(range.from.setHours(0, 0, 0, 0));
    const to = new Date(range.to.setHours(0, 0, 0, 0));

    const diffTime = to.getTime() - from.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // ← ici

    return diffDays;
};

export function normalizeAndCapitalize(text: string, capitalize = false): string {
    return text
        // 1. Normaliser les caractères accentués
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        // 2. Supprimer les caractères non alphanumériques (sauf espace et tiret)
        .replace(/[^a-zA-Z0-9 -]/g, "")
        // 3. Remplacer espaces et tirets par _
        .replace(/[\s-]+/g, "_")
        // 4. Optionnel : capitaliser chaque mot
        .split("_")
        .map(word => capitalize ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase())
        .join("_");
}

export function getDatesInRange(from: Date, to: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(from);

    while (current <= to) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

export function getRoundedMinTime(offset: number): Date {
    const min = new Date();
    min.setHours(min.getHours() + offset);
    min.setMinutes(min.getMinutes() < 30 ? 30 : 0, 0, 0);
    if (min.getMinutes() === 0) min.setHours(min.getHours() + 1);
    return min;
}

export function formatDateFr(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;

    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

type ProfileType = "adminUser" | "superAdminUser" | "basicUser";

// export const urlOfConnectedUser = (session: Session | null): string => {
//     if (!session) return "/login";

//     const profileRoutes: Record<ProfileType, string> = {
//         adminUser: `/${session.user.companySlug}/admin`,
//         superAdminUser: `/super-admin`,
//         basicUser: `/${session.user.companySlug}/dashboard`,
//     };

//     return profileRoutes[session.user.profileType];
// };

const phoneUtil = PhoneNumberUtil.getInstance();
export const isPhoneValid = (phone: string) => {
    try {
        return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
    } catch (error) {
        return false;
    }
};

export const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} Ko`;
    return `${(size / 1024 / 1024).toFixed(2)} Mo`;
};