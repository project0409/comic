import { create } from "zustand";

export type UnlockRecord = { chapterId: string; spent: number; atIso: string };

const STORAGE_KEY = "fyp-user-wallet-data";
const CLAIMED_BONUSES_KEY = "fyp-claimed-bonuses";

function getStoredWalletData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredWalletData(data: { coinBalance: number; unlockHistory: UnlockRecord[]; unlockedChapterIds: string[] }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getClaimedBonuses(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLAIMED_BONUSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBonusAlreadyClaimed(emailOrUser: string): boolean {
  if (!emailOrUser) return false;
  const claimed = getClaimedBonuses();
  return claimed.includes(emailOrUser.toLowerCase().trim());
}

export function markBonusClaimed(emailOrUser: string) {
  if (typeof window === "undefined" || !emailOrUser) return;
  try {
    const claimed = getClaimedBonuses();
    const key = emailOrUser.toLowerCase().trim();
    if (!claimed.includes(key)) {
      localStorage.setItem(CLAIMED_BONUSES_KEY, JSON.stringify([...claimed, key]));
    }
  } catch {}
}

type WalletState = {
  coinBalance: number;
  unlockHistory: UnlockRecord[];
  unlockedChapterIds: string[];
  setBalance: (n: number) => void;
  spendCoins: (n: number, chapterId: string) => boolean;
  isUnlocked: (chapterId: string) => boolean;
  grantWelcomeBonusForNewUser: (emailOrUser: string) => boolean;
};

const initialData = getStoredWalletData();

export const useWalletStore = create<WalletState>((set, get) => ({
  coinBalance: initialData?.coinBalance ?? 15,
  unlockHistory: initialData?.unlockHistory ?? [],
  unlockedChapterIds: initialData?.unlockedChapterIds ?? [],

  setBalance: (n) => {
    const next = Math.max(0, n);
    set({ coinBalance: next });
    saveStoredWalletData({
      coinBalance: next,
      unlockHistory: get().unlockHistory,
      unlockedChapterIds: get().unlockedChapterIds
    });
  },

  spendCoins: (n, chapterId) => {
    const bal = get().coinBalance;
    if (bal < n) return false;
    const nextBal = bal - n;
    const nextHistory = [{ chapterId, spent: n, atIso: new Date().toISOString() }, ...get().unlockHistory];
    const nextUnlocked = Array.from(new Set([...get().unlockedChapterIds, chapterId]));

    set({
      coinBalance: nextBal,
      unlockHistory: nextHistory,
      unlockedChapterIds: nextUnlocked
    });

    saveStoredWalletData({
      coinBalance: nextBal,
      unlockHistory: nextHistory,
      unlockedChapterIds: nextUnlocked
    });
    return true;
  },

  isUnlocked: (chapterId) => get().unlockedChapterIds.includes(chapterId),

  grantWelcomeBonusForNewUser: (emailOrUser: string) => {
    if (!emailOrUser) return false;
    const key = emailOrUser.toLowerCase().trim();
    if (isBonusAlreadyClaimed(key)) {
      // Returning user - do NOT grant bonus again
      return false;
    }

    // Brand new user - award 1,000 coins one time
    markBonusClaimed(key);
    const nextBal = 1000;
    set({ coinBalance: nextBal });
    saveStoredWalletData({
      coinBalance: nextBal,
      unlockHistory: get().unlockHistory,
      unlockedChapterIds: get().unlockedChapterIds
    });
    return true;
  }
}));
