import { create } from "zustand";

type UiState = {
  loreMasterOpen: boolean;
  distractionFreeMode: boolean;
  ambientColor: string; // hex
  setLoreMasterOpen: (v: boolean) => void;
  toggleDistractionFree: () => void;
  setAmbientColor: (hex: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  loreMasterOpen: false,
  distractionFreeMode: false,
  ambientColor: "#7C3AED",
  setLoreMasterOpen: (v) => set({ loreMasterOpen: v }),
  toggleDistractionFree: () => set((s) => ({ distractionFreeMode: !s.distractionFreeMode })),
  setAmbientColor: (hex) => set({ ambientColor: hex })
}));

