import CryptoJS from 'crypto-js';
import bcrypt from 'bcrypt'
import { UserDataSession } from './type';

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