"use client";
import { CarAPI } from "@/utils/types";
import React, { useState, forwardRef, useImperativeHandle } from "react";

interface SearchFieldProps {
  placeholder?: string;
  buttonText?: string;
  /** Array of field names the component will search within (optional) */
  searchFields?: string[];
  /** Optional dataset to search in; if omitted the component will only return an empty array */
  data?: CarAPI[];
  /** Called after the component performs filtering. Receives filtered array and the raw query. */
  onSearch: (filtered: CarAPI[] | null, value?: string) => void;
  /** Optional callback invoked when a search is starting */
  onSearchStart?: (term?: string) => void;
  /** Optional callback invoked after the search has been dispatched to `onSearch` */
  onSearchComplete?: (filtered: CarAPI[] | null, term?: string) => void;
  /** If true, call `onClearFilters` before performing the search */
  clearFiltersOnSearch?: boolean;
  /** Keys to preserve when clearing filters (default: ['sort']) */
  preserveFilterKeys?: string[];
  /** Called when the component wants the parent to clear filters. Parent should implement preservation logic. */
  onClearFilters?: (preserveKeys?: string[]) => void;
  /** Optional setter from parent to toggle searching state */
  setSearching?: (b: boolean) => void;
}

export type SearchFieldRef = {
  reset: () => void;
  setSearchValue: (term: string) => void;
  performSearch: (term: string) => void;
};

const SearchField = forwardRef<SearchFieldRef, SearchFieldProps>(
  (
    {
      placeholder = "Search...",
      buttonText = "Search",
      searchFields,
      data,
      onSearch,
      onSearchStart,
      onSearchComplete,
      clearFiltersOnSearch = false,
      preserveFilterKeys = ["sort"],
      onClearFilters,
      setSearching,
    },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = useState("");

    const performFilter = (q: string): CarAPI[] => {
      if (!data || data.length === 0) return [];

      const query = (q || "").trim().toLowerCase();
      if (!query) return [...data];

      // Split by spaces or dash
      const parts = query.split(/[\s-]+/);

      if (!searchFields || searchFields.length === 0) return [...data];

      return data.filter((item) =>
        parts.every((part) =>
          searchFields.some((f) => {
            const v = item[f as keyof CarAPI];
            if (v === undefined || v === null) return false;
            return String(v).toLowerCase().includes(part);
          })
        )
      );
    };

    useImperativeHandle(ref, () => ({
      reset: () => setSearchTerm(""),
      setSearchValue: (term: string) => {
        setSearchTerm(term);
      },
      performSearch: (term: string) => {
        try {
          setSearching?.(true);
          onSearchStart?.(term);
          if (clearFiltersOnSearch && onClearFilters) {
            onClearFilters(preserveFilterKeys);
          }
          const filtered = performFilter(term);
          onSearch(filtered, term);
          onSearchComplete?.(filtered, term);
        } finally {
          // Defer clearing searching state to avoid sync setState inside event handlers
          setTimeout(() => setSearching?.(false), 0);
        }
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSearching?.(true);
        onSearchStart?.(searchTerm);
        if (clearFiltersOnSearch && onClearFilters) {
          onClearFilters(preserveFilterKeys);
        }
        const filtered = performFilter(searchTerm);
        onSearch(filtered, searchTerm);
        onSearchComplete?.(filtered, searchTerm);
      } finally {
        setTimeout(() => setSearching?.(false), 0);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full rounded-xl border-8 border-gray-600 overflow-hidden h-15"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 focus:outline-none placeholder:text-gray-200 text-base text-black"
        />

        <button
          type="submit"
          className="cursor-pointer px-6 py-3 bg-gray-1100 text-white font-medium hover:bg-gray-1000 transition"
        >
          {buttonText}
        </button>
      </form>
    );
  }
);

SearchField.displayName = "SearchField";

export default SearchField;
