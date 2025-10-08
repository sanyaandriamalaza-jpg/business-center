import { ServiceType } from '@/src/lib/type'
import React from 'react'

export default function DomiciliationCard({ icon, color, title, description, redirect }: ServiceType) {
  return (
    <div className='bg-white p-6 md:p-5 xl:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col gap-3'>
      <div>
        <div className={`inline-block rounded-lg mb-2 ${color} `}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className='text-xl font-bold mb-2 text-gray-800'>{title}</h3>
        <p className='text-gray-600 mb-4 flex-1 md:text-sm xl:text-base'>{description}</p>
        {redirect}
      </div>
    </div>
  )
}
