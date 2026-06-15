import { create } from "zustand";

type AudioState = {
  isMuted: boolean;
  volume: number; // 0..1
  currentTrack?: { url: string; mood?: string };
  setMuted: (v: boolean) => void;
  toggleMuted: () => void;
  setVolume: (v: number) => void;
  setCurrentTrack: (track?: { url: string; mood?: string }) => void;
};

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: false,
  volume: 0.85,
  currentTrack: undefined,
  setMuted: (v) => set({ isMuted: v }),
  toggleMuted: () => set((s) => ({ isMuted: !s.isMuted })),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  setCurrentTrack: (track) => set({ currentTrack: track })
}));

