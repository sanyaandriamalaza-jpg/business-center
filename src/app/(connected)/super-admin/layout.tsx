import React from "react";
import SuperAdminNavbar from "./components/SuperAdminNavbar";
import { Toaster } from "@/src/components/ui/toaster";
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

  if (urlOfRedirection !== "/super-admin") {
    redirect(urlOfRedirection)
  }

  return (
    <html lang="fr">
      <body className="bg-[#f5f6fa]">
        <SuperAdminNavbar />
        <main className="pt-28 px-4 bg-indigo-50 min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
