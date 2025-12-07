"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

// Accept legacy "fr" externally but normalize internally to "default" (FR)
type Lang = "en" | "default" | "fr";

type Props = {
  lang: Lang;
};

export default function SwitchLanguage({ lang }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const onSelectChange = (nextLocale: string) => {
    const currentLocale = getActiveLocale();
    if (nextLocale === currentLocale) return;

    startTransition(() => {
      const stripLocaleFromPath = (p: string | null | undefined) => {
        if (!p) return "/";
        const path = p.startsWith("/") ? p : `/${p}`;
        const parts = path.split("/").filter(Boolean);
        if (parts.length === 0) return "/";
        if (parts[0] === "en" || parts[0] === "fr")
          return "/" + parts.slice(1).join("/");
        return path;
      };

      const dest = stripLocaleFromPath(pathname);
      // Preserve current query params but reset only the page to 1 so
      // filters persist across locale changes while pagination returns
      // to the first page (SEO-friendly behavior).
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search || "" : ""
      );
      params.set("page", "1");
      const queryStr = params.toString();
      const query = queryStr ? `?${queryStr}` : "";

      // Build locale-aware destination path manually because we're using
      // next/navigation router which ignores a locale option. With
      // localePrefix 'as-needed', only non-default locales get a prefix.
      const normalizedNext = nextLocale === "fr" ? "default" : nextLocale;
      const localePrefixedDest =
        normalizedNext === "en"
          ? `/${normalizedNext}${dest === "/" ? "" : dest}`
          : dest;

      router.replace(`${localePrefixedDest}${query}`);
    });
  };

  const getActiveLocale = () => {
    const parts = pathname.split("/").filter(Boolean);
    const firstSegment = parts[0];

    if (firstSegment === "en") {
      return "en"; // en from URL
    }
    if (firstSegment === "fr") {
      return "default"; // treat fr segment as default (FR)
    }

    // fallback to provided prop when URL has no locale
    return lang === "fr" ? "default" : lang;
  };

  const getButtonClass = (locale: "en" | "default") => {
    const activeLocale = getActiveLocale();
    const isActive = activeLocale === locale;

    return `px-4 py-2.5 rounded-none font-semibold transition-colors duration-200 cursor-pointer ${
      isActive
        ? "bg-gray-1100 hover:bg-gray-1000 text-white"
        : "bg-transparent text-gray-450 hover:bg-white/20"
    }`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => onSelectChange("default")}
        disabled={isPending}
        className={getButtonClass("default")}
      >
        FR
      </button>
      <button
        onClick={() => onSelectChange("en")}
        disabled={isPending}
        className={getButtonClass("en")}
      >
        EN
      </button>
    </div>
  );
}
