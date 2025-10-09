import { Award, Clock, Globe, Mail, MapPin, Users } from "lucide-react";
import React from "react";
import ServiceCard from "../../components/serviceCard";
import Image from "next/image";

const valeurs = [
    {
        icon : <Clock/>,
        title : "Innovation",
        description : "Nous repoussons constamment les limites de la technologie pour améliorer l'expérience utilisateur et l'efficacité opérationnelle.",
        color : "bg-indigo-100 text-indigo-900"
    },
    {
        icon : <Users/>,
        title : "Communauté",
        description : "Nous créons des espaces qui favorisent la collaboration et les connexions professionnelles significatives.",
        color : "bg-emerald-100 text-emerald-900"
    },
    {
        icon : <Globe/>,
        title : "Durabilité",
        description : "Nous nous engageons à minimiser notre impact environnemental et à promouvoir des pratiques durables.",
        color : "bg-amber-100 text-amber-900"
    },
];

const team = [
    {
      name: "Sophie Martin",
      title: "PDG & Co-fondatrice",
      desc:
        "Visionnaire technologique avec 15 ans d'expérience dans l'innovation des espaces de travail.",
      image: "/team1.jpeg", 
      imageAlt: "Sophie Martin",
    },
    {
      name: "Thomas Dubois",
      title: "Directeur Technique",
      desc:
        "Expert en automatisation et systèmes intelligents, pionnier de notre plateforme technologique.",
      image: "/team2.png", 
      imageAlt: "Thomas Dubois",
    },
    {
      name: "Marie Laurent",
      title: "Directrice des Opérations",
      desc:
        "Spécialiste de l'expérience client avec une passion pour l'excellence opérationnelle.",
      image: "/team3.png", 
      imageAlt: "Marie Laurent",
    },
  ];

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto">
        <div className="rounded-2xl overflow-hidden mb-12">
          <div className="relative h-96 w-full">
            <img
              src="/officebg.png"
              alt="Bureau coworking"
              className="object-cover w-full h-full"
              style={{ filter: "brightness(0.5)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-900/70 flex items-center" />
            <div className="absolute max-3xl inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-white font-bold text-4xl md:text-5xl mb-6">
                Redéfinir l'Espace de Travail
              </h1>
              <p className="text-indigo-100 text-xl  max-w-3xl mx-auto">
                SprayHive est une filliale de Spray-Info et a pour but d'apporter son aide à la domiciliation d'entreprise pour les jeunes entrepreneurs
                avec une approche centrée sur l'innovation et l'automatisation.
              </p>
            </div>
          </div>
        </div>
        <div className="mb-16 maw-w-4xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Notre Histoire
            </h2>
            <p className="text-xl text-gray-600">
              Depuis 2020, nous transformons la façon dont les professionnels
              accèdent et utilisent les espaces de travail.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className=" h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-xl">+5000</h3>
              <p className="text-gray-600">Utilisateurs Actifs</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className=" h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-xl">12</h3>
              <p className="text-gray-600">Emplacements</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className=" h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-xl">98%</h3>
              <p className="text-gray-600">Satisfaction Client</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Notre Mission
            </h2>
            <div className="prose prose-lg text-gray-600 mx-auto">
              <p className="mb-2">Chez Spray-Info, notre mission est de simplifier l'accès aux espaces de travail professionnels grâce à la technologie. Nous croyons que chaque professionnel devrait pouvoir accéder à un espace de travail de qualité, quand il en a besoin, sans les contraintes traditionnelles.</p>
              <p className="mb-2">Notre plateforme automatisée permet une gestion efficace et transparente des espaces, offrant une expérience utilisateur optimale du début à la fin. De la réservation à l'accès physique, en passant par la facturation, tout est conçu pour être simple et sans friction.</p>
              <p>Nous nous engageons à fournir des solutions innovantes qui répondent aux besoins évolutifs du monde professionnel moderne, tout en maintenant les plus hauts standards de qualité et de sécurité.</p>
            </div>
          </div>
        </div>
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Nos Valeurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valeurs.map((valeur)=> (
                <ServiceCard key={valeur.title}
                title={valeur.title}
                description={valeur.description}
                icon={valeur.icon}
                color={valeur.color} />
            ))}
          </div>
        </div>
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Notre Equipe de Direction
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3">
          {team.map((member) => (
          <div
            key={member.name}
            className="bg-white rounded-2xl shadow-md overflow-hidden flex-1 flex flex-col max-w-sm"
          >
            <div className="relative w-full h-64">
              <Image
                src={member.image}
                alt={member.imageAlt}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div>
                <p className="text-xl font-bold mb-1 text-gray-900">{member.name}</p>
                <p className="font-medium mb-3 text-indigo-600">
                  {member.title}
                </p>
                <p className="text-gray-600 text-muted-foreground">
                  {member.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-12 text-center text-white mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Prêt à démarrer ?
        </h2>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
        Rejoignez les entreprises qui font confiance à notre service de domiciliation professionnelle
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <a href="/contact" className="px-8 py-3 flex flex-row gap-1 bg-white hover:bg-indigo-50 text-indigo-900 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"> <Mail/> Contactez-nous </a>
           <a href="/espaces" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">Voir nos Espaces </a>
        </div>
      </div>
      </div>
    </div>
  );
}
