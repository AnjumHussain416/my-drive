"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface PaginationProps<T> {
  items: T[];
  perPage: number;
  onPageChange?: (pageItems: T[]) => void;
  filters?: Record<string, string>; // current filter values
  fields?: (string | { key: string })[]; // list of filter fields
  /** Callback invoked when the page number changes (after navigation) */
  onPageNumberChange?: (page: number) => void;
}

export default function Pagination<T>({
  items,
  perPage,
  onPageChange,
  filters = {},
  fields = [],
  onPageNumberChange,
}: PaginationProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const totalPages = Math.ceil(items.length / perPage);

  // --- SLIDING WINDOW LOGIC (always 5 pages) ---
  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    let start = currentPage - 2;
    let end = currentPage + 2;

    if (start < 1) {
      start = 1;
      end = 5;
    }
    if (end > totalPages) {
      end = totalPages;
      start = totalPages - 4;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageNumbers = getPageNumbers();

  // --- Pagination Logic ---
  // We compute the current page's items inside the effect and depend only on
  // `currentPage` and `items.length` (plus `onPageChange`) to avoid a render
  // loop where `onPageChange` sets parent state which triggers this effect
  // again. Using `items.length` guards against content changes while
  // avoiding deep equality checks.
  useEffect(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pageItems = items.slice(start, end);
    onPageChange?.(pageItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, items.length, onPageChange]);

  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages) return;

    const params = new URLSearchParams();

    // ✅ keep active filters ONLY
    fields.forEach((f) => {
      const key = typeof f === "string" ? f : f.key;
      const value = filters[key];
      if (value) params.set(key, value);
    });

    // ✅ page always controlled ONLY here
    params.set("page", String(page));

    try {
      const paramsStr = params.toString();
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : "/";
      const target = pathname + (paramsStr ? `?${paramsStr}` : "");
      // Debug: log navigation intent so reload/replace issues can be traced
      console.log("[Pagination] navigating to", {
        target,
        paramsStr,
        pathname,
      });
      await router.push(target, { scroll: false });
      // Inform parent about the new page so it can keep its filter state
      // in sync with the URL (avoids parent-side effects overwriting page)
      onPageNumberChange?.(page);

      // After navigation, always scroll to the first <main> element so the
      // user is positioned at the top of the main content. Fall back to
      // document.body if no <main> exists.
      if (typeof window !== "undefined") {
        const el = document.querySelector("main") || document.body;
        if (el && typeof (el as Element).scrollIntoView === "function") {
          (el as Element).scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } catch {
      // ignore navigation errors and do a best-effort scroll
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex items-center justify-center lg:justify-end space-x-2 mt-8">
      <button
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 lg:px-4 lg:py-2 text-gray-800 font-medium text-xs lg:text-sm border-none bg-gray-600 hover:bg-gray-200 rounded-md disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => changePage(page)}
          className={`px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-600 rounded-md text-gray-450 font-medium text-xs lg:text-sm cursor-pointer hover:bg-gray-100 ${
            currentPage === page
              ? "bg-gray-1100 hover:bg-gray-1000 text-white"
              : ""
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 lg:px-4 lg:py-2 text-gray-800 font-medium text-xs lg:text-sm bg-gray-600 hover:bg-gray-200 border-none rounded-md disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
