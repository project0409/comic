import { create } from "zustand";

export type ToastTone = "default" | "success" | "danger" | "gold";
export type Toast = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
  createdAt: number;
};

type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id" | "createdAt">) => string;
  remove: (id: string) => void;
  clear: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, createdAt: Date.now(), ...t };
    set((s) => ({ toasts: [toast, ...s.toasts].slice(0, 4) }));
    // auto-dismiss
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, t.tone === "success" ? 4500 : 3200);
    }
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] })
}));
