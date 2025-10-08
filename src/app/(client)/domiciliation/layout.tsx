import { usePathname } from "next/navigation";
import DomiciliationNavBar from "./(domiciliation)/DomiciliationNavBar";

export default function DomiciliationLayout ({ children }: { readonly children: React.ReactNode }) {
    return (
        <div className="bg-gray-100">
      <div className="flex flex-col min-h-screen">
        <header>
          <DomiciliationNavBar isHomePage={false} />
        </header>
        <main className="container mx-auto flex-1 pt-24 pb-16 ">
          {children}
        </main>
      </div>
    </div>
    )
}