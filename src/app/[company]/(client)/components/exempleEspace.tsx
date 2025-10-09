import React from "react";

type SpaceProps = {
  src: string;
  alt: string;
  title: string;
  price: string;
};

export default function ExempleEspace({ src, alt, title, price }: SpaceProps) {
  return (
    <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative h-64 overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-white text-2xl font-bold mb-2">{title}</h3>
          <p className="text-indigo-100">{price}</p>
        </div>
      </div>
    </div>
  );
}
