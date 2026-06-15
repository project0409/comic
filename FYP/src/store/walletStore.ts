import { create } from "zustand";

export type UnlockRecord = { chapterId: string; spent: number; atIso: string };

type WalletState = {
  coinBalance: number;
  unlockHistory: UnlockRecord[];
  setBalance: (n: number) => void;
  spendCoins: (n: number, chapterId: string) => boolean;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  coinBalance: 248,
  unlockHistory: [],
  setBalance: (n) => set({ coinBalance: Math.max(0, n) }),
  spendCoins: (n, chapterId) => {
    const bal = get().coinBalance;
    if (bal < n) return false;
    set((s) => ({
      coinBalance: s.coinBalance - n,
      unlockHistory: [{ chapterId, spent: n, atIso: new Date().toISOString() }, ...s.unlockHistory]
    }));
    return true;
  }
}));

