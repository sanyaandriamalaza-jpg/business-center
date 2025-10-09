import React from 'react'
import Navbar from './components/navBar'
import { Toaster } from '@/src/components/ui/toaster'


export default function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
    return (
      <html lang="fr">
        <body className="bg-[#f5f6fa]">
          <Navbar />
          <Toaster/>
          <main className="pt-28 px-4 bg-indigo-50 min-h-screen">{children}</main>
        </body>
      </html>
    )
  }
