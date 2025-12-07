"use client";

import SwitchLanguage from "./SwitchLanguage";
import { Logo } from "@/public/assets";
import { useState } from "react";
import MenuCollapse from "@/public/assets/svg/MenuCollapse";
import { useRouter } from "next/navigation";
import Link from "next/link";
import enJson from "@/json/en.json";
import frJson from "@/json/fr.json";

type Props = {
  lang: "en" | "default";
  slug?: string;
};

const TopNavbar = ({ lang = "default", slug = "" }: Props) => {
  type NavigationI18n = {
    inventory: string;
    blog: string;
    dealerSignUp: string;
    dealerLogin: string;
  };
  const nav: NavigationI18n =
    lang === "en"
      ? (enJson as { navigation: NavigationI18n }).navigation
      : (frJson as { navigation: NavigationI18n }).navigation;
  const inventory = nav?.inventory;
  const blog = nav?.blog;
  const dealerSignUp = nav?.dealerSignUp;
  const dealerLogin = nav?.dealerLogin;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const handleLogoClick = () => {
    router.push("/");
  };
  return (
    <div className="w-full  bg-white shadow-md sticky top-0 z-50">
      {/* MAIN NAV */}
      <div className="flex py-4 justify-between items-center container gap-4">
        <img
          src={Logo.src}
          alt="Good-Logo"
          className="h-18 w-70 cursor-pointer"
          onClick={handleLogoClick}
        />

        {/* LINKS — HIDDEN ON SMALL SCREEN */}
        <div className="hidden md:flex justify-center items-center gap-4">
          <Link
            href="#"
            className="p-3.5 text-xl font-semibold text-gray-700 whitespace-nowrap"
          >
            {inventory}
          </Link>
          <Link
            href="#"
            className="p-3.5 text-xl font-semibold text-gray-700 whitespace-nowrap"
          >
            {blog}
          </Link>
          <Link
            href="#"
            className="p-3.5 text-xl font-semibold text-gray-700 whitespace-nowrap"
          >
            {dealerSignUp}
          </Link>
          <Link
            href="#"
            className="p-3.5 text-xl font-semibold text-gray-700 whitespace-nowrap"
          >
            {dealerLogin}
          </Link>
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex justify-start items-center gap-1.5 lg:gap-6">
          {/* <GlobalSearch /> */}
          <SwitchLanguage lang="default" />

          {/* MENU COLLAPSE — ONLY SMALL SCREEN */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            <MenuCollapse />
          </button>
        </div>
      </div>

      {/* MOBILE COLLAPSE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-96" : "max-h-0 pointer-events-none"
        }`}
      >
        <div className="border-t border-t-gray-600 mt-2 p-4 flex flex-col gap-4 bg-gradient-to-b from-gray-300 to-transparent">
          <Link href="#" className="text-lg font-semibold text-gray-700">
            {inventory}
          </Link>

          <Link href="#" className="text-lg font-semibold text-gray-700">
            {blog}
          </Link>

          <Link href="#" className="text-lg font-semibold text-gray-700">
            {dealerSignUp}
          </Link>

          <Link href="#" className="text-lg font-semibold text-gray-700">
            {dealerLogin}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
