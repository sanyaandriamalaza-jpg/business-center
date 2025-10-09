"use client";

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import QRCode from "qrcode";
import Image from "next/image";

export type CustomQrHandle = {
  download: () => void;
};

const CustomQr = forwardRef<CustomQrHandle, { data: string[]; fileName: string }>(
  ({ data, fileName }, ref) => {
    const [qrUrl, setQrUrl] = useState("");

    useEffect(() => {
      const rawData = data.join("\n");
      QRCode.toDataURL(rawData, { errorCorrectionLevel: "H" })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }, [data]);

    useImperativeHandle(ref, () => ({
      download: () => {
        if (!qrUrl) return;
        const link = document.createElement("a");
        link.href = qrUrl;
        link.download = `${fileName}.png`;
        link.click();
      },
    }));

    return (
      <div className="bg-white p-0 overflow-hidden rounded-md flex flex-col items-center gap-4 border m-2">
        {qrUrl && <Image src={qrUrl} width={300} height={300} alt="QR Code" />}
      </div>
    );
  }
);
CustomQr.displayName = "CustomQr";
export default CustomQr;
