"use client";

import { useEffect, useState } from "react";
import { languages } from "@/utils/languages";
import { GET_CAR_BY_ID_API } from "@/endpoints";
import DealerSearch from "./DealerSearch";
import type { Dealer, CarAPI } from "@/utils/types";
import TopNavbar from "./TopNavbar";
import Footer from "./Footer";

type Props = {
  lang: "en" | "default";
  slug: string;
};

export default function Home({ lang, slug }: Props) {
  const [data, setData] = useState<{ dealer?: Dealer; cars: CarAPI[] } | null>(
    null
  );
  // Optional local states; kept for future UI hooks
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  void loading;
  void error;

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError(null);

        const idOrName = encodeURIComponent(String(slug));

        // ⛳️ FINAL URL
        const url = `https://api.drivegood.com/${GET_CAR_BY_ID_API}/${idOrName}`;

        // ⛳️ EXACT SAME API CALL (POST + headers)
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch dealer cars");

        const json = await res.json();
        const nextData = (json?.data ?? null) as {
          dealer?: Dealer;
          cars: CarAPI[];
        } | null;
        setData(nextData); // your API wraps everything under data
        // Persist to sessionStorage so language switches can hydrate immediately
        try {
          const key = `dealerData:${idOrName}`;
          if (nextData) sessionStorage.setItem(key, JSON.stringify(nextData));
        } catch {}
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    // Try to hydrate from sessionStorage immediately to avoid initial null during locale switches
    try {
      const key = `dealerData:${encodeURIComponent(String(slug))}`;
      const saved =
        typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
      if (saved) {
        const parsed = JSON.parse(saved) as { dealer?: Dealer; cars: CarAPI[] };
        setData(parsed);
      }
    } catch {}

    getData();
  }, [slug, lang]);

  // Access language to ensure code path remains typed
  const { title, code } = languages[lang];
  void title;
  void code;
  // Debug log for API data
  console.log(data);

  return (
    <main>
      <TopNavbar lang={lang} slug={slug} />
      <DealerSearch
        dealerId={slug}
        initialData={data ?? undefined}
        lang={lang}
      />
      <Footer lang={lang} slug={slug} />
    </main>
  );
}
