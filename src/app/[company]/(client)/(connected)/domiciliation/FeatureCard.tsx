import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import Link from 'next/link';


interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  href : string;
  isSm : boolean;
}

const FeatureCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, description, iconColor = 'text-blue-600', href, isSm }) => {
  return (
    <Card className={`hover:shadow-md transition-shadow border border-gray-200 cursor-pointer ${isSm === true ? "h-full" : "h-4/5"}`}>
      <Link href = {href}>
      <CardHeader className="pb-4">
        <div className={`w-10 h-10 text-center rounded-lg flex items-center justify-center mb-4`}>
          <Icon className={`w-10 h-10 p-1 ${iconColor} rounded-md`} />
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent >
        <CardDescription className={`text-base text-gray-600 leading-relaxed ${isSm === true ? "max-w-[350px]" : ""} `}>
          {description}
        </CardDescription>
      </CardContent>
      </Link>
    </Card>
  );
};

export default FeatureCard;