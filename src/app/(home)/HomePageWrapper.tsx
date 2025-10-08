"use client";

import { cn } from "@/src/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogIn, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useGlobalStore } from "@/src/store/useGlobalStore";
import { Company } from "@/src/lib/type";

interface AuthenticatedMenuList {
  label: string;
  destination: string;
}

export default function HomePageWrapper() {
  const [isAuthenticatedMenuVisible, setIsAuthenticatedMenuVisible] =
    useState<boolean>(false);
  const [authenticatedMenu, setAuthenticatedMenu] =
    useState<AuthenticatedMenuList[]>();

  const [extraMenu, setExtraMenu] =
    useState<{ label: string; destination: string }[]>();

  const { data: session, status } = useSession();

  const setIsGeneralOverlayVisible = useGlobalStore(
    (state) => state.setIsGeneralOverlayVisible
  );

  const fetchExtraMenu = useCallback(async () => {
    if (session && session.user.profileType === "adminUser") {
      const res = await fetch(`/api/user/admin/${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        const companyId = data.data.idCompany as number;

        const res2 = await fetch(`/api/company/${companyId}`);
        const dataRes = await res2.json();
        const companyInfo: Company = dataRes.data;

        let menu = [];
        if (companyInfo.reservationIsActive) {
          menu.push({
            label: "Espaces",
            destination: `/${companyInfo.slug}/spaces`,
          });
        }
        if (companyInfo.virtualOfficeIsActive) {
          menu.push({
            label: "Domiciliation",
            destination: `/${companyInfo.slug}/business-address`,
          });
        }
        setExtraMenu(menu);
      }
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      let data: AuthenticatedMenuList[] = [];
      switch (session.user.profileType) {
        case "basicUser":
          data = [
            {
              label: "Tableau de bord",
              destination: `/${session.user.companySlug}/dashboard`,
            },
            {
              label: "Mes Réservations",
              destination: `/${session.user.companySlug}/dashboard/reservations`,
            },
            {
              label: "Paramètres du profil",
              destination: `/${session.user.companySlug}/dashboard/profile`,
            },
          ];
          break;
        case "adminUser":
          data = [
            {
              label: "Tableau de bord",
              destination: `/${session.user.companySlug}/admin`,
            },
            {
              label: "Paramètres",
              destination: `/${session.user.companySlug}/admin/parameters`,
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

      fetchExtraMenu();
    }
  }, [session, fetchExtraMenu]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <nav className="container p-6 mx-auto lg:flex lg:justify-between lg:items-center">
        <div className="flex items-center justify-between">
          <a href="/" className="font-bold text-3xl">
            <Image
              className="w-auto h-6 sm:h-[50px] "
              src="/images/logo.webp"
              alt="Logo"
              width={323}
              height={219}
            />
          </a>

          {/* Mobile menu button non fonctionnelle sans JS */}
          <div className="flex lg:hidden">
            <button
              type="button"
              aria-label="toggle menu"
              className="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu toujours visible sur grand écran */}
        <div className="hidden lg:flex lg:items-center lg:space-x-8 mt-4 lg:mt-0">
          {extraMenu &&
            extraMenu.map((menu, i) => (
              <Link
                key={i}
                href={menu.destination}
                className="text-gray-600 dark:text-gray-200 hover:text-cDefaultPrimary-200 font-medium transition-colors"
              >
                {menu.label}
              </Link>
            ))}
          <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Home
          </a>
          <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Components
          </a>
          <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Pricing
          </a>
          <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Contact
          </a>

          {/* <a
            href="#"
            className="ml-4 px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition"
          >
            Get started
          </a> */}

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
                className={`flex items-center justify-center gap-2 font-medium text-gray-900`}
              >
                <User className="w-5" />
                <div className="flex items-center justify-center gap-1">
                  <span>Mon compte</span>
                  <ChevronDown
                    className={`w-4 duration-300 ${isAuthenticatedMenuVisible ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              {isAuthenticatedMenuVisible && authenticatedMenu && (
                <div className="bg-white shadow-md absolute top-[32px] right-0 rounded-md py-2 w-[200px]  ">
                  <ul>
                    {authenticatedMenu.map((menu, i) => (
                      <li key={i}>
                        <Link
                          href={menu.destination}
                          className="w-full block py-2 px-4 text-sm rounded-md text-neutral-700 hover:text-cDefaultPrimary-200 hover:bg-gray-50"
                        >
                          {menu.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => signOut()}
                    className="text-left w-full block py-2 px-4 text-sm rounded-md text-neutral-700 hover:text-cDefaultPrimary-200 hover:bg-gray-50"
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
                  "text-gray-700 hover:text-cDefaultPrimary-200"
                )}
              >
                <LogIn className=" w-5 h-5" />
                <span>Connexion</span>
              </Link>
              {/* <Link
                                        href={"/register"}
                                        className={`font-medium px-4 py-2 rounded-md transition-opacity  bg-indigo-900 text-white hover:opacity-90`}
                                    >
                                        Inscription
                                    </Link> */}
            </div>
          )}
        </div>
      </nav>

      <div className="container px-6 py-16 mx-auto text-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white lg:text-4xl">
            Bienvenue sur Clé-o
          </h1>
          <p className="mt-6 text-gray-500 dark:text-gray-300">
            Vous êtes un centre d’affaires ? Clé-o vous aide à gérer vos espaces
            de coworking et vos services de domiciliation en toute simplicité.
          </p>
          <button className="px-5 py-2 mt-6 text-sm font-medium text-white bg-cDefaultPrimary-100 rounded-lg hover:bg-cDefaultPrimary-200 duration-200">
            Acheter la licence
          </button>
        </div>

        <div className="flex justify-center mt-10">
          <Image
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1632&q=80"
            alt="Dashboard Preview"
            width={1280}
            height={600}
            className="object-cover w-full h-96 rounded-xl lg:w-4/5"
          />
        </div>
      </div>
    </section>
    // <div className="relative min-h-screen">
    //   {/* Main Content */}
    //   <div className="flex flex-col">
    //     <section className="relative min-h-screen flex items-center justify-center bg-indigo-900 overflow-hidden pt-28">
    //       <Landing />
    //     </section>
    //     <section className="pt-[150px] pb-16 xl:py-16 bg-white">
    //       <Solutions />
    //     </section>
    //     <section className="py-16 bg-indigo-50">
    //       <Domiciliation />
    //     </section>
    //     <section className="py-16 bg-gray-50">
    //       <GestionEspaces />
    //     </section>
    //     <section className="py-16 bg-white">
    //       <WorkArea />
    //     </section>
    //     <section className="py-16 bg-indigo-900 text-white">
    //       <Testimonials />
    //     </section>
    //     <section className="py-16 bg-white">
    //       <Contact />
    //     </section>
    //   </div>
    // </div>
  );
}
