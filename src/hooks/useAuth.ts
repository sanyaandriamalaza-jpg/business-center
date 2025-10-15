"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { apiUrl } from "@/src/lib/utils";
import { User, UserDataSession } from "../lib/type";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserDataSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetch(`${apiUrl}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message ||
              "Les identifiants sont incorrects ou le serveur est injoignable."
          );
        }

        const token = data.data.token;
        const user = data.data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setToken(token);
        setUser(user);
        setStatus("authenticated");

        if (user.profileType === "adminUser") {
          router.push("/sprayhive/admin");
        } else if (user.profileType === "basicUser") {
          router.push("/sprayhive/domiciliation");
        } else {
          router.push("/");
        }
      } catch (error: any) {
        throw new Error(error.message || "Erreur de connexion.");
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
    router.push("/login");
  }, [router]);

  return { user, token, status, login, logout };
}
