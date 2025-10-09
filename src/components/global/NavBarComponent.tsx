"use client";

import { AlignJustify, ChevronDown, LogIn, User, X } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/src/lib/utils";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import OverlayComponent from "@/src/components/global/OverlayComponent";
import { useParams } from "next/navigation";
import { Company, UserTheme } from "@/src/lib/type";
import PublicGeneralLoading from "./PublicGeneralLoading";

interface AuthenticatedMenuList {
  label: string;
  destination: string;
}

export default function NavBar({
  companyData,
  isHomePage,
}: {
  companyData: Company;
  isHomePage: boolean;
}) {
  const params = useParams();
  const companySlug = params.company;

  const [navBgWhite, setNavBgWhite] = useState<boolean>(false);
  const [isPhoneMenuVisible, setIsPhoneMenuVisible] = useState<boolean>(false);
  const [isAuthenticatedMenuVisible, setIsAuthenticatedMenuVisible] =
    useState<boolean>(false);
  const [authenticatedMenu, setAuthenticatedMenu] =
    useState<AuthenticatedMenuList[]>();

  const { data: session, status } = useSession();

  const isGeneralOverlayVisible = useGlobalStore(
    (state) => state.isGeneralOverlayVisible
  );
  const setIsGeneralOverlayVisible = useGlobalStore(
    (state) => state.setIsGeneralOverlayVisible
  );
  const currentBusinessCenter = useGlobalStore(
    (state) => state.currentBusinessCenter
  );
  const setCurrentBusinessCenter = useGlobalStore(
    (state) => state.setCurrentBusinessCenter
  );
  const setTheme = useGlobalStore((state) => state.setTheme);
  const colorTheme = useGlobalStore((state) => state.theme);

  // const [classicMenu, setClassicMenu] = useState<Array<{ label: string; destination: string }>>([]);
  const classicMenu = [];

  if (companyData.reservationIsActive) {
    classicMenu.push({
      label: "Espaces",
      destination: `/${companyData.slug}/spaces`,
    });
  }
  if (companyData.virtualOfficeIsActive) {
    classicMenu.push({
      label: "Domiciliation",
      destination: `/${companyData.slug}/business-address`,
    });
  }

  useEffect(() => {
    const handleScroll = () => {
      setNavBgWhite(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!currentBusinessCenter && companyData) {
      setCurrentBusinessCenter(companyData);
      const theme = companyData.theme;
      setTheme(theme);
    }
  }, [currentBusinessCenter, companyData, setCurrentBusinessCenter, setTheme]);

  useEffect(() => {
    if (session) {
      let data: AuthenticatedMenuList[] = [];
      switch (session.user.profileType) {
        case "basicUser":
          data = [
            {
              label: "Tableau de bord",
              destination: `/${companyData.slug}/dashboard`,
            },
            {
              label: "Mes Réservations",
              destination: `/${companyData.slug}/dashboard/reservations`,
            },
            {
              label: "Paramètres du profil",
              destination: `/${companyData.slug}/dashboard/profile`,
            },
          ];
          break;
        case "adminUser":
          data = [
            {
              label: "Tableau de bord",
              destination: `/${companyData.slug}/admin`,
            },
            {
              label: "Paramètres du profil",
              destination: `/${companyData.slug}/admin/parameter`,
            },
          ];
          break;
        case "superAdminUser":
          data = [
            {
              label: "Tableau de bord",
              destination: "/super-admin",
            },
            {
              label: "Paramètres du profil",
              destination: "/#",
            },
          ];
          break;

        default:
          break;
      }
      setAuthenticatedMenu(data);
    }
  }, [session,companyData.slug]);

  const isGeneralLoadingVisible = useGlobalStore(
    (state) => state.isGeneralLoadingVisible
  );

  return (
    <div>
      {isGeneralLoadingVisible ? <PublicGeneralLoading /> : <div> </div>}
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-[50] transition-colors duration-300 ",
          isHomePage
            ? navBgWhite
              ? "bg-cBackground shadow-md"
              : "bg-transparent"
            : "bg-cBackground shadow-md"
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <Link
            href={`/${companyData.slug}`}
            className="text-2xl font-bold"
            style={{
              color: isHomePage
                ? navBgWhite
                  ? "rgb(var(--custom-primary-color))"
                  : "white"
                : "rgb(var(--custom-primary-color))",
            }}
          >
            {companyData.name}
          </Link>
          <ul className="hidden lg:flex gap-5 xl:gap-8 font-medium transition-colors  ">
            {classicMenu.map((menu, i) => (
              <li key={i}>
                <Link
                  href={`${menu.destination}`}
                  className={cn(
                    " transition-colors",
                    isHomePage
                      ? navBgWhite
                        ? "text-cBackground hover:text-cPrimaryHover"
                        : "text-cStandard hover:text-cPrimaryHover"
                      : "text-cStandard hover:text-cPrimaryHover"
                  )}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="w-[150px]">
            {status === "loading" ? (
              <div></div>
            ) : status === "authenticated" ? (
              <div className="hidden lg:flex gap-4 items-center relative ">
                <button
                  onClick={() => {
                    setIsAuthenticatedMenuVisible((prev) => !prev);
                    if (isAuthenticatedMenuVisible) {
                      setIsGeneralOverlayVisible(false);
                    } else {
                      setIsGeneralOverlayVisible(true);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 font-medium ${
                    isHomePage
                      ? navBgWhite
                        ? "text-cBackground"
                        : "text-cStandard"
                      : "text-cStandard"
                  }`}
                >
                  <User className="w-5" />
                  <div className="flex items-center justify-center gap-1">
                    <span>Mon compte</span>
                    <ChevronDown
                      className={`w-4 duration-300 ${
                        isAuthenticatedMenuVisible ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                {isAuthenticatedMenuVisible && authenticatedMenu && (
                  <div className="bg-cBackground/80 backdrop-blur-sm absolute top-[32px] right-0 rounded-md py-2 w-[200px]  ">
                    <ul>
                      {authenticatedMenu.map((menu, i) => (
                        <li key={i}>
                          <Link
                            href={menu.destination}
                            onClick={() =>
                              setIsAuthenticatedMenuVisible((prev) => !prev)
                            }
                            className="w-full block py-2 px-4 text-sm rounded-md text-cStandard hover:text-cPrimary hover:bg-cBackground"
                          >
                            {menu.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => signOut()}
                      className="text-left w-full block py-2 px-4 text-sm rounded-md text-cStandard hover:text-cPrimary hover:bg-cBackground"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex gap-4 items-center">
                <Link
                  href={`/login`}
                  className={cn(
                    "flex items-center gap-1 transition-colors font-medium",
                    isHomePage
                      ? navBgWhite
                        ? "text-cStandard hover:text-cPrimary"
                        : "text-cBackground hover:text-cPrimary"
                      : "text-cStandard hover:text-cPrimary"
                  )}
                >
                  <LogIn className=" w-5 h-5" />
                  <span>Connexion</span>
                </Link>
                {/* <Link
                      href={"/register"}
                      className={`font-medium px-4 py-2 rounded-md  transition-opacity 
                ${isHomePage ? (navBgWhite
                          ? "bg-indigo-900 text-white hover:opacity-90"
                          : "text-indigo-900 hover:opacity-90 bg-white") : "bg-indigo-900 text-white hover:opacity-90"
                        }
                  `}
                    >
                      Inscription
                    </Link> */}
              </div>
            )}
          </div>

          <div className="block lg:hidden">
            <button
              onClick={() => {
                setIsPhoneMenuVisible((prev) => !prev);
                setIsGeneralOverlayVisible(!isGeneralOverlayVisible);
                if (isPhoneMenuVisible) {
                  setNavBgWhite(false);
                } else {
                  setNavBgWhite(true);
                }
              }}
              className="h-[40px] w-[40px] flex items-center justify-center text-cStandard"
            >
              {isPhoneMenuVisible ? (
                <X className="text-cStandard" />
              ) : (
                <AlignJustify
                  className={`${
                    isHomePage
                      ? navBgWhite
                        ? "text-cStandard"
                        : "text-cBackground"
                      : "text-cStandard"
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </nav>
      {/* PHONE MENU */}
      {isPhoneMenuVisible && (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/30 z-20 backdrop-blur-sm "></div>
      )}
      {isPhoneMenuVisible && (
        <div
          className={`fixed z-40 top-[55px] bg-cBackground  left-0 right-0 p-4 divide-y divide-cStandard/10 ${
            isPhoneMenuVisible ? "slide-fade-in" : "slide-fade-out"
          }`}
        >
          <ul className="space-y-2 pb-2">
            {classicMenu.map((menu, i) => (
              <li key={i} className="">
                <Link
                  href={`${menu.destination}`}
                  className={cn(
                    "w-full block py-2 px-2 rounded-md text-cStandard hover:text-cPrimary hover:bg-gray-50"
                  )}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
          {status === "loading" ? (
            <div></div>
          ) : status === "authenticated" ? (
            <ul className="pt-2 ">
              {authenticatedMenu &&
                authenticatedMenu.map((menu, i) => (
                  <li className="" key={i}>
                    <Link
                      href={menu.destination}
                      className={cn(
                        "w-full block py-2 px-2 rounded-md text-cStandard hover:text-cPrimary hover:bg-gray-50"
                      )}
                    >
                      {" "}
                      {menu.label}{" "}
                    </Link>
                  </li>
                ))}
              <button
                onClick={() => signOut()}
                className="text-left w-full block py-2 px-2 rounded-md text-cStandard hover:text-cPrimary hover:bg-gray-50"
              >
                Déconnexion
              </button>
            </ul>
          ) : (
            <div className="pt-2">
              <Link
                href={`/login`}
                className={cn(
                  "w-full block py-2 px-2 rounded-md hover:text-cPrimary hover:bg-gray-50"
                )}
              >
                <span>Connexion</span>
              </Link>
              <Link
                href={"/register"}
                className={`w-full block py-2 px-2 rounded-md text-indigo-800 hover:text-cPrimary hover:bg-gray-50`}
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      )}

      {isGeneralOverlayVisible && (
        <OverlayComponent
          closeOverlay={() => {
            setIsAuthenticatedMenuVisible(false);
            setIsGeneralOverlayVisible(false);
            if (isPhoneMenuVisible) {
              setIsPhoneMenuVisible((prev) => !prev);
            }
          }}
        />
      )}
    </div>
  );
}
