import { create } from "zustand";

export type ThemeMode = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

type UiState = {
  loreMasterOpen: boolean;
  distractionFreeMode: boolean;
  ambientColor: string; // hex
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setLoreMasterOpen: (v: boolean) => void;
  toggleDistractionFree: () => void;
  setAmbientColor: (hex: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
};

export const useUiStore = create<UiState>((set) => ({
  loreMasterOpen: false,
  distractionFreeMode: false,
  ambientColor: "#7C3AED",
  themeMode: "system",
  resolvedTheme: "dark",
  setLoreMasterOpen: (v) => set({ loreMasterOpen: v }),
  toggleDistractionFree: () => set((s) => ({ distractionFreeMode: !s.distractionFreeMode })),
  setAmbientColor: (hex) => set({ ambientColor: hex }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setResolvedTheme: (theme) => set({ resolvedTheme: theme })
}));
