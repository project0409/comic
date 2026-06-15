"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./cn";

export function Modal({
  open,
  title,
  onClose,
  children,
  className
}: {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="absolute inset-0 bg-black/75"
          />

          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={cn(
              "relative w-[min(520px,92vw)] overflow-hidden rounded-2xl border border-white/10 bg-elevated p-5 shadow-2xl",
              className
            )}
          >
            {title ? (
              <div className="mb-4 text-lg font-semibold tracking-wide">{title}</div>
            ) : null}
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
