"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/src/lib/utils";
import { UserDataSession } from "../lib/type";


type Status = "loading" | "authenticated" | "unauthenticated";

export function useSessionAdmin(redirectIfUnauthenticated = false) {
  const [user, setUser] = useState<UserDataSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
      setStatus("authenticated");
    } else {
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");

      if (redirectIfUnauthenticated) {
        router.push("/login");
      }
    }
  }, [redirectIfUnauthenticated, router]);

  const logout = async () => {
    try {
      if (token) {
        // Optionnel : appeler ton API de déconnexion
        await fetch(`${apiUrl}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (e) {
      console.error("Erreur lors de la déconnexion :", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");
      router.push("/login");
    }
  };

  return {
    user,
    token,
    status,
    isAuthenticated: status === "authenticated",
    loading: status === "loading",
    logout,
  };
}
