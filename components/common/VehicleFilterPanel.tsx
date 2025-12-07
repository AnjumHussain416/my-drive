"use client";

import React, { useMemo, useState, useEffect } from "react";
import enJson from "@/json/en.json";
import frJson from "@/json/fr.json";

import { FilterField, FiltersConfig, FilterValues } from "@/types/global";
import { CarAPI } from "@/utils/types";
import { getUnique } from "@/utils/helper";
import { SelectFilter } from "./SelectFilter";
import { InputFilter } from "./InputFilter";

interface FilterPanelProps {
  cars: CarAPI[];
  config: FiltersConfig;
  values: FilterValues;
  onChange: (field: FilterField, value: string | number | null) => void;
  onReset: () => void;
  // Optional external reset signal: when this number changes the panel should
  // clear any optimistic local overrides (used when a parent triggers a global
  // reset, for example a search that clears filters).
  externalResetSignal?: number;
  // Optional full dataset to use for super-parent filters (like `make`) so
  // they always show all options regardless of current `cars` (which may be
  // search results).
  allDataForParentFilter?: CarAPI[];
  // Language to derive labels from static JSON
  lang: "en" | "default";
}

// Define sort items with translation keys (these keys should exist in
// the `filters` namespace of your i18n files).
const SORT_ITEMS = [
  { key: "arrival_asc", labelKey: "arrival_asc" },
  { key: "arrival_desc", labelKey: "arrival_desc" },
  { key: "price_asc", labelKey: "price_asc" },
  { key: "price_desc", labelKey: "price_desc" },
  { key: "make_asc", labelKey: "make_asc" },
  { key: "make_desc", labelKey: "make_desc" },
  { key: "model_asc", labelKey: "model_asc" },
  { key: "model_desc", labelKey: "model_desc" },
  { key: "year_asc", labelKey: "year_asc" },
  { key: "year_desc", labelKey: "year_desc" },
];

// (Sort label computation moved into the component so it can use translations)

// stable parent order
const ORDER: FilterField[] = [
  "make",
  "model",
  "maxYear",
  "minYear",
  "maxPrice",
  "minPrice",
  "mileage",
  "transmission",
  "body",
  "color",
];

