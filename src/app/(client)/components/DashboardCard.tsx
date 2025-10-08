import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

type dashboardCardProps = {
    link: string;
    icon: React.ReactNode;
    color: string;
    title: string;
    description: string;
}

export default function DashboardCard({link,icon, color, title, description}: dashboardCardProps) {
  return (
    <Link href={link}>
        <div className="bg-white rounded-xl shadow-sm p-4 h-40 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={` p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <ArrowRight className="w-6 h-6 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm font-medium mt-1 text-gray-500">{description}</p>
    </div>
    </Link>
  )
}
