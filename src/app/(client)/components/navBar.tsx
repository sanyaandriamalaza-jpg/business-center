"use client"

import { cn } from '@/src/lib/utils';
import { AlignJustify, LogIn, X } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function NavBar({ isHomePage }: { isHomePage: boolean }) {
  const [navBgWhite, setNavBgWhite] = useState<boolean>(false);
  const [isPhoneMenuVisible, setIsPhoneMenuVisible] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      setNavBgWhite(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const classicMenu = [
    // {
    //   label: "Espaces",
    //   destination: "/spaces"
    // },
    {
      label: "Domiciliation",
      destination: "/business-address"
    },
    {
      label: "Tarifs",
      destination: "/pricing"
    },
    {
      label: "A propos",
      destination: "/about"
    },
    {
      label: "Contact",
      destination: "/contact"
    },
  ]



  return (
    <div>
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-colors duration-300 ",
          isHomePage ? ((navBgWhite) ? "bg-white shadow-md" : "bg-transparent") : "bg-white shadow-md"
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <Link
            href="/"
            className="text-2xl font-bold text-white"
            style={{ color: isHomePage ? (navBgWhite ? "#341a6f" : "white") : "#341a6f" }}
          >
            SprayHive
          </Link>
          <ul className="hidden lg:flex gap-8 font-medium transition-colors text-white ">
            {
              classicMenu.map((menu, i) => (
                <li key={i}>
                  <Link
                    href={`${menu.destination}`}
                    className={cn(
                      " transition-colors",
                      isHomePage ? ((navBgWhite) ? "text-gray-700 hover:text-indigo-900" : "text-white hover:text-indigo-100") : "text-gray-700 hover:text-indigo-900"
                    )}
                  >
                    {menu.label}
                  </Link>
                </li>

              ))
            }
          </ul>
          <div className="hidden lg:flex gap-4 items-center">
            <Link
              href={`/login`}
              className={cn(
                "flex items-center gap-1 transition-colors font-medium",
                isHomePage ? (navBgWhite ? "text-gray-700 hover:text-indigo-900" : "text-white hover:text-indigo-100") : "text-gray-700 hover:text-indigo-900"

              )}
            >
              <LogIn className=" w-5 h-5" />
              <span>Connexion</span>
            </Link>
            <Link
              href={"/register"}
              className={`font-medium px-4 py-2 rounded-md  transition-opacity 
                ${isHomePage ? (navBgWhite
                  ? "bg-indigo-900 text-white hover:opacity-90"
                  : "text-indigo-900 hover:opacity-90 bg-white") : "bg-indigo-900 text-white hover:opacity-90"
                }
                  `}
            >
              Inscription
            </Link>
          </div>
          <div className='block lg:hidden'>
            <button onClick={() => {
              setIsPhoneMenuVisible(prev => !prev)
              if (isPhoneMenuVisible) {
                setNavBgWhite(false)
              } else {
                setNavBgWhite(true)
              }
            }} className='h-[40px] w-[40px] flex items-center justify-center text-white'>
              {
                isPhoneMenuVisible ?
                  <X className='text-gray-800' /> :
                  <AlignJustify className='text-white' />
              }
            </button>
          </div>
        </div>
      </nav>
        {/* PHONE MENU */}
        {
          isPhoneMenuVisible &&
          <div className={`fixed z-20 top-[55px] bg-white left-0 right-0 p-4 divide-y divide-gray-100 ${isPhoneMenuVisible ? 'slide-fade-in' : 'slide-fade-out'}`}>
            <ul className="space-y-2 pb-2">
              {
                classicMenu.map((menu, i) => (
                  <li key={i} className=''>
                    <Link
                      href={`${menu.destination}`}
                      className={cn('w-full block py-2 px-2 rounded-md hover:text-indigo-900 hover:bg-gray-50')}
                    >
                      {menu.label}
                    </Link>
                  </li>
                ))
              }
            </ul>
            <div className="pt-2">
              <Link
                href={`/login`}
                className={cn('w-full block py-2 px-2 rounded-md hover:text-indigo-900 hover:bg-gray-50')}
              >
                <span>Connexion</span>
              </Link>
              <Link
                href={"/register"}
                className={`w-full block py-2 px-2 rounded-md text-indigo-800 hover:text-indigo-900 hover:bg-gray-50`}
              >
                Inscription
              </Link>
            </div>
          </div>
        }
    </div>
  )
}
