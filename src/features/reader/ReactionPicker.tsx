"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/components/cn";
import { X } from "lucide-react";

export const EMOJIS = ["🔥", "❤️", "😭", "🤯", "💀", "👏", "⚡", "✨"] as const;
export type Emoji = (typeof EMOJIS)[number];

export function ReactionPicker({
  open,
  x,
  y,
  onPick,
  onClose
}: {
  open: boolean;
  x: number;
  y: number;
  onPick: (payload: { emoji: Emoji; comment?: string; bookmark?: boolean }) => void;
  onClose: () => void;
}) {
  const style = useMemo(() => {
    // Keep horizontally within viewport (dock is approx 380px wide)
    const safeX =
      typeof window !== "undefined"
        ? Math.max(190, Math.min(window.innerWidth - 190, x))
        : x;
    // Keep vertically within viewport
    const safeY =
      typeof window !== "undefined"
        ? Math.max(80, Math.min(window.innerHeight - 50, y))
        : y;

    return {
      left: safeX,
      top: safeY
    };
  }, [x, y]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop click dismisses */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-default"
            onClick={onClose}
            aria-label="Close emoji picker"
          />

          {/* Floating Emoji Dock */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            style={style as any}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-full",
              "rounded-2xl border border-primary/45 bg-[#080b18]/95 p-2 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(255,51,102,0.25)] backdrop-blur-2xl select-none"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / hint */}
            <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-semibold text-white/70 border-b border-white/10 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping" />
                <span>React to Panel</span>
              </span>
              <button
                type="button"
                className="text-muted hover:text-white p-0.5 rounded transition"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick 1-Click Emoji Row */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  title={`React ${e}`}
                  className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl sm:text-2xl hover:bg-primary/25 hover:border-primary hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer shadow-md"
                  onClick={() => onPick({ emoji: e })}
                >
                  <span>{e}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
