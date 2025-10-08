"use client";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { AlignJustify, ChevronDown, LogIn, User2, X } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const classicMenu = [
  {
    label: "Espaces",
    destination: "/spaces",
  },
  {
    label: "Domiciliation",
    destination: "/domiciliation",
  },
  {
    label: "Tarifs",
    destination: "/pricing",
  },
  {
    label: "A propos",
    destination: "/about",
  },
  {
    label: "Contact",
    destination: "/contact",
  },
];

export default function DomiciliationNavBar({
  isHomePage
}: {
  isHomePage: boolean;

}) {
  const pathname = usePathname();
  const isSubscriptionPage = pathname?.includes('/domiciliation/subscription');

  const [navBgWhite, setNavBgWhite] = useState<boolean>(false);
  const [isPhoneMenuVisible, setIsPhoneMenuVisible] = useState<boolean>(false);
  const [connected, setIsConnected] = useState(isSubscriptionPage);
  const router = useRouter();

  useEffect(() => {
    setIsConnected(!isSubscriptionPage);
  }, [pathname, isSubscriptionPage]);
  
  useEffect(() => {
    const handleScroll = () => {
      setNavBgWhite(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleConnected = () => {
    setIsConnected(true)
    router.push('/domiciliation')
  }

  return (
    <div>
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-colors duration-300 ",
          isHomePage
            ? navBgWhite
              ? "bg-white shadow-md"
              : "bg-transparent"
            : "bg-white shadow-lg"
        )}
      >
        <div className="container mx-auto flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-3xl font-bold text-white"
            style={{
              color: isHomePage
                ? navBgWhite
                  ? "#341a6f"
                  : "white"
                : "#341a6f",
            }}
          >
            Business Center
          </Link>
          <ul className="hidden lg:flex gap-8 font-medium transition-colors ">
            {classicMenu.map((menu, i) => (
              <li key={i}>
                <Link
                  href={`${menu.destination}`}
                  className={cn(
                    " transition-colors",
                    isHomePage
                      ? navBgWhite
                        ? "text-gray-700 hover:text-indigo-900"
                        : "text-white hover:text-indigo-100"
                      : "text-gray-900 font-bold text-lg hover:text-indigo-900"
                  )}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex ">
            {connected ? (
              <div className="flex gap-2 items-center ">
                <Button
                  variant="ghost"
                  onClick={() => setIsConnected(!connected)}
                  className={cn(
                    "flex items-center gap-1 transition-colors font-bold",
                    isHomePage
                      ? navBgWhite
                        ? "text-[#341a6f] hover:text-indigo-900"
                        : "text-white hover:text-indigo-100"
                      : "text-[#341a6f] hover:text-indigo-900"
                  )}
                >
                  <User2 className=" w-4 h-4" />
                  <span>Mon compte</span>
                </Button>
                <ChevronDown className=" w-4 h-4" />
              </div>
            ) : (
              <div className="flex gap-2 items-center ">
                <Button
                  variant="ghost"
                  onClick={handleConnected}
                  className="text-indigo-700 px-4 flex"
                >
                  <LogIn className=" w-4 h-4 mt-1" />
                  <span>Connexion</span>
                </Button>
                <Link
                  href = "/domiciliation/Subscription"
                  className="bg-indigo-700 text-white hover:bg-indigo-800 hover:text-white px-4 py-2 rounded-sm"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
          <div className="block lg:hidden">
            <button
              onClick={() => {
                setIsPhoneMenuVisible((prev) => !prev);
                if (isPhoneMenuVisible) {
                  setNavBgWhite(false);
                } else {
                  setNavBgWhite(true);
                }
              }}
              className="h-[40px] w-[40px] flex items-center justify-center text-white"
            >
              {isPhoneMenuVisible ? (
                <X className="text-gray-800" />
              ) : (
                <AlignJustify className="text-gray-900" />
              )}
            </button>
          </div>
        </div>
      </nav>
      {/* PHONE MENU */}
      {isPhoneMenuVisible && (
        <div
          className={`fixed z-20 top-[55px] bg-white left-0 right-0 p-4 divide-y divide-gray-100 ${isPhoneMenuVisible ? "slide-fade-in" : "slide-fade-out"}`}
        >
          <ul className="space-y-2 pb-2">
            {classicMenu.map((menu, i) => (
              <li key={i} className="">
                <Link
                  href={`${menu.destination}`}
                  className={cn(
                    "w-full block py-4 px-2 rounded-md hover:text-indigo-900 hover:bg-gray-50"
                  )}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Link
              href={`/`}
              className={cn(
                "w-full block py-2 px-2 rounded-md hover:text-indigo-900 hover:bg-gray-50"
              )}
            >
              <span>Mon compte</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
