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
        <div className="bg-cBackground rounded-xl shadow-sm p-4 h-40 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={` p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <ArrowRight className="w-6 h-6 text-cStandard/60" />
        </div>
        <h3 className="text-xl font-semibold text-cStandard">{title}</h3>
        <p className="text-sm font-medium mt-1 text-cStandard/60">{description}</p>
    </div>
    </Link>
  )
}
