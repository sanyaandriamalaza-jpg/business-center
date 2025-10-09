"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  KeyRound,
  MapPin,
  Users,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
  { href: "/admin/espaces", label: "Espaces", icon: <Building2 size={20} /> },
  {
    href: "/admin/reservations",
    label: "Réservations",
    icon: <CalendarCheck size={20} />,
  },
  {
    href: "/admin/codesAcces",
    label: "Codes d'accès",
    icon: <KeyRound size={20} />,
  },
  {
    href: "/admin/domiciliations",
    label: "Domiciliations",
    icon: <MapPin size={20} />,
  },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: <Users size={20} /> },
  { href: "/admin/parametres", label: "Paramètres", icon: <Settings size={20} /> },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <>
      <nav className="fixed w-full top-0 left-0 bg-white shadow z-50 px-6 border-b border-gray-200">
        <div className=" flex justify-between mt-5">
          <span className="font-bold text-lg text-indigo-900">
            SprayHive Admin
          </span>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-600 ">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full border object-cover"
                src="https://randomuser.me/api/portraits/women/68.jpg"
                alt="Sarah SABIH"
              />
              <span className="font-medium text-xs">Sarah SABIH</span>
            </div>
            <Link href="/" className="text-gray-500 ">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div>
          <ul className="flex mt-3 space-x-8">
            {navItems.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex gap-1 items-center text-gray-500 py-3 text-sm hover:border-gray-300 hover:text-gray-600 transition ${
                    pathname === href
                      ? "text-indigo-600 font-medium border-b-2 border-indigo-600 hover:text-indigo-600 hover:border-indigo-600"
                      : ""
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
