import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import React from "react";

type CardProps = {
  icon: string | React.ReactNode;
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
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex flex-col items-center p-8 border border-white/20">
      <div>{icon}</div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/90 mb-6">{description}</p>
      <Link href={link} >
        <Button variant="ghost" className="text-white hover:text-white font-semibold bg-emerald-600 hover:bg-emerald-700">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
