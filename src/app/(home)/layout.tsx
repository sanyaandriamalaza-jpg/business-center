import Footer from "@/src/components/global/FooterComponent";
import NavBar from "@/src/components/global/NavBarComponent";
import { ReactNode, useEffect, useState } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className='bg-[#f7f7fb]'>
      {children}
      {/* <div className='flex flex-col min-h-screen'>
        <header>
          <NavBar isHomePage={true} />
        </header>
        <main className="bg-gray-50 flex-1">{children}</main>
        <Footer />
      </div> */}
    </div>
  );
}