import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Top-level API response
export interface CarListResponse {
  status: "success" | "error" | string;
  data: {
    dealer?: Dealer | null;
    cars: CarAPI[];
  };
}

// Dealer objects
export interface Dealer {
  id?: number;
  name?: string;
  dealer_Logo?: string | null;
  dealer_email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  website_url?: string | null;
  active?: number | boolean;
  push_to_wp?: number | boolean;
  isMaster?: boolean;
}

// FB post nested object
export interface FBPost {
  id?: number;
  car_id?: number;
  dealer_id?: number;
  vehicle_mk?: string | null;
  MissingFBModel?: string | null;
}

// Car dealer nested object (cardealer)
export interface Cardealer {
  id?: number;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  dealer_Logo?: string | null;
  dealer_email?: string | null;
  website_url?: string | null;
  chat_url?: string | null;
  fb_page_id?: string | null;
  fb_business_id?: string | null;
  isMaster?: boolean;
}

// Main Car API type (expanded)
export interface CarAPI {
  ID: number;
  dealer_id?: number;
  car_dealer_id?: number;
  vid?: string;
  post_title?: string;
  photo?: string | null;
  src_photo?: string | null;
  photos?: string | null; // comma-separated string in response
  maker?: string | null;
  model?: string | null;
  post_type?: string | null;
  vehicle_type_id?: number;
  post_content?: string | null;
  auto_reply?: string | null;
  export_des?: string | null;
  post_status?: string | null;
  approval_status?: number;
  stock?: string | null;
  p_range?: string | null;
  icl_post_language?: string | null;
  post_excerpt?: string | null;
  guid?: string | null;
  car_price?: number;
  car_old_price?: number;
  car_condition?: string | null;
  number_of_passengers?: number | string | null;
  car_doors_count?: number | string | null;
  car_body?: string | null;
  car_trim: string | null;
  car_certified?: string | number | boolean;
  car_drivetrain?: string | null;
  car_cylinders?: string | null;

  car_transmission?: string | null;
  car_fuel_type?: string | null;
  car_interrior_color?: string | null;
  car_exterior_color?: string | null;
  car_year?: string | number | null;
  car_mileage?: string | number | null;
  car_mileage_unit?: string | null;
  car_vin?: string | null;
  car_engine_size?: string | null;
  car_options?: string | null;
  car_sub_model?: string | null;
  cardealer_rooftop_id?: string | null;
  cardealer_chat_url?: string | null;
  cardealer_dealer_name?: string | null;
  cardealer_dealer_email?: string | null;
  cardealer_dealer_phone?: string | null;
  cardealer_dealer_logo?: string | null;
  cardealer_dealer_address?: string | null;
  cardealer_dealer_city?: string | null;
  cardealer_dealer_region_code?: string | null;
  cardealer_postal_code?: string | null;
  type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  ZapierURL?: string | null;
  MapURL?: string | null;
  websiteURL?: string | null;
  modify_status?: string | null;
  published?: number | boolean;
  push_to_website?: number | boolean;
  car_featured?: number | boolean;
  car_no_accident?: number | boolean;
  car_one_owner?: number | boolean;
  car_starter?: number | boolean;
  yard?: string | null;
  condition?: string | null;
  MsgCount?: number;
  deleted_at?: string | null;
  weekly_price?: number | null;
  temp_photos?: string | null;
  old_photos?: string | null;
  cost_price?: number | null;
  // Nested objects:
  cardealer_dealer?: Cardealer | null;
  car_dealer?: Cardealer | null; // sometimes response uses different property name
  fb_post?: FBPost | null;
  // any extra fields
  [key: string]: unknown;
}

export function applyFiltersToData(
  filters: Record<string, string>,
  dataset: CarAPI[]
): CarAPI[] {
  const normalizeTime = (val?: string | number | null): number => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    let s = String(val).trim();
    const mysqlLike = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    const isoNoTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    if (mysqlLike.test(s)) s = s.replace(" ", "T") + "Z";
    else if (isoNoTZ.test(s)) s = s + "Z";
    const parsed = Date.parse(s);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getArrivalTime = (car: CarAPI) =>
    normalizeTime(car.updated_at) || normalizeTime(car.created_at) || 0;

  const res = dataset.filter((car) => {
    if (filters.make && String(car.maker || "") !== filters.make) return false;
    if (filters.model && String(car.model || "") !== filters.model)
      return false;
    if (
      filters.transmission &&
      String(car.car_transmission || "") !== filters.transmission
    )
      return false;
    if (filters.body && String(car.car_body || "") !== filters.body)
      return false;
    if (filters.color) {
      const interiorMatch =
        String(car.car_interrior_color || "") === filters.color;
      const exteriorMatch =
        String(car.car_exterrior_color || "") === filters.color;
      if (!interiorMatch && !exteriorMatch) return false;
    }
    if (filters.minYear && Number(car.car_year || 0) < Number(filters.minYear))
      return false;
    if (filters.maxYear && Number(car.car_year || 0) > Number(filters.maxYear))
      return false;
    if (
      filters.mileage &&
      Number(car.car_mileage || 0) > Number(filters.mileage)
    )
      return false;
    if (
      filters.minPrice &&
      Number(car.car_price || 0) <
        Number(filters.minPrice.replace(/[^0-9.-]/g, ""))
    )
      return false;
    if (
      filters.maxPrice &&
      Number(car.car_price || 0) >
        Number(filters.maxPrice.replace(/[^0-9.-]/g, ""))
    )
      return false;
    return true;
  });

  // Sorting logic
  switch (filters.sort) {
    case "arrival_desc":
      res.sort((a, b) => getArrivalTime(b) - getArrivalTime(a));
      break;
    case "arrival_asc":
      res.sort((a, b) => getArrivalTime(a) - getArrivalTime(b));
      break;
    case "price_desc":
      res.sort((a, b) => Number(b.car_price || 0) - Number(a.car_price || 0));
      break;
    case "price_asc":
      res.sort((a, b) => Number(a.car_price || 0) - Number(b.car_price || 0));
      break;
    case "year_desc":
      res.sort((a, b) => Number(b.car_year || 0) - Number(a.car_year || 0));
      break;
    case "year_asc":
      res.sort((a, b) => Number(a.car_year || 0) - Number(b.car_year || 0));
      break;
    case "make_asc":
      res.sort((a, b) => (a.maker || "").localeCompare(b.maker || ""));
      break;
    case "make_desc":
      res.sort((a, b) => (b.maker || "").localeCompare(a.maker || ""));
      break;
    case "model_asc":
      res.sort((a, b) => (a.model || "").localeCompare(b.model || ""));
      break;
    case "model_desc":
      res.sort((a, b) => (b.model || "").localeCompare(a.model || ""));
      break;
  }

  return res;
}
