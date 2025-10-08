import { create } from "zustand";
import { ColorTheme, Company } from "../lib/type";

interface StoreState {
  isGeneralOverlayVisible: boolean;
  setIsGeneralOverlayVisible: (value: boolean) => void;
  currentBusinessCenter?: Company | null;
  theme?: ColorTheme;
  setTheme: (value: ColorTheme) => void;
  setCurrentBusinessCenter: (value: Company) => void;
  isGeneralLoadingVisible: boolean;
  setIsGeneralLoadingVisible: (data: boolean) => void;
  initialDateHourFilter: {
    date?: Date | null;
    hourStart?: string | null;
    hourEnd?: string | null;
  };
  setInitialDateHourFilter: (
    date?: Date | null,
    hourStart?: string | null,
    hourEnd?: string | null
  ) => void;
}

export const useGlobalStore = create<StoreState>((set) => ({
  isGeneralOverlayVisible: false,
  setIsGeneralOverlayVisible: (value: boolean) =>
    set({ isGeneralOverlayVisible: value }),
  theme: undefined,
  setTheme: (value) => set({ theme: value }),
  currentBusinessCenter: null,
  setCurrentBusinessCenter: (value: Company) =>
    set({ currentBusinessCenter: value }),
  isGeneralLoadingVisible: false,
  setIsGeneralLoadingVisible: (data: boolean) =>
    set({ isGeneralLoadingVisible: data }),
  initialDateHourFilter: {
    date: null,
    hourStart: null,
    hourEnd: null,
  },
  setInitialDateHourFilter: (date, hourStart, hourEnd) =>
    set({
      initialDateHourFilter: {
        date,
        hourStart,
        hourEnd,
      },
    }),
}));
