'use client';

import { Building2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

type formuleProps = {
    badge?: string;
    title: string;
    prix: number;
    offres: string[];
}

export default function FormuleSection({badge, title, prix, offres}: formuleProps) {
  const router = useRouter();
  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-10 flex-1 max-w-lg flex flex-col overflow-hidden">
    {badge && (
        <span className="absolute -top-1 right-0 bg-indigo-600 text-white text-sm px-6 py-1.5 rounded-bl-lg font-medium shadow z-10">
        {badge}
      </span>
    )}
    <div className="flex items-center gap-3 mb-4">
      <Building2 size={32} className={`${title === "Premium" ? "text-indigo-600": "text-gray-900"} `} />
      <span className="font-bold text-2xl text-gray-900">{title}</span>
    </div>
    <div className="text-gray-600 mb-6">
      Solution complète pour les entreprises
    </div>
    <div className="text-5xl font-extrabold text-indigo-600 mb-0 leading-none">
      {prix}Ar
      <span className="text-xl font-normal text-gray-600 align-super ml-1">/mois</span>
    </div>
    <ul className="mt-6 space-y-3 mb-8">
      
        {offres.map((offre) => (
            <li key={offre} className="flex items-center gap-2 text-sm">
                <Check className="text-emerald-600"/>
                <span className="text-gray-600">{offre}</span>
            </li>
        ))}
      
    </ul>
    <button onClick={()=> router.push('/sprayhive/business-address/1')} className={`${title === "Premium" ? "bg-indigo-600 text-white": "bg-indigo-50 hover:bg-indigo-100 text-indigo-600"} font-medium rounded-lg py-3 w-full mt-auto hover:bg-[#4635b5] transition `} >
      Souscrire au plan {title}
    </button>
  </div>

  )
}
