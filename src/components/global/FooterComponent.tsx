"use client";

import { Company } from "@/src/lib/type";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function Footer({ companyData }: { companyData: Company }) {

  const quickLinks = [
    {
      label: "Explorer les Espaces",
      destination: "#"
    },
    {
      label: "Tarifs",
      destination: "#"
    },
    {
      label: "À Propos",
      destination: "#"
    },
    {
      label: "Blog",
      destination: "#"
    },
    {
      label: "Contact",
      destination: "#"
    }
  ]

  const supportLink = [
    {
      label: "Centre d'Aide",
      destination: "#"
    },
    {
      label: "FAQ",
      destination: "#"
    },
    {
      label: "Conditions d'Utilisation",
      destination: "#"
    },
    {
      label: "Politique de Confidentialité",
      destination: "#"
    },
    {
      label: "Accessibilité",
      destination: "#"
    }
  ]

  const year = new Date().getFullYear()

  return (
    <footer className="bg-cPrimary/80 text-cForeground pt-16 pb-8">
      <div className="w-full mx-auto px-4 xl:px-44 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* FlexiSpace */}
          {/* TODO: récupérer les réseaux sociaux de l'entreprise */}
          <div>
            <h3 className="text-xl font-bold mb-2"> {companyData.name} </h3>
            <p className="text-sm text-cForeground mb-4">
              {companyData.description}
            </p>
            <div className="flex gap-4 text-cForeground text-lg">
              <a href="#" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          {/* Liens Rapides */}
          <div>
            <h3 className="text-lg font-bold mb-2">Liens Rapides</h3>
            <ul className="space-y-2 text-cForeground text-sm xl:text-base">
              {
                quickLinks.map((link, i) => (
                  <li key={i} className="text-[0.92rem] "><Link href={link.destination} > {link.label} </Link></li>
                ))
              }
            </ul>
          </div>
          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-2">Support</h3>
            <ul className="space-y-2 text-cForeground text-sm xl:text-base">
              {
                supportLink.map((link, i) => (
                  <li key={i} className="text-[0.92rem] "><Link href={link.destination}>{link.label} </Link></li>
                ))
              }
            </ul>
          </div>
          {/* Contactez-nous */}
          <div>
            <h3 className="text-lg font-bold mb-2">Contactez-nous</h3>
            <ul className="space-y-3 text-cForeground text-sm xl:text-base">
              <li className="flex items-start gap-3">
                <MapPin className="text-cForeground" size={18} />
                <span>
                  123 Avenue des Affaires <br />
                  Paris, France 75001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-cForeground" size={18} />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-cForeground" size={18} />
                <span>contact@flexispace.com</span>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-8 border-cForeground" />
        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 text-cForeground text-sm">
          <span>© {year} {companyData.name}. Tous droits réservés.</span>
          <div className="flex gap-6">
            <a href="#">Conditions</a>
            <a href="#">Confidentialité</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
