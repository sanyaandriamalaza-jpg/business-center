"use client";

import { useEffect } from "react";
import { ScaleLoader } from "react-spinners";

export default function PublicGeneralLoading() {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);
  return (
    <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/60 cursor-wait z-[99999] flex flex-col gap-2 items-center justify-center publicGeneralLoader">
      <div>
        <ScaleLoader color="#ffffff" />
      </div>
      <p className="text-white">Veuillez patienter un instant...</p>
    </div>
  );
}
