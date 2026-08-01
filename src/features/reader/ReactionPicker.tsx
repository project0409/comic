"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";

const EMOJIS = ["🔥", "😭", "🤯", "💀", "👏"] as const;
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
  const [comment, setComment] = useState("");
  const [bookmark, setBookmark] = useState(false);
  const style = useMemo(
    () => ({
      left: x,
      top: y
    }),
    [x, y]
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0" onClick={onClose} aria-label="Close reaction picker" />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            style={style as any}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-full",
              "w-[min(320px,90vw)] rounded-2xl border border-white/12 bg-elevated/95 p-3 shadow-2xl backdrop-blur-xl"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted">Panel reaction</div>
              <button className="text-xs text-muted hover:text-white" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/20 text-xl hover:bg-white/8"
                  onClick={() =>
                    onPick({
                      emoji: e,
                      comment: comment.trim() ? comment.trim() : undefined,
                      bookmark
                    })
                  }
                >
                  {e}
                </button>
              ))}
            </div>

            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={bookmark}
                onChange={(e) => setBookmark(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/30"
              />
              Bookmark this panel to Vault
            </label>

            <textarea
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-muted"
              placeholder="Optional comment (250 chars)…"
              maxLength={250}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
