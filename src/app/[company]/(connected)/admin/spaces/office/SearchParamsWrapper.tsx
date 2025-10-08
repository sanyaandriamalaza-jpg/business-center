"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export type ModeType = "create" | "edit";

type Props = {
  onParamsReady: (mode: ModeType, id: number) => void;
};

export default function SearchParamsWrapper({ onParamsReady }: Props) {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offer-id");
  const officeId = searchParams.get("office-id");
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (offerId || officeId) {
      const numericOfferId = Number(offerId);
      const numericOfficeId = Number(officeId);
      const modeFormated = mode as ModeType;

      if (!isNaN(numericOfferId) && modeFormated && modeFormated === "create") {
        onParamsReady(modeFormated, numericOfferId);
      } else if (
        !isNaN(numericOfficeId) &&
        modeFormated &&
        modeFormated === "edit"
      ) {
        onParamsReady(modeFormated, numericOfficeId);
      }
    }
  }, [offerId, officeId, mode, onParamsReady]);

  return null;
}
