"use client";

import React from "react";
import enJson from "@/json/en.json";
import frJson from "@/json/fr.json";

type LangKey = "en" | "default";

type DealerI18n = {
  totalVehicles: string;
  searchPlaceholder: string;
  searchButton: string;
  loading: string;
};

type Props = {
  lang: LangKey;
};

const Loader: React.FC<Props> = ({ lang }) => {
  const dealerT: DealerI18n =
    lang === "en"
      ? (enJson as { dealer: DealerI18n }).dealer
      : (frJson as { dealer: DealerI18n }).dealer;
  return (
    <div className="absolute inset-0 bg-white/60 dark:bg-black/40 z-50 flex items-center justify-center">
      <svg
        className="w-10 h-10 text-primary-blue-400 animate-spin"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="sr-only">{dealerT.loading || "Loading..."}</span>
    </div>
  );
};

export default Loader;
