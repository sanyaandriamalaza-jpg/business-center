import { ServiceType } from "@/src/lib/type";

export default function ServiceCard({icon,color, title, description, redirect}: ServiceType) {
  return (
    <div className='bg-cBackground p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow'>
        <div className={`inline-block p-3 rounded-lg mb-4 ${color ? color : "text-cStandard"} `}>
            {icon}
        </div>
        <h3 className='text-xl font-bold mb-2 text-cStandard'>{title}</h3>
        <p className='text-cStandard/70 mb-4'>{description}</p>
        {redirect}
    </div>
  )
}