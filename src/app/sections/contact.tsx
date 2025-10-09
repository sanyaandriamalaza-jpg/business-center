import React from "react";

export default function Contact() {
  return (
    <div className="w-full mx-auto px-44">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Prêt à Transformer Votre Espace de Travail ?
        </h2>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
        Rejoignez les milliers de professionnels qui ont simplifié leur gestion d'espace de travail avec notre solution automatisée.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <a href="/inscription" className="px-8 py-4 bg-white hover:bg-indigo-50 text-indigo-900 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">Commencer</a>
           <a href="/contact" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">Contacter les ventes</a> 
        </div>
      </div>
    </div>
  );
}
