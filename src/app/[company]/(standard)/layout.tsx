import Footer from "@/src/components/global/FooterComponent";
import NavBar from "@/src/components/global/NavBarComponent";
import { Company } from "@/src/lib/type";
import { baseUrl } from "@/src/lib/utils";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "@/src/components/ui/toaster";
import { cookies } from "next/headers";

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


  return (
    <div className="bg-cBackground/95">
      <div className="flex flex-col min-h-screen">
        <header>
          <NavBar companyData={companyData} isHomePage={false}/>
        </header>
        <main className="flex-1 pt-16 xl:pt-24 pb-8 xl:pb-16 ">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}