export const VehicleFilterPanel: React.FC<FilterPanelProps> = ({
  cars,
  config,
  values,
  onChange,
  onReset,
  externalResetSignal,
  allDataForParentFilter,
  lang,
}) => {
  type FiltersI18n = {
    sort: string;
    arrival_asc: string;
    arrival_desc: string;
    price_asc: string;
    price_desc: string;
    make_asc: string;
    make_desc: string;
    model_asc: string;
    model_desc: string;
    year_asc: string;
    year_desc: string;
    priceLowHigh: string;
    priceHighLow: string;
    allMakes: string;
    allModels: string;
    maximumYear: string;
    minimumYear: string;
    enterMaxPrice: string;
    enterMinPrice: string;
    mileage: string;
    allTransmissions: string;
    automatic: string;
    manual: string;
    allBodies: string;
    allColors: string;
    reset: string;
  };

  const filtersT: FiltersI18n = (
    lang === "en"
      ? (enJson as { filters: FiltersI18n }).filters
      : (frJson as { filters: FiltersI18n }).filters
  ) as FiltersI18n;

  // Build translated sort option labels and maps between label <-> key.
  const sortOptions = useMemo(
    () =>
      SORT_ITEMS.map(
        (i) => filtersT[i.labelKey as keyof FiltersI18n] as string
      ),
    [filtersT]
  );
  const labelToKey = useMemo(() => {
    const m: Record<string, string> = {};
    SORT_ITEMS.forEach((i) => {
      const label = filtersT[i.labelKey as keyof FiltersI18n] as string;
      m[label] = i.key;
    });
    return m;
  }, [filtersT]);
  const keyToLabel = useMemo(() => {
    const m: Record<string, string> = {};
    SORT_ITEMS.forEach((i) => {
      m[i.key] = filtersT[i.labelKey as keyof FiltersI18n] as string;
    });
    return m;
  }, [filtersT]);
  const [localOverrides, setLocalOverrides] = useState<FilterValues | null>(
    null
  );

  const applyFilter = React.useCallback(
    (list: CarAPI[], key: FilterField, val: unknown) => {
      if (val === null || val === undefined || val === "") return list;
      switch (key) {
        case "make":
          return list.filter((c) => c.maker === (val as string));
        case "model":
          return list.filter((c) => c.model === (val as string));
        case "maxYear":
          return list.filter((c) => Number(c.car_year) <= Number(val));
        case "minYear":
          return list.filter((c) => Number(c.car_year) >= Number(val));

        case "maxPrice":
          return list.filter((c) => Number(c.car_price || 0) <= Number(val));
        case "minPrice":
          return list.filter((c) => Number(c.car_price || 0) >= Number(val));
        case "mileage":
          return list.filter((c) => Number(c.car_mileage) <= Number(val));
        case "transmission":
          return list.filter((c) => c.car_transmission === (val as string));
        case "body":
          return list.filter((c) => c.car_body === (val as string));
        case "color":
          return list.filter((c) => c.car_interrior_color === (val as string));
        default:
          return list;
      }
    },
    []
  );

  const effectiveValues = localOverrides ?? values;

  useEffect(() => {
    if (!localOverrides) return;
    let allMatch = true;
    for (const k of ORDER) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = (localOverrides as any)[k];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (values as any)[k];
      if (o !== undefined && o !== p) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) {
      // schedule clear to avoid sync setState inside effect
      setTimeout(() => setLocalOverrides(null), 0);
    }
  }, [values, localOverrides]);

  // If the parent `values` object becomes empty (reset), make sure to also
  // clear any optimistic local overrides immediately so the UI reflects
  // the cleared state on first click.
  useEffect(() => {
    if (localOverrides && Object.keys(values || {}).length === 0) {
      // schedule clear to avoid sync setState inside effect
      setTimeout(() => setLocalOverrides(null), 0);
    }
  }, [values, localOverrides]);

  // Clear optimistic overrides when an external reset signal changes.
  useEffect(() => {
    if (typeof externalResetSignal === "number") {
      setTimeout(() => setLocalOverrides(null), 0);
    }
  }, [externalResetSignal]);

  const handleChange = (field: FilterField, value: string | number | null) => {
    const idx = ORDER.indexOf(field);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const optimistic = { ...(values as any) } as FilterValues;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (optimistic as any)[field] = value;

    // Decide which descendants to clear. By default clear all descendants;
    // but if the changed field is a price field, only clear the child filters
    // transmission/body/color (do not clear the sibling price field).
    const shouldOnlyClearChildrenForPrice =
      field === "maxPrice" || field === "minPrice";
    const childrenToClear = new Set<FilterField>([
      "mileage",
      "transmission",
      "body",
      "color",
    ]);

    if (idx >= 0) {
      for (let j = idx + 1; j < ORDER.length; j++) {
        const key = ORDER[j];
        if (shouldOnlyClearChildrenForPrice) {
          // clear only transmissions/body/color
          if (childrenToClear.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (optimistic as any)[key] = null;
          }
        } else {
          // clear all descendants as before
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (optimistic as any)[key] = null;
        }
      }
    }

    setLocalOverrides(optimistic);

    onChange(field, value);
    if (idx >= 0) {
      for (let j = idx + 1; j < ORDER.length; j++) {
        const key = ORDER[j];
        if (shouldOnlyClearChildrenForPrice) {
          if (childrenToClear.has(key)) onChange(key, null);
        } else {
          onChange(key, null);
        }
      }
    }
  };

  const filterUpTo = React.useCallback(
    (field: FilterField, vals: FilterValues) => {
      const idx = ORDER.indexOf(field);
      let list = cars;
      for (let i = 0; i < idx; i++) {
        const key = ORDER[i];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const v = (vals as any)[key];
        list = applyFilter(list, key, v);
      }
      return list;
    },
    [cars, applyFilter]
  );

  const makes = useMemo(() => {
    const source =
      allDataForParentFilter && allDataForParentFilter.length > 0
        ? allDataForParentFilter
        : cars;
    return getUnique(source.map((c) => c.maker)).sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
    );
  }, [cars, allDataForParentFilter]);

  const models = useMemo(() => {
    const list = filterUpTo("model", effectiveValues);
    return getUnique(list.map((c) => c.model)).sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
    );
  }, [effectiveValues, filterUpTo]);

  const years = useMemo(() => {
    const list = filterUpTo("maxYear", effectiveValues);
    return getUnique(list.map((c) => c.car_year)).sort(
      (a: string | number, b: string | number) => Number(a) - Number(b)
    );
  }, [effectiveValues, filterUpTo]);

  const transmissions = useMemo(() => {
    const list = filterUpTo("transmission", effectiveValues);
    return getUnique(list.map((c) => c.car_transmission)).sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
    );
  }, [effectiveValues, filterUpTo]);

  const mileages = useMemo(() => {
    // Present mileage as a set of human-friendly buckets rather than every
    // distinct mileage value. Each option's `value` is a numeric threshold
    // and the `label` is formatted for display (e.g. "50,000 Km Or Less").
    const thresholds = [50000, 100000, 150000, 200000, 250000, 300000];
    const fmt = new Intl.NumberFormat(undefined);
    return thresholds.map((t) => ({
      value: t,
      label: `${fmt.format(t)} Km Or Less`,
    }));
  }, []);

  const bodies = useMemo(() => {
    const list = filterUpTo("body", effectiveValues);
    return getUnique(list.map((c) => c.car_body)).sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
    );
  }, [effectiveValues, filterUpTo]);

  const colors = useMemo(() => {
    const list = filterUpTo("color", effectiveValues);
    return getUnique(list.map((c) => c.car_interrior_color)).sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
    );
  }, [effectiveValues, filterUpTo]);

  return (
    <div className="min-w-[300px] w-full p-5 bg-gray-300 rounded-xl grid gap-4">
      {config.show.includes("sort") && (
        <SelectFilter
          label={filtersT?.sort || "Sort"}
          // Show the translated label for the currently selected sort key
          value={
            (keyToLabel as Record<string, string>)[String(values.sort || "")] ||
            ""
          }
          options={sortOptions}
          placeholder={filtersT?.sort || "Sort"}
          onChange={(v) =>
            onChange("sort", (labelToKey as Record<string, string>)[v] ?? v)
          }
        />
      )}

      {config.show.includes("make") && (
        <SelectFilter
          label={filtersT?.allMakes || "All Makes"}
          value={values.make}
          options={makes}
          placeholder={filtersT?.allMakes || "All Makes"}
          onChange={(v) => handleChange("make", v)}
        />
      )}

      {config.show.includes("model") && (
        <SelectFilter
          label={filtersT?.allModels || "All Models"}
          value={values.model}
          options={models}
          placeholder={filtersT?.allModels || "All Models"}
          onChange={(v) => handleChange("model", v)}
        />
      )}

      {config.show.includes("maxYear") && (
        <SelectFilter
          label={filtersT?.maximumYear || "Maximum Year"}
          value={values.maxYear}
          options={years}
          placeholder={filtersT?.maximumYear || "Maximum Year"}
          onChange={(v) => handleChange("maxYear", v)}
        />
      )}

      {config.show.includes("minYear") && (
        <SelectFilter
          label={filtersT?.minimumYear || "Minimum Year"}
          value={values.minYear}
          options={years}
          placeholder={filtersT?.minimumYear || "Minimum Year"}
          onChange={(v) => handleChange("minYear", v)}
        />
      )}

      {config.show.includes("maxPrice") && (
        <InputFilter
          label={filtersT?.enterMaxPrice || "Max Price"}
          value={values.maxPrice}
          placeholder={filtersT?.enterMaxPrice || "Enter max price"}
          onChange={(v) => handleChange("maxPrice", v)}
        />
      )}

      {config.show.includes("minPrice") && (
        <InputFilter
          label={filtersT?.enterMinPrice || "Min Price"}
          value={values.minPrice}
          placeholder={filtersT?.enterMinPrice || "Enter min price"}
          onChange={(v) => handleChange("minPrice", v)}
        />
      )}

      {config.show.includes("mileage") && (
        <SelectFilter
          label={filtersT?.mileage || "Mileage"}
          value={values.mileage}
          options={mileages}
          placeholder={filtersT?.mileage || "Mileage"}
          onChange={(v) => handleChange("mileage", Number(v) || null)}
        />
      )}

      {config.show.includes("transmission") && (
        <SelectFilter
          label={filtersT?.allTransmissions || "All Transmissions"}
          value={values.transmission}
          options={transmissions}
          placeholder={filtersT?.allTransmissions || "All Transmissions"}
          onChange={(v) => handleChange("transmission", v)}
        />
      )}

      {config.show.includes("body") && (
        <SelectFilter
          label={filtersT?.allBodies || "All Bodies"}
          value={values.body}
          options={bodies}
          placeholder={filtersT?.allBodies || "All Bodies"}
          onChange={(v) => handleChange("body", v)}
        />
      )}

      {config.show.includes("color") && (
        <SelectFilter
          label={filtersT?.allColors || "All Colors"}
          value={values.color}
          options={colors}
          placeholder={filtersT?.allColors || "All Colors"}
          onChange={(v) => handleChange("color", v)}
        />
      )}

      {/* RESET BUTTON */}
      <button
        onClick={onReset}
        className="w-full py-2 px-6 bg-gray-1100 hover:bg-gray-1000 text-white rounded-lg text-base leading-7"
      >
        {filtersT?.reset || "Reset"}
      </button>
    </div>
  );
};
