import React from "react";
import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import Link from "next/link";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  href: string;
  isSm: boolean;
}

const FeatureCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  iconColor = "text-blue-600",
  href,
  isSm,
}) => {
  return (
    <Card
      className={`hover:shadow-cStandard-md transition-shadow cursor-pointer ${isSm === true ? "h-full" : "h-4/5"}`}
      style={{
        backgroundColor: "rgb(var(--custom-background-color))",
        borderColor: "rgb(var(--custom-foreground-color)/0.1",
      }}
    >
      <Link href={href}>
        <CardHeader className="pb-4">
          <div
            className={`w-10 h-10 text-center rounded-lg flex items-center justify-center mb-4`}
          >
            <Icon className={`w-10 h-10 p-1 ${iconColor} rounded-md`} />
          </div>
          <CardTitle className="text-lg font-semibold text-cStandard">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription
            className={`text-base leading-relaxed ${isSm === true ? "max-w-[350px]" : ""} `}
            style={{
              color: "rgb(var(--custom-standard-color)/0.6)",
            }}
          >
            {description}
          </CardDescription>
        </CardContent>
      </Link>
    </Card>
  );
};

export default FeatureCard;
