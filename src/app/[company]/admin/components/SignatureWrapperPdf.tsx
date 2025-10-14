"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import DraggableSignature from "./DraggableSignature";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Signatory, SignatureData, SignaturePosition } from "@/src/lib/type";

// ✅ Charger pdfjs uniquement côté client
let pdfjs: any = null;
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pdfjs = require("react-pdf").pdfjs;
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

// ✅ Charger Document et Page dynamiquement sans SSR
const Document = dynamic(() => import("react-pdf").then(mod => mod.Document), {
  ssr: false,
});
const Page = dynamic(() => import("react-pdf").then(mod => mod.Page), {
  ssr: false,
});

interface SignatureWrapperProps {
  fileUrl: string;
  signatories: Signatory[];
  onSignaturesReady?: (signatures: SignatureData) => void;
  onSignaturePlaced?: (
    type: "admin" | "client",
    position: SignaturePosition
  ) => void;
}

const SignatureWrapper = ({
  fileUrl,
  signatories,
  onSignaturesReady,
  onSignaturePlaced,
}: SignatureWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [signatures, setSignatures] = useState<SignatureData>({
    admin: null,
    client: null,
    selectedPage: 1,
  });
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [allSignaturesPlaced, setAllSignaturesPlaced] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageDimensions, setPageDimensions] = useState<
    Map<number, { width: number; height: number }>
  >(new Map());
  const [scale, setScale] = useState<number>(1.5);

  useEffect(() => {
    const adminPlaced = signatures.admin !== null;
    const clientPlaced = signatures.client !== null;
    const allPlaced = adminPlaced && clientPlaced;
    setAllSignaturesPlaced(allPlaced);

    if (allPlaced && onSignaturesReady) {
      onSignaturesReady(signatures);
    }
  }, [signatures, onSignaturesReady]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setPdfError(`Erreur de chargement du PDF: ${error.message}`);
    setIsLoading(false);
  };

  const onPageLoadSuccess = (
    pageNumber: number,
    width: number,
    height: number
  ) => {
    setPageDimensions(
      (prev) => new Map(prev.set(pageNumber, { width, height }))
    );
  };

  const handleElementDragStop = (
    type: "admin" | "client",
    x: number,
    y: number
  ) => {
    const newPosition: SignaturePosition = {
      x: Math.round(x),
      y: Math.round(y),
      page: currentPage,
    };

    setSignatures((prev) => ({
      ...prev,
      [type]: newPosition,
      selectedPage: currentPage,
    }));

    if (onSignaturePlaced) {
      onSignaturePlaced(type, newPosition);
    }
  };

  const resetSignature = (type: "admin" | "client") => {
    setSignatures((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setCurrentPage(newPage);
      setSignatures((prev) => ({
        ...prev,
        selectedPage: newPage,
      }));
    }
  };

  const getCurrentPageDimensions = () => {
    return pageDimensions.get(currentPage) || { width: 600, height: 800 };
  };

  return (
    <div className="flex flex-col gap-4">
      {pdfError && (
        <div className="text-red-500 p-4 bg-red-50 border border-red-200 rounded">
          {pdfError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Page:</span>
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            ←
          </button>
          <span className="px-3 py-1 bg-white border border-gray-300 rounded">
            {currentPage} / {numPages || 1}
          </span>
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage >= (numPages || 1) || isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative border border-gray-300 bg-white overflow-auto max-h-screen"
        style={{ maxHeight: "600px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="text-blue-500 text-lg">Chargement du PDF...</div>
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="p-4">Chargement du document...</div>}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            onRenderSuccess={(page) => {
              const viewport = page.getViewport({ scale: 1 });
              onPageLoadSuccess(currentPage, viewport.width, viewport.height);
            }}
          />
        </Document>

        {/* Signatures */}
        {!isLoading && (
          <div
            className="absolute top-0 left-0"
            style={{
              width: `${getCurrentPageDimensions().width * scale}px`,
              height: `${getCurrentPageDimensions().height * scale}px`,
              pointerEvents: "none",
            }}
          >
            {signatories.map((signatory, index) => {
              const position = signatures[signatory.type];
              const isPlaced =
                position !== null && position.page === currentPage;

              return (
                <div
                  key={signatory.type}
                  style={{
                    pointerEvents: "all",
                    position: "absolute",
                    zIndex: 10,
                    left: position?.x ?? 50 + index * 160,
                    top: position?.y ?? 50,
                  }}
                >
                  <DraggableSignature
                    key={signatory.type}
                    onDragStop={(x, y) =>
                      handleElementDragStop(signatory.type, x, y)
                    }
                    initialPosition={{
                      x: position?.x ?? 50 + index * 160,
                      y: position?.y ?? 50,
                    }}
                    isPlaced={isPlaced}
                    onReset={() => resetSignature(signatory.type)}
                  >
                    <div className="flex items-center justify-center text-cStandard text-sm font-medium rounded shadow-lg cursor-grab active:cursor-grabbing transition-all duration-200 w-[150px] h-[50px] border border-gray-300 bg-white">
                      Signature{" "}
                      {signatory.type === "admin" ? "Admin" : "Client"}
                      {isPlaced && <span className="ml-2">✓</span>}
                    </div>
                  </DraggableSignature>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureWrapper;
