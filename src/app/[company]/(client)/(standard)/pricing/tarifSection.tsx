import { Building2, Check } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

type formuleProps = {
    badge?: string;
    title: string;
    description: string;
    prix: number;
    offres: string[];
}

export default function TarifSection({badge, title,description, prix, offres}: formuleProps) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-10 flex-1 max-w-lg flex flex-col overflow-hidden ${badge ? "border-2 border-indigo-800" : ""}`}>
    {badge && (
        <span className="absolute -top-1 right-0 bg-indigo-600 text-white text-sm px-6 py-1.5 rounded-bl-lg font-medium shadow z-10">
        {badge}
      </span>
    )}
    <div className="flex items-center gap-3 mb-4">
      <span className="font-bold text-2xl text-gray-900">{title}</span>
    </div>
    <div className="text-gray-600 mb-6">
      {description}
    </div>
    <div className="text-5xl font-extrabold text-indigo-600 mb-0 leading-none">
      {prix}€
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
    <Link href="/espaces">
    <button className={`${badge ? "bg-indigo-600 text-white": "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"} font-medium rounded-lg py-3 w-full mt-auto transition `} >
      Réserver maintenat
    </button></Link>
  </div>

  )
}
