"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/components/cn";
import { useToastStore } from "@/store/toastStore";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[90] w-[min(360px,92vw)] space-y-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "pointer-events-auto overflow-hidden rounded-2xl border bg-black/65 p-4 backdrop-blur-xl",
              t.tone === "success"
                ? "border-emerald-500/30"
                : t.tone === "danger"
                  ? "border-danger/30"
                  : t.tone === "gold"
                    ? "border-gold/30"
                    : "border-white/12"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{t.title}</div>
                {t.message ? <div className="mt-1 text-xs text-muted">{t.message}</div> : null}
              </div>
              <button
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted hover:text-white"
                onClick={() => remove(t.id)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
