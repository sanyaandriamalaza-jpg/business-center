import { ReactNode } from "react";
import NavBar from "../[company]/(client)/components/NavBar";
import Footer from "../[company]/(client)/components/Footer";


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className='bg-[#f7f7fb]'>
      <div className='flex flex-col min-h-screen'>
        <header>
          <NavBar isHomePage={true} />
        </header>
        <main className="bg-gray-50 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}