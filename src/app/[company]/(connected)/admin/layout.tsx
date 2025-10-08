import React from "react";
import { Toaster } from "@/src/components/ui/toaster";
import AdminNavBar from "./components/AdminNavBar";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { urlOfConnectedUser } from "@/src/lib/customfunction";
import { authOptions } from "@/src/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const urlOfRedirection = urlOfConnectedUser(session);

  if (urlOfRedirection !== `/${session?.user.companySlug}/admin`) {
    redirect(urlOfRedirection);
  }
  return (
    <html lang="fr">
      <body className="bg-[#f5f6fa] text-neutral-800">
        <AdminNavBar />
        <Toaster />
        <main className="pt-20 sm:pt-28 px-4 bg-indigo-50 min-h-screen text-neutral-800">
          {children}
        </main>
      </body>
    </html>
  );
}
