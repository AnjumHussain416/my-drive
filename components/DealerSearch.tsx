"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { FilterField } from "@/types/global";
import CardGrid from "../app/[slug]/CardGrid";
import SearchField, { SearchFieldRef } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";

import enJson from "@/json/en.json";
import frJson from "@/json/fr.json";
import Loader from "@/components/common/Loader";
import NoFound from "@/components/common/NoFound";
import { VehicleFilterPanel } from "@/components/common/VehicleFilterPanel";

import { applyFiltersToData, CarAPI, Dealer } from "@/utils/types";
import { useUrlFilters } from "@/hooks/useUrlFilters";

const DealerSearch = ({
  dealerId,
  initialData,
  lang,
}: {
  dealerId: string | number;
  initialData?: { dealer?: Dealer; cars: CarAPI[] };
  lang: "default" | "en";
}) => {
  type DealerI18n = {
    totalVehicles: string;
    searchPlaceholder: string;
    searchButton: string;
    loading: string;
  };
  const dealerT: DealerI18n = (
    lang === "default" ? frJson.dealer : enJson.dealer
  ) as DealerI18n;
  const dealerParam = String(dealerId ?? "");
  const dealerIsNumeric = /^\d+$/.test(dealerParam);
  // Keep a stable key if needed for child resets; avoid unused warnings
  const dealerKey = dealerIsNumeric
    ? dealerParam
    : encodeURIComponent(dealerParam);
  void dealerKey;
  type SearchState = {
    allCars: CarAPI[];
    filteredCars: CarAPI[];
    totalItems: number;
  };
  const [searchedCars, setSearchedCars] = useState<CarAPI[] | null>(null);

  const [searchState, setSearchState] = useState<SearchState>({
    allCars: initialData?.cars || [],
    filteredCars: initialData?.cars || [],
    totalItems: initialData?.cars?.length || 0,
  });
  const perPage = 12;
  const [carsForPage, setCarsForPage] = useState<CarAPI[]>(
    (initialData?.cars || []).slice(0, perPage)
  );
  const [isFetching, setIsFetching] = useState<boolean>(!initialData);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize data once when it first arrives, without clobbering active filters/searches
  useEffect(() => {
    if (!initialized && initialData?.cars?.length) {
      // Defer state updates to next tick to avoid cascade warnings
      setTimeout(() => {
        setInitialized(true);
        const next = {
          allCars: initialData.cars,
          filteredCars: initialData.cars,
          totalItems: initialData.cars.length,
        };
        setSearchState(next);
        setIsFetching(false);
        setCarsForPage(initialData.cars.slice(0, perPage));
      }, 0);
    }
  }, [initialData, perPage, initialized]);

  const mountTimeRef = useRef<number | null>(null);
  const loggedRef = useRef(false);
  const [lastSearchTerm, setLastSearchTerm] = useState<string>("");

  const [filters, setFilters] = useState({});

  const searchRef = useRef<SearchFieldRef | null>(null);

  const handleClearFiltersFromSearch = () => {
    setFilters((prev) => {
      const p = prev as Record<string, string> | undefined;
      const preserved: Record<string, string> = {};
      if (p && p.sort) preserved.sort = p.sort;
      // Always reset to page 1 when filters are changed via search
      preserved.page = "1";
      return preserved;
    });
    setExternalResetSignal((s) => s + 1);
  };

  // Signal used to tell child panels to clear optimistic overrides when an
  // external reset (like a search) occurs. We increment it to trigger a
  // useEffect in `VehicleFilterPanel`.
  const [externalResetSignal, setExternalResetSignal] = useState<number>(0);
  const handleOnFilter = useCallback(
    (res: CarAPI[]) => {
      // Read current filters from the URL to preserve them
      const params = new URLSearchParams(window.location.search);
      params.set("page", "1");

      // Only update from filters if not in the middle of a text search
      if (!isSearching) {
        setSearchState((prev) => ({
          ...prev,
          filteredCars: res,
          totalItems: res.length,
        }));
        setCarsForPage(res.slice(0, perPage));
        setIsFetching(false);
      }
    },
    [perPage, isSearching]
  );

  useEffect(() => {
    mountTimeRef.current = performance.now();
  }, []);

  // log how long until data is visible on the client
  useEffect(() => {
    if (
      !loggedRef.current &&
      typeof mountTimeRef.current === "number" &&
      searchState.totalItems >= 0
    ) {
      const elapsed = Math.round(performance.now() - mountTimeRef.current);
      console.log(
        `[DealerSearch] data visible after ${elapsed}ms for dealer=${dealerParam} (items=${searchState.totalItems})`
      );
      loggedRef.current = true;
    }
  }, [searchState.totalItems, dealerParam]);

  // Effect to reset the isSearching flag AFTER the search results have been rendered.
  useEffect(() => {
    if (isSearching) {
      // defer to avoid synchronous setState inside effect
      setTimeout(() => setIsSearching(false), 0);
    }
    // This should only run when the filtered cars from a search are updated.
  }, [searchState.filteredCars, isSearching]);

  // (URL restore handled by `useUrlFilters`)

  useUrlFilters(filters, setFilters);
  // Apply filters immediately when they change, but ignore changes that only
  // affect the `page` query param (pagination) so navigating pages doesn't
  // cause the parent to reset to the first page.
  const prevAppliedFiltersRef = useRef<string>("");
  const prevAllCarsRef = useRef<CarAPI[] | null>(null);
  useEffect(() => {
    if (!searchState.allCars) return;

    // Detect dataset changes so filters re-apply when new data arrives
    const datasetChanged = prevAllCarsRef.current !== searchState.allCars;
    prevAllCarsRef.current = searchState.allCars;

    // Build filters object excluding pagination
    // exclude `page` from applied filters
    const f = { ...(filters as Record<string, string>) };
    delete f.page;
    const key = JSON.stringify(f || {});

    // If non-page filters haven't changed, do nothing. We still want to
    // re-run when the dataset being filtered changes (searchedCars/allCars),
    // so we skip only when the non-page filters are identical to last
    // applied.
    if (
      !datasetChanged &&
      prevAppliedFiltersRef.current === key &&
      !searchedCars
    )
      return;

    prevAppliedFiltersRef.current = key;

    const filtered = applyFiltersToData(f, searchedCars ?? searchState.allCars);
    // defer to avoid synchronous setState inside effect
    setTimeout(() => handleOnFilter(filtered), 0);
    // We intentionally include searchedCars and allCars so changes to data
    // re-run the filter even if non-page filters are unchanged.
  }, [filters, searchedCars, searchState.allCars, handleOnFilter]);

  // Track the last search term so we can clear it when the user interacts
  // with the filters (per your requirement). Empty string means no active
  // text search.

  const handleFilterChange = (
    field: FilterField,
    value: string | number | null
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: "1" }));
    // If there was an active text search, clear it so filters apply to full data
    if (lastSearchTerm) {
      searchRef.current?.reset();
      setLastSearchTerm("");
      setSearchedCars(null);
    }
  };
  console.log("check data", dealerId, initialData, carsForPage);

  // Duplicate guard (remove old ref-based initializer)
  return (
    <div className="container py-6 h-full flex flex-col lg:flex-row lg:justify-start gap-10 w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-1100 leading-12">
          {dealerT.totalVehicles}
          <br /> {searchState.totalItems}
        </h1>

        <VehicleFilterPanel
          lang={lang}
          cars={searchState.allCars}
          allDataForParentFilter={searchState.allCars}
          values={filters}
          externalResetSignal={externalResetSignal}
          onReset={() => {
            // Reset filters and ensure page resets to 1
            setFilters({ page: "1" });
            searchRef.current?.reset();
          }}
          onChange={(field, value) => handleFilterChange(field, value)}
          config={{
            show: [
              "sort",
              "make",
              "model",
              "minYear",
              "maxYear",
              "minPrice",
              "maxPrice",
              "mileage",
              "transmission",
              "body",
              "color",
            ],
          }}
        />
      </div>
      <div
        suppressHydrationWarning
        className="relative flex flex-col gap-6 w-full"
      >
        {(isFetching || (!initialized && searchState.totalItems === 0)) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
            <Loader lang={lang} />
          </div>
        )}
        <SearchField
          ref={searchRef}
          placeholder={dealerT.searchPlaceholder}
          buttonText={dealerT.searchButton}
          searchFields={["car_year", "maker", "model"]}
          data={initialData?.cars || []}
          setSearching={setIsSearching}
          clearFiltersOnSearch={true}
          preserveFilterKeys={["sort"]}
          onClearFilters={handleClearFiltersFromSearch}
          onSearch={async (filtered, value) => {
            const term = value ?? "";
            setLastSearchTerm(term);
            const searchResults = filtered ?? [];
            setSearchedCars(searchResults);
            setSearchState((prev) => ({
              ...prev,
              filteredCars: searchResults,
              totalItems: searchResults.length,
            }));
            setCarsForPage(searchResults.slice(0, perPage));
            setIsFetching(false);
          }}
        />
        {initialized && searchState?.totalItems === 0 && !isFetching ? (
          <div className="w-full">
            <NoFound />
          </div>
        ) : (
          <>
            <CardGrid cars={carsForPage} isError={false} />
          </>
        )}

        <Pagination
          items={searchState.filteredCars}
          perPage={perPage}
          onPageChange={setCarsForPage}
          filters={filters as Record<string, string>}
          fields={Object.keys(filters)}
          onPageNumberChange={(page) =>
            setFilters((prev) => ({
              ...(prev as Record<string, string>),
              page: String(page),
            }))
          }
        />
      </div>
    </div>
  );
};

export default DealerSearch;
