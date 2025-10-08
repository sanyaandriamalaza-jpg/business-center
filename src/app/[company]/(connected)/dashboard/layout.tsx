import Footer from "@/src/components/global/FooterComponent";
import NavBar from "@/src/components/global/NavBarComponent";
import { ReactNode } from "react";
import { Company } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { urlOfConnectedUser } from "@/src/lib/customfunction";
import DynamicBreadcrumb from "./components/DynamicBreadcrumb";
import { authOptions } from "@/src/lib/auth";

const fetchCompanyData = async (
  companySlug: string
): Promise<Company | null> => {
  try {
    const res = await fetch(`${baseUrl}/api/company?slug=${companySlug}`, {
      next: { revalidate: 5 },
    });
    const data = await res.json();

    if (data.success && data.count > 0) {
      return data.data[0];
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ company: string }>;
}) {
  const parameters = await params;
  const companySlug = parameters.company;
  const companyData = await fetchCompanyData(companySlug);

  if (!companyData) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const urlOfRedirection = urlOfConnectedUser(session);

  if (urlOfRedirection !== `/${session?.user.companySlug}/dashboard`) {
    redirect(urlOfRedirection);
  }

  return (
    <div className="bg-cBackground/90">
      <div className="flex flex-col min-h-screen">
        <header>
          <NavBar isHomePage={false} companyData={companyData} />
        </header>
        <main className="flex-1 pt-24 pb-16 ">
          <div className="container mx-auto px-4">
            <DynamicBreadcrumb />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
