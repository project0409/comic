"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Smooth glowing background */}
            <motion.div
              className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.95, 1.15, 0.95],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Centered logo with fade-in and scale animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // easeOutExpo
              }}
              className="relative"
            >
              <img
                src="/branding/fyp-logo.png"
                alt="FYP Logo"
                className="h-24 w-auto max-w-[280px] object-contain drop-shadow-[0_0_32px_rgba(255,51,102,0.4)]"
              />
            </motion.div>

            {/* Modern premium loading indicator below the logo */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="h-1 w-36 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-highlight"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <motion.span
                className="font-display text-[10px] uppercase tracking-widest text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                Loading Experience
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
