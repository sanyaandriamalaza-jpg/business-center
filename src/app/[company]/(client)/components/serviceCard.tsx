import { ServiceType } from '@/src/lib/type'
import React from 'react'

export default function ServiceCard({icon,color, title, description, redirect}: ServiceType) {
  return (
    <div className='bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow'>
        <div className={`inline-block p-3 rounded-lg mb-4 ${color} `}>
            {icon}
        </div>
        <h3 className='text-xl font-bold mb-2 text-gray-800'>{title}</h3>
        <p className='text-gray-600 mb-4'>{description}</p>
        {redirect}
    </div>
  )
}
