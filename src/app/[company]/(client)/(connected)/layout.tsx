import { ReactNode, useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import DynamicBreadcrumb from "./domiciliation/DynamicBreadcrumb";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#f7f7fb]">
      <div className="flex flex-col min-h-screen">
        <header>
          <NavBar isHomePage={false} />
        </header>
        <main className="flex-1 pt-24 pb-16 container mx-auto">
          <div className="container mx-auto px-4">
            <DynamicBreadcrumb />
          </div>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
