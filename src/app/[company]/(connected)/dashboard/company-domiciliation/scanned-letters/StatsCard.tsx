import { Card, CardContent } from "@/src/components/ui/card";
import React from "react";

interface StatsCardProps {
  label: string;
  value: number;
  color: "orange" | "green" | "purple";
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, color }) => {
  const getColorClasses = () => {
    switch (color) {
      case "orange":
        return "bg-amber-500 ";
      case "green":
        return "bg-emerald-500 ";
      case "purple":
        return "bg-indigo-500 ";
      default:
        return "bg-gray-500";
    }
  };

  return (
      <Card style={{
        backgroundColor: "rgb(var(--custom-background-color))",
        borderColor: "rgb(var(--custom-foreground-color)/0.1",
      }}>
      <CardContent >
        <div className="relative mt-4">
          <div className={`${getColorClasses()} w-1 h-full absolute rounded`} />
          <div className="ml-4">
            <h3 className="md:text-md text-sm text-cStandard/90 font-medium">{label}</h3>
            <span className="md:text-2xl text-md font-bold text-cPrimary/60">{value}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
  );
};

export default StatsCard;
