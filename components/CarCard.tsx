"use client";

import FuelPumpFill from "@/public/assets/svg/fuelpumpfill";
import GearWide from "@/public/assets/svg/gearwide";
import SearchIcon from "@/public/assets/svg/search";
import { CarAPI } from "@/utils/types";
// Using native <img> instead of next/image
import Link from "next/link";
import React from "react";

type Props = {
  car: CarAPI;
};

export default function CarCard({ car }: Props) {
  // translations not used in this component currently

  // logic to decide icons (these follow the logic you supplied)
  const hasVideo = !!car.car_video;
  const featuretIcon = car.car_featured
    ? "https://www.drivegood.com/wp-content/uploads/2025/01/Featured.webp"
    : "";
  const certifiedIcon =
    car.car_certified === "1" || car.car_certified === 1
      ? "https://www.drivegood.com/wp-content/uploads/2025/01/Cert.webp"
      : "";
  const starterIcon = car.car_starter
    ? "https://www.drivegood.com/wp-content/uploads/2025/01/Remote-control.webp"
    : "";
  const noaccidentIcon = car.car_no_accident
    ? "https://www.drivegood.com/wp-content/uploads/2025/01/No-accident.webp"
    : "";
  const oneownerIcon = car.car_one_owner
    ? "https://www.drivegood.com/wp-content/uploads/2025/01/One-own.webp"
    : "";

  const getPriceValue = (
    price: string | number | null | undefined
  ): number | undefined => {
    if (price === null || price === undefined || price === "") {
      return undefined;
    }
    const num = Number(price);
    return !isNaN(num) ? num : undefined;
  };

  const price = getPriceValue(car.car_price);
  const oldPrice = getPriceValue(car.car_old_price ?? 0);

  function formatPrice(n?: number) {
    if (n == null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  // mileage formatting not used currently

  return (
    <Link
      href={`https://www.facebook.com/marketplace/item/${car?.fb_post?.vehicle_mk}`}
      target="_blank"
      rel="noopener noreferrer"
      className="max-w-sm  bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm grid grid-rows-[auto_1fr_auto_auto_auto] gap-2"
    >
      <div className="relative group bg-gray-50 h-56 w-full hover:cursor-pointer">
        {car.photo ? (
          <img
            src={String(car.photo)}
            alt={car.post_title ?? "Car Image"}
            width={640}
            height={224}
            className="object-cover w-full h-full"
            loading="eager" // if above-the-fold; use "lazy" otherwise
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <span className="text-sm">No image</span>
          </div>
        )}

        {car?.fb_post?.vehicle_mk && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={
                "absolute inset-0 z-100 bg-black/0 group-hover:bg-black/60 transform origin-top scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100 flex items-center justify-center"
              }
            >
              <div className="group/icon rounded-full border border-white p-3 flex justify-center items-center hover:bg-white">
                <SearchIcon
                  className="
    w-6 h-6 text-white fill-current 
    opacity-90 transition-all duration-300 
    group-hover/icon:opacity-100
    group-hover/icon:text-orange-600
    group-hover/icon:fill-orange-600
  "
                />
              </div>
            </div>
          </div>
        )}

        {/* Top-left video icon (if video exists) */}
        {hasVideo && (
          <div className="absolute top-3 left-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.drivegood.com/wp-content/uploads/2024/12/video_icon.png"
              alt="Video"
              width={34}
              height={34}
              className="rounded-full bg-white border-2 border-red-500"
              decoding="async"
              loading="lazy"
            />
          </div>
        )}

        {/* Badge row centered at bottom of image */}
        <div className="w-full absolute left-1/2 bottom-3 transform -translate-x-1/2 flex justify-center items-center gap-2 px-2">
          {featuretIcon && (
            <div className="p-0.5 bg-white rounded-full border-2 border-red-500 flex justify-center items-center z-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuretIcon}
                alt="Featured"
                width={40}
                height={40}
                className="rounded-full"
                decoding="async"
                loading="lazy"
              />
            </div>
          )}
          {certifiedIcon && (
            <div className="p-0.5 bg-white rounded-full border-2 border-red-500 flex justify-center items-center z-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={certifiedIcon}
                alt="Certified"
                width={40}
                height={40}
                className="rounded-full"
                decoding="async"
                loading="lazy"
              />
            </div>
          )}
          {starterIcon && (
            <div className="p-0.5 bg-white rounded-full border-2 border-red-500 flex justify-center items-center z-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={starterIcon}
                alt="Starter"
                width={40}
                height={40}
                className="rounded-full"
                decoding="async"
                loading="lazy"
              />
            </div>
          )}
          {noaccidentIcon && (
            <div className="p-0.5 bg-white rounded-full border-2 border-red-500 flex justify-center items-center z-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={noaccidentIcon}
                alt="No Accident"
                width={40}
                height={40}
                className="rounded-full"
                decoding="async"
                loading="lazy"
              />
            </div>
          )}
          {oneownerIcon && (
            <div className="p-0.5 bg-white rounded-full border-2 border-red-500 flex justify-center items-center z-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={oneownerIcon}
                alt="One Owner"
                width={40}
                height={40}
                className="rounded-full"
                decoding="async"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 text-center">
        <h3 className="text-base text-gray-900 font-bold leading-6">
          {(car.car_year ?? "").toString()} {""}
          {car.maker ?? ""} {car.model ?? ""}
        </h3>

        <div className="my-2">
          <div className="text-xs text-gray-800 mb-1.5">
            {car?.car_trim ?? ""}
          </div>
          <div className="grid grid-cols-1 gap-1 text-base leading-6 text-gray-1000">
            Price:
          </div>

          <div className="text-black text-xs font-semibold line-through">
            {oldPrice ? formatPrice(oldPrice) : ""}
          </div>

          <div className="text-red-600 text-lg leading-7 font-semibold">
            {price ? formatPrice(price) : ""}
          </div>
        </div>

        {/* <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 13l4-4 4 4 4-4 4 4" />
            </svg>
            <span>{formatMileage(car.car_mileage, car.car_mileage_unit)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{car.car_transmission ?? "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="14" rx="2" />
            </svg>
            <span>
              {car.car_interrior_color ?? car.car_interrior_color?? "-"}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow-sm">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
            </svg>
            Chat
          </button>
        </div> */}
      </div>
      <div className="border-t border-t-gray-200 py-2 flex justify-center items-center">
        {car?.cardealer_dealer_logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.cardealer_dealer_logo}
            alt="CarLogo"
            width={50}
            height={50}
            className="object-contain"
            decoding="async"
            loading="lazy"
          />
        )}
      </div>

      {/* Dealer footer */}
      {/* <div className="border-t border-t-gray-200 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {car.cardealer_dealer_logo ? (
            <img
              src={car.cardealer_dealer_logo}
              alt="dealer"
              className="w-10 h-10 object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs">
              Logo
            </div>
          )}
          <div className="text-xs">
            <div className="font-medium">
              {car.cardealer_dealer_name ?? "Dealer"}
            </div>
            <div className="text-gray-500">
              {car.cardealer_dealer_city ?? ""}
            </div>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="font-semibold">{car.car_transmission ?? ""}</div>
          <div className="text-gray-500">{car.car_year}</div>
        </div>
      </div> */}

      <div className="border-t border-t-gray-200 px-3 py-2 flex items-center justify-center gap-4">
        <div className="flex justify-start items-center gap-1">
          <GearWide className="w-3 h-3 text-black" />
          <p className="text-xs text-black">
            {car?.car_transmission && car?.car_transmission}
          </p>
        </div>
        <div className="flex justify-start items-center gap-1">
          <FuelPumpFill className="w-3 h-3 text-black" />
          <p className="text-xs text-black">
            {" "}
            {car?.car_mileage} {car?.car_mileage_unit}
          </p>
        </div>
        <div className="flex justify-start items-center gap-1">
          <p className="text-xs text-black"> Int: {car?.car_interrior_color}</p>
        </div>
      </div>
    </Link>
  );
}
