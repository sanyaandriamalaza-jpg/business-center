"use client";

import { Label } from "@/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { ColorTheme } from "@/src/lib/type";
import { apiUrl } from "@/src/lib/utils";
import { useEffect, useState } from "react";

interface ThemeSelectorProps {
  selectedTheme: number | null;
  onSelectTheme: (themeId: number) => void;
}

export default function ThemeSelector({
  selectedTheme,
  onSelectTheme,
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<ColorTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helpers to safely parse color values which may be null/undefined or in different formats
  const parseRgbValues = (val?: string) => {
    if (!val) return "0,0,0";
    const s = val.trim();
    // rgb(...) or rgba(...)
    if (s.startsWith("rgb")) {
      return s.replace(/rgba?\(|\)/g, "").trim().replace(/\s+/g, ",");
    }
    // already comma separated
    if (s.includes(",")) return s;
    // space separated like "255 255 255"
    return s.split(/\s+/).join(",");
  };

  const cssWithAlpha = (val?: string | null, alpha = 1) => {
    if (!val) return `rgba(0,0,0,${alpha})`;
    const s = val.trim();
    const inner = parseRgbValues(s);
    return alpha === 1 ? `rgb(${inner})` : `rgba(${inner}, ${alpha})`;
  };

  useEffect(() => {
    async function fetchThemes() {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/color-themes`);

        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }

        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          setThemes(result.data);
        } else {
          setThemes([]);
          console.warn("Aucun thème trouvé ou format de données incorrect");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des thèmes:", error);
        setError("Impossible de charger les thèmes");
        setThemes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchThemes();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Chargement des thèmes...</span>
        </div>
        {/* Skeleton loaders */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Erreur: {error}</span>
        </div>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Aucun thème disponible
          </h3>
          <p className="text-sm">
            Les thèmes de couleur seront bientôt disponibles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          Choisir un thème
        </h3>
      </div>

      <RadioGroup
        value={selectedTheme?.toString() ?? ""}
        onValueChange={(value) => onSelectTheme(Number(value))}
        className="space-y-3"
      >
        {themes.map((theme) => (
          <div key={theme.id} className="group relative">
            <RadioGroupItem
              value={theme.id.toString()}
              id={`theme-${theme.id}`}
              className=" sr-only"
            />
            <Label
              htmlFor={`theme-${theme.id}`}
              className={`
                relative flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer 
                transition-all duration-200 ease-in-out
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                ${
                  selectedTheme === theme.id
                    ? "border-cPrimary shadow-lg ring-2 ring-cPrimary/20 bg-cPrimary/5"
                    : "border hover:border-cPrimary/50 bg-cBackground"
                }
              `}
              style={{
                backgroundColor:
                  selectedTheme === theme.id
                    ? undefined
                    : theme.backgroundColor && theme.backgroundColor.trim().startsWith("rgb(")
                      ? // append low alpha hex-like suffix if given as rgb(...) -> use rgba for clarity
                        cssWithAlpha(theme.backgroundColor, 0.08)
                      : cssWithAlpha(theme.primaryColor, 0.07),
              }}
            >
              {/* Indicateur visuel du thème */}
              <div className="flex space-x-1 flex-shrink-0">
                <div
                  className="w-4 h-4 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: theme.backgroundColor && theme.backgroundColor.trim().startsWith("rgb(")
                      ? cssWithAlpha(theme.backgroundColor, 1)
                      : cssWithAlpha(theme.primaryColor, 1),
                  }}
                />
                <div
                  className="w-4 h-4 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: cssWithAlpha(theme.foregroundColor, 1),
                  }}
                />
                <div
                  className="w-4 h-4 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: cssWithAlpha(theme.backgroundColor, 1),
                  }}
                />
              </div>

              {/* Nom du thème */}
              <div className="flex-1 min-w-0">
                <span
                  className="font-medium text-base block truncate"
                  style={{
                    color:
                      selectedTheme === theme.id
                        ? undefined
                        : cssWithAlpha(theme.standardColor, 1),
                  }}
                >
                  {theme.name || `Thème ${theme.id}`}
                </span>
              </div>

              {/* Indicateur de sélection */}
              {selectedTheme === theme.id && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-cPrimary rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-cForeground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
