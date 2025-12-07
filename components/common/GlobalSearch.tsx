"use client";

import SearchIcon from "@/public/assets/svg/search";
import { useState, useRef, useEffect } from "react";
import Separator from "./separator";

interface SearchResult {
  id: number;
  name: string;
}

interface GlobalSearchProps {
  placeholder?: string;
  fetchResults?: (query: string) => Promise<SearchResult[]>; // API callback
}

export default function GlobalSearch({
  placeholder = "Search...",
  fetchResults,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Simulated or API search
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    if (query.trim() !== "") {
      timeout = setTimeout(async () => {
        let data: SearchResult[] = [];

        if (fetchResults) {
          data = await fetchResults(query);
        } else {
          // static demo data
          const demo = [
            { id: 1, name: "BUICK Encore (2015)" },
            { id: 2, name: "KIA Sorento (2014)" },
            { id: 3, name: "HYUNDAI Kona (2018)" },
            { id: 4, name: "DODGE Ram 1500 Truck (2014)" },
          ];
          data = demo.filter((d) =>
            d.name.toLowerCase().includes(query.toLowerCase())
          );
        }

        setResults(data);
      }, 400);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [query, fetchResults]);

  return (
    <div className="relative" ref={boxRef}>
      {/* GLOBAL SEARCH ICON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer"
      >
        <SearchIcon fillColor="#363636" className="w-6 h-6" />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-md p-3 z-50">
          {/* SEARCH FIELD */}
          <div className="flex items-center border border-gray-200 rounded-md px-3 py-2">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setQuery(v);
                if (v.trim() === "") setResults([]);
              }}
              className="w-full outline-none text-gray-700 text-base bg-transparent"
              placeholder={placeholder}
            />
            <SearchIcon fillColor="#4b5563" className="w-5 h-5" />
          </div>
          <div className="bg-gray-200 h-px mt-4" />
          {/* RESULTS LIST */}
          <div className="max-h-60 overflow-y-auto mt-3 space-y-1">
            {results.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-700 text-base"
              >
                {item.name}
              </div>
            ))}

            {results.length === 0 && query !== "" && (
              <p className="text-gray-500 text-sm text-center py-3">
                No results found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
