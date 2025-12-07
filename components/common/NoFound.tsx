import React from "react";

const NoFound = ({
  message = "No data found to show for this id/name.",
}: {
  message?: string;
}) => {
  return (
    <div className="w-full py-8 flex items-center justify-center border border-red-300 bg-red-50 rounded-xl">
      <div className="text-center">
        <p className="text-lg font-medium text-red-700">{message}</p>
      </div>
    </div>
  );
};

export default NoFound;
