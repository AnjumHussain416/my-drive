"use client";

import ChevronUp from "@/public/assets/svg/chevronup";
import { useState, useEffect } from "react";

export default function Scrollup() {
  const [visible, setVisible] = useState(false);

  // Show button after scrolling 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) setVisible(true);
      else setVisible(false);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {visible && (
        <button
          onClick={scrollToTop}
          className=" fixed bottom-8 right-8 cursor-pointer  w-10 h-10 bg-gray-1100 hover:bg-gray-1000 flex justify-center items-center font-semibold text-white"
        >
          <ChevronUp />
        </button>
      )}
    </>
  );
}
