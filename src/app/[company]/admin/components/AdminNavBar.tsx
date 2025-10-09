"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  PencilRuler,
  Library,
  Menu,
  X,
  ScanLine,
  File,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { useCallback, useEffect, useState } from "react";
import { useAdminStore } from "@/src/store/useAdminStore";
import { AdminUser } from "@/src/lib/type";
import AdminGeneralLoading from "./AdminGeneralLoading";
import Image from "next/image";

const navItems = [
  {
    href: "/admin",
    label: "Tableau de bord",
    icon: <LayoutDashboard size={20} />,
  },
  { href: "/admin/spaces", label: "Espaces", icon: <Building2 size={20} /> },
  {
    href: "/admin/interactive-map",
    label: "Plan interactif",
    icon: <PencilRuler size={20} />,
  },
  {
    href: "/admin/reservations",
    label: "Réservations",
    icon: <CalendarCheck size={20} />,
  },
  {
    href: "/admin/access-code",
    label: "Codes d'accès",
    icon: <KeyRound size={20} />,
  },
  {
    href: "/admin/virtual-office-address",
    label: "Domiciliations",
    icon: <MapPin size={20} />,
  },
  {
    href: "/admin/virtual-office-address-offer",
    label: "Formules de domiciliation",
    icon: <Library size={20} />,
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: <Users size={20} />,
  },
  {
    href: "/admin/scanned-mail",
    label: "Courriers scannés",
    icon: <ScanLine size={20} />,
  },
  {
    href: "/admin/customer-invoice",
    label: "Facturation",
    icon: <File size={20} />,
  },
  {
    href: "/admin/parameters",
    label: "Paramètres",
    icon: <Settings size={20} />,
  },
];

export default function AdminNavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const company = pathname.split("/")[1];

  const isGeneralLoadingVisible = useAdminStore(
    (state) => state.isGeneralLoadingVisible
  );
  const setAdminCompany = useAdminStore((state) => state.setAdminCompany);
  const adminCompany = useAdminStore((state) => state.adminCompany);

  const fetchUserInfo = useCallback(
    async (userId: number) => {
      try {
        const res = await fetch(`/api/user/admin/${userId}`);
        const data = await res.json();
        if (data.success) {
          const adminUser = data.data as AdminUser;
          if (adminUser.companyInfo) {
            setAdminCompany(adminUser.companyInfo);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [setAdminCompany]
  );

  useEffect(() => {
    if (status === "authenticated" && session.user.id && !adminCompany) {
      const userId = Number(session.user.id);
      fetchUserInfo(userId);
    }
  }, [session, status, fetchUserInfo, adminCompany]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {isGeneralLoadingVisible ? <AdminGeneralLoading /> : <div> </div>}
      <nav className="fixed w-full top-0 left-0 bg-white shadow z-50 pb-2 px-6 border-b border-gray-200">
        <div className=" flex justify-between mt-5">
          <span className="font-bold text-lg">
            <Link href={`/${company}/admin`}>
              <Image
                className="w-auto h-6 sm:h-[50px] "
                src="/images/logo.webp"
                alt="Logo"
                width={323}
                height={219}
              />
            </Link>
          </span>
          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <button className="lg:hidden text-gray-600" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <button className="text-gray-600 ">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <div className="flex items-center lg:gap-2 text-neutral-800">
              <Avatar className="w-8 h-8 ">
                <AvatarImage src={`${session?.user.profilePictureUrl}`} />
                <AvatarFallback>
                  {session?.user.firstName?.slice(0, 2).toUpperCase()}{" "}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-xs">
                {" "}
                {session?.user.firstName}{" "}
              </span>
            </div>
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
              }}
              className="text-gray-500  p-2 rounded-md"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <ul className="flex mt-3 space-x-2 lg:space-x-8">
            {navItems.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={`/${session?.user.companySlug}${href}`}
                  className={`flex gap-1 items-center py-3 text-sm hover:border-cDeafultPrimary-100 hover:text-cDefaultPrimary-100 transition ${
                    pathname === href
                      ? "text-cDefaultPrimary-100 font-medium border-b-2 border-cDefaultPrimary-100 hover:text-cDefaultPrimary-100 hover:border-cDefaultPrimary-100"
                      : "text-gray-500 "
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* version mobile / tablette */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white absolute top-full left-0 right-0 shadow-lg z-50 max-h-[calc(100vh-64px)] overflow-y-auto">
            <ul className="py-2 px-4 space-y-2">
              {navItems.map(({ href, label, icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex gap-3 items-center py-3 px-2 text-sm rounded-md ${
                      pathname === href
                        ? "bg-cDefaultPrimary-50 text-cDefaultPrimary-100 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {icon}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
