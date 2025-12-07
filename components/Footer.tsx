"use client";
// import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FacebookLogo, InstagramLogo, Logo } from "@/public/assets";
import Separator from "./common/separator";
import enJson from "@/json/en.json";
import frJson from "@/json/fr.json";

type Props = {
  lang: "en" | "default";
  slug: string;
};

export default function Footer({ lang, slug }: Props) {
  const router = useRouter();

  // Choose translation based on lang (static JSON imports)
  // "default" falls back to French to preserve current prop type.
  type LangKey = "en" | "default";
  type FooterI18n = {
    followUs: string;
    columns: {
      column1: {
        title: string;
        links: {
          inventory: string;
          blog: string;
          contact: string;
          dealerSignUp: string;
          dealersLogin: string;
        };
      };
      column2: {
        title: string;
        links: {
          under10000: string;
          under5000: string;
          convertible: string;
          coupe: string;
          hatchback: string;
          minivan: string;
          none: string;
        };
      };
      column3: {
        title: string;
        links: {
          truck: string;
          sedan: string;
          suv: string;
          rv: string;
        };
      };
    };
  };

  const translations: Record<LangKey, FooterI18n> = {
    en: (enJson as { footer: FooterI18n }).footer,
    default: (frJson as { footer: FooterI18n }).footer,
  };
  const t: FooterI18n = translations[lang as LangKey];

  const handleLogoClick = () => {
    router.push("/");
  };

  const columns = [
    {
      title: t.columns.column1.title,
      links: [
        { label: t.columns.column1.links.inventory, href: "#" },
        { label: t.columns.column1.links.blog, href: "#" },
        { label: t.columns.column1.links.contact, href: "#" },
        { label: t.columns.column1.links.dealerSignUp, href: "#" },
        { label: t.columns.column1.links.dealersLogin, href: "#" },
      ],
    },
    {
      title: t.columns.column2.title,
      links: [
        { label: t.columns.column2.links.under10000, href: "#" },
        { label: t.columns.column2.links.under5000, href: "#" },
        { label: t.columns.column2.links.convertible, href: "#" },
        { label: t.columns.column2.links.coupe, href: "#" },
        { label: t.columns.column2.links.hatchback, href: "#" },
        { label: t.columns.column2.links.minivan, href: "#" },
        { label: t.columns.column2.links.none, href: "#" },
      ],
    },
    {
      title: t.columns.column3.title,
      links: [
        { label: t.columns.column3.links.truck, href: "#" },
        { label: t.columns.column3.links.sedan, href: "#" },
        { label: t.columns.column3.links.suv, href: "#" },
        { label: t.columns.column3.links.rv, href: "#" },
      ],
    },
  ];

  return (
    <div className="w-full py-4">
      <div className="container grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Follow Us */}
        <div className="col-span-1 pl-6 justify-center lg:justify-start flex">
          <div className="flex flex-col gap-4">
            <img
              src={Logo.src}
              alt="Drive Logo"
              className="h-15 w-50 cursor-pointer"
              onClick={handleLogoClick}
            />

            <p className="text-xl text-gray-1200 hover:text-black font-semibold ml-3.5">
              {t.followUs}
            </p>

            <div className="flex justify-center items-center lg:justify-start gap-4 ml-2.5">
              <Link href="#">
                <img
                  width={36}
                  height={36}
                  src={FacebookLogo.src}
                  alt="Facebook"
                />
              </Link>
              <Link href="#">
                <img
                  width={36}
                  height={36}
                  src={InstagramLogo.src}
                  alt="Instagram"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Columns */}
        {columns.map((col, idx) => (
          <div key={idx} className="col-span-1 pb-6 lg:pb-0 l-6">
            <div className="grid gap-4">
              {col.title && (
                <p className="text-xl text-black font-semibold text-center lg:text-start">
                  {col.title}
                </p>
              )}
              {col.links.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="text-xl text-gray-1200 hover:text-black font-semibold text-center lg:text-start"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4 h-0.5 bg-gray-1100" />

      <div className="container text-gray-1200 hover:text-black text-sm lg:text-2xl flex justify-center lg:justify-start items-center font-semibold">
        ©2025 All Rights Reserved by{" "}
        <Link href="#">
          <img
            src={Logo.src}
            alt="Good-Logo"
            className="inline-block h-8 w-[80px] cursor-pointer"
            onClick={handleLogoClick}
          />
        </Link>
      </div>
    </div>
  );
}
