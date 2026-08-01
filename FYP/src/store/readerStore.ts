import { create } from "zustand";

export type ReadingMode = "flip" | "scroll";

type ReaderState = {
  currentPage: number; // 1-indexed
  totalPages: number;
  readingMode: ReadingMode;
  guidedViewActive: boolean;
  setCurrentPage: (page: number) => void;
  setTotalPages: (n: number) => void;
  toggleReadingMode: () => void;
  setGuidedViewActive: (v: boolean) => void;
};

export const useReaderStore = create<ReaderState>((set) => ({
  currentPage: 1,
  totalPages: 1,
  readingMode: "flip",
  guidedViewActive: false,
  setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
  setTotalPages: (n) => set({ totalPages: Math.max(1, n) }),
  toggleReadingMode: () =>
    set((s) => ({ readingMode: s.readingMode === "flip" ? "scroll" : "flip" })),
  setGuidedViewActive: (v) => set({ guidedViewActive: v })
}));
