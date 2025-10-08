import { authOptions } from "@/src/lib/auth";
import { BasicUser } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";
import ProfileWrapper from "./ProfileWrapper";

const fetchUser = async (userId: string): Promise<BasicUser | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/user/basic-user/${userId}`, {
      method: "GET",
      next: { revalidate: 1 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? (data.data as BasicUser) : null;
  } catch (error) {
    console.error("Erreur récupération utilisateur :", error);
    return null;
  }
};
export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  const userData = await fetchUser(session?.user.id as string);
  if (!session || !userData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-3">
      <h1 className="text-2xl font-bold mb-8 text-cStandard">
        Paramètres du profil
      </h1>
      <ProfileWrapper
        user={userData}
      />
    </div>
  );
}
