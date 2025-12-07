"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Dispatch, SetStateAction, useRef } from "react";

export const useUrlFilters = (
  filters: Record<string, string>,
  setFilters: Dispatch<SetStateAction<Record<string, string>>>
) => {
  const router = useRouter();
  // keep a stable ref to the router so we don't have to add it to the
  // dependency array. We'll update the ref whenever `router` changes.
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  // ✅ Read filters from URL on first mount ONLY
  useEffect(() => {
    const initial: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      initial[key] = value;
    });

    // If URL has no params, try to restore the last-used filters from
    // sessionStorage for this pathname. This helps preserve user-selected
    // filters when switching locales (which performs a navigation).
    if (Object.keys(initial).length === 0) {
      try {
        const rawPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        const parts = rawPath.split("/").filter(Boolean);
        const normalized =
          parts.length > 0 && parts[0] === "en"
            ? "/" + parts.slice(1).join("/")
            : rawPath;
        const key = `filters:${normalized}`;
        const saved =
          typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, string>;
          // Debug: log what we're restoring and from which key
          // (helps diagnose unexpected redirects on reload)
          console.log("[useUrlFilters] restoring filters from sessionStorage", {
            key,
            parsed,
            normalized,
            rawPath,
          });

          // When restoring filters after a locale/navigation where the
          // query string is absent, start the pagination at page 1 while
          // restoring the other filter keys.
          parsed.page = "1";
          setFilters(parsed);
          return;
        }
      } catch {
        // ignore sessionStorage errors
      }
    }

    setFilters(initial);
    // Mark as initialized so the sync effect doesn't overwrite the URL
    // before we've read the initial search params.
    initializedRef.current = true;
  }, [searchParams, setFilters]); // run when search params change

  // ✅ Sync filters → URL (safely)
  useEffect(() => {
    // Don't sync filters -> URL until we've initialized from the URL
    // (prevents an empty `filters` state on first render from clearing
    // an existing query string during reload).
    if (!initializedRef.current) return;
    // Build the new query string directly from `filters` so that
    // removing all keys results in an empty query (clears URL params).
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        newParams.set(key, String(value));
      }
    });

    const newSearch = newParams.toString();
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    const currentSearch =
      typeof window !== "undefined"
        ? window.location.search.replace(/^\?/, "")
        : "";

    if (newSearch === currentSearch) return;

    // Prevent an accidental removal of an existing query string during
    // reload/rehydration. If the computed `newSearch` is empty but the
    // current URL has a search string, skip replacing the URL. This avoids
    // the situation where a transient/empty `filters` state clears the
    // browser URL (observed during page reloads).
    if (newSearch === "" && currentSearch !== "") {
      console.log(
        "[useUrlFilters] skipping URL replace because filters are empty but current URL has search",
        { pathname, currentSearch, newSearch }
      );
      return;
    }

    const target = pathname + (newSearch ? `?${newSearch}` : "");
    // Debug: log URL replace intent so we can see when pathname/target
    // might be unexpectedly `/`.
    console.log("[useUrlFilters] sync filters -> URL", {
      pathname,
      currentSearch,
      newSearch,
      target,
    });

    routerRef.current.replace(target, { scroll: false });
  }, [filters]);

  // Persist current filters into sessionStorage scoped to the pathname so
  // that a locale navigation can restore them if the query string isn't
  // present during the navigation lifecycle.
  useEffect(() => {
    try {
      const rawPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      const parts = rawPath.split("/").filter(Boolean);
      const normalized =
        parts.length > 0 && parts[0] === "en"
          ? "/" + parts.slice(1).join("/")
          : rawPath;
      const key = `filters:${normalized}`;
      if (filters && Object.keys(filters).length > 0) {
        sessionStorage.setItem(key, JSON.stringify(filters));
      } else {
        sessionStorage.removeItem(key);
      }
    } catch {
      // ignore storage errors
    }
  }, [filters]);
};
