"use client";

import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-indigo-950 text-white pt-16 pb-8">
      <div className="w-full mx-auto px-44 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* FlexiSpace */}
          <div>
            <h3 className="text-xl font-bold mb-2">SprayHive</h3>
            <p className="text-sm text-[#b9b8d3] mb-4">
              Redéfinir la flexibilité des espaces de travail avec des solutions de bureau automatisées et à la demande.
            </p>
            <div className="flex gap-4 text-[#b9b8d3] text-lg">
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
            <ul className="space-y-2 text-[#b9b8d3] text-sm">
              <li><a href="#">Tarifs</a></li>
              <li><a href="#">À Propos</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          {/* Support */}
          {/* <div>
            <h3 className="text-lg font-bold mb-2">Support</h3>
            <ul className="space-y-2 text-[#b9b8d3] text-sm">
              <li><a href="#">Centre d'Aide</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Conditions d'Utilisation</a></li>
              <li><a href="#">Politique de Confidentialité</a></li>
              <li><a href="#">Accessibilité</a></li>
            </ul>
          </div> */}
          {/* Contactez-nous */}
          <div>
            <h3 className="text-lg font-bold mb-2">Contactez-nous</h3>
            <ul className="space-y-3 text-[#b9b8d3] text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#27c89d]" size={18} />
                <span>
                  Carrière, arrêt bus 28 <br />
                  301, Fianarantsoa, Madagascar
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#27c89d]" size={18} />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#27c89d]" size={18} />
                <span>contact@sprayhive.com</span>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-8 border-[#302d60]" />
        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row md:justify-center items-center gap-4 text-[#b9b8d3] text-xs">
          <span>© 2025 SprayHive. Tous droits réservés.</span>
          {/* <div className="flex gap-6">
            <a href="#">Conditions</a>
            <a href="#">Confidentialité</a>
            <a href="#">Cookies</a>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
