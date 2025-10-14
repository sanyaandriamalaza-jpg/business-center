"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type User = {
  id: number;
  name: string;
  email: string;
  profileType: "basicUser" | "adminUser" | "superAdminUser";
  [key: string]: any;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setStatus("authenticated");
    } else {
      setUser(null);
      setToken(null);
      setStatus("unauthenticated");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");

    router.push("/");
  };

  return { user, token, status, logout };
}
