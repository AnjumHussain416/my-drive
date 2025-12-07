"use client";

import CarCard from "@/components/CarCard";
import { CarAPI } from "@/utils/types";
import React, { useEffect } from "react";

type CardGridProps = {
  cars: CarAPI[];
  isLoading?: boolean;
  isError?: boolean;
};
const CardGrid: React.FC<CardGridProps> = ({ cars }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4">
      {cars.map((car) => (
        <CarCard key={car.ID} car={car} />
      ))}
    </div>
  );
};

export default CardGrid;
