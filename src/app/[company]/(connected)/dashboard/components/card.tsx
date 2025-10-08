import { Button } from "@/src/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

type CardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  buttonText?: string;
};

export default function Card({
  icon,
  title,
  description,
  link,
  buttonText,
}: CardProps) {
  const Icon = icon;
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-sm flex flex-col items-center px-4 sm:px-6 py-8 xl:p-8 border border-white/20">
      <div>
        <Icon className="text-emerald-400 mb-4 w-10 md:w-11 xl:w-12 h-10 sm:h-11 xl:h-12" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/90 mb-6 text-sm sm:text-base">{description}</p>
      <Link href={link} >
        <Button variant="ghost" className="text-white hover:text-white font-semibold bg-emerald-600 hover:bg-emerald-700">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
