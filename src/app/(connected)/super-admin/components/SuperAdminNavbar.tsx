"use client";

import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  KeyRound,
  Users,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

const navItems = [
  { href: "/super-admin", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
  { href: "/super-admin/business-centers", label: "Centres d‘affaires", icon: <Building2 size={20} /> },
  // {
  //   href: "/super-admin/Acces",
  //   label: "Code d'accès",
  //   icon: <KeyRound size={20} />,
  // },
  { href: "/super-admin/users", label: "Utilisateurs", icon: <Users size={20} /> },
  // { href: "/super-admin/parameters", label: "Paramètres", icon: <Settings size={20} /> },
];

export default function SuperAdminNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter()

  return (
    <>
      <nav className="fixed w-full top-0 left-0 bg-white shadow z-50 px-6 border-b border-gray-200">
        <div className=" flex justify-between mt-5">
          <span className="font-bold text-lg text-indigo-900">
            Clé-o Super Admin
          </span>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-600 ">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={`${session?.user.profilePictureUrl}`} />
                <AvatarFallback>{session?.user.firstName?.slice(0, 2).toUpperCase()} </AvatarFallback>
              </Avatar>
              <span className="font-medium text-xs"> {session?.user.firstName} </span>
            </div>
            <button onClick={() => {
              signOut({ callbackUrl: "/" });
            }} className="text-gray-500  p-2 rounded-md">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <ul className="flex mt-3 space-x-8">
            {navItems.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex gap-1 items-center text-gray-500 py-3 text-sm hover:border-gray-300 hover:text-gray-600 transition ${pathname === href
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
