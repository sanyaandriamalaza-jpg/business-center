import React from 'react'

type statistiqueCardProps = {
    icon: React.ReactNode;
    statIcon: React.ReactNode;
    statPerCent: string;
    title: string;
    taux: string;
    isRed?: boolean;
}

export default function StatistiqueCard({icon, statIcon, statPerCent, title, taux, isRed = false}: statistiqueCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                {icon}
            </div>
            <div className={`flex items-center ${isRed ? "text-red-600" : "text-green-600"}`}>
                {statIcon}
                <span className="text-sm font-bold">{statPerCent}</span>
            </div>
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold mt-1 text-gray-900">{taux}</p>
    </div>
  )
}
