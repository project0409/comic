"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/components/cn";

export function SplashScreen() {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(false);
  const [animationStage, setAnimationStage] = useState<"line" | "morph">("line");

  const resolvedTheme = useUiStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    // Show only once per browser session
    const hasShown = sessionStorage.getItem("fyp-splash-shown");
    if (!hasShown) {
      setShow(true);
      setActive(true);
      sessionStorage.setItem("fyp-splash-shown", "true");

      // 450ms: Morphs vertical line and reveals logo image
      const t1 = setTimeout(() => {
        setAnimationStage("morph");
      }, 450);

      // 1600ms: Triggers exit crossfade overlay transition (2.0s total duration)
      const t2 = setTimeout(() => {
        setActive(false);
      }, 1600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {active ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center select-none overflow-hidden transition-colors duration-300",
            isDark ? "bg-[#0c0d12]" : "bg-[#f8fafc]"
          )}
        >
          {/* Soft blurred green backlight halo behind the logo */}
          <div className="absolute w-[280px] h-[280px] bg-[#22c55e]/6 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative flex flex-col items-center justify-center h-[380px] w-full max-w-[600px]">
            {/* Center vertical line morphing horizontally */}
            <motion.div
              initial={{ scaleY: 0, opacity: 1 }}
              animate={
                animationStage === "line"
                  ? { scaleY: 1, scaleX: 1 }
                  : {
                      scaleY: 0.05,
                      scaleX: 65,
                      opacity: 0,
                      transition: { duration: 0.45, ease: "easeOut" }
                    }
              }
              transition={{
                scaleY: { duration: 0.4, ease: "easeOut" }
              }}
              className="absolute w-[5px] h-[160px] bg-[#22c55e] z-10 shadow-[0_0_20px_#22c55e]"
              style={{ transformOrigin: "center" }}
            />

            {/* Logo Image Container with Spring Zoom Entry */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={
                animationStage === "morph"
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 50, scale: 0.95 }
              }
              transition={{
                y: { type: "spring", stiffness: 90, damping: 13, mass: 1, delay: 0.05 },
                scale: { type: "spring", stiffness: 90, damping: 13, mass: 1, delay: 0.05 },
                opacity: { duration: 0.35, delay: 0.05 }
              }}
              className="relative flex flex-col items-center justify-center z-20"
            >
              {/* Logo wrapper for cropping and light sweep */}
              <div className="relative overflow-hidden" style={{ clipPath: "inset(0 0 18% 0)" }}>
                <img
                  src="/branding/fyp-logo.png"
                  alt="Find Your Page Logo"
                  className="h-32 sm:h-40 w-auto object-contain"
                  style={{
                    filter: isDark
                      ? "drop-shadow(0 0 3px rgba(255, 255, 255, 0.45)) drop-shadow(0 12px 36px rgba(34, 197, 94, 0.25))"
                      : "drop-shadow(0 0 2px rgba(0, 0, 0, 0.08)) drop-shadow(0 12px 36px rgba(34, 197, 94, 0.18))"
                  }}
                />

                {/* Light Sweep Effect Overlay */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={animationStage === "morph" ? { x: "100%" } : { x: "-100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 mix-blend-overlay pointer-events-none"
                />
              </div>

              {/* Subtitle text: dynamically swaps color between white (dark mode) and green (light mode) */}
              <div
                className={cn(
                  "text-[10px] sm:text-xs tracking-[0.45em] uppercase font-light mt-1.5 font-sans transition-colors duration-300",
                  isDark ? "text-white/70" : "text-[#22c55e] font-medium"
                )}
              >
                FIND <span className={cn(isDark ? "text-[#22c55e] font-normal" : "text-[#16a34a] font-bold")}>YOUR</span> PAGE
              </div>
            </motion.div>

            {/* Subtle Floor Reflection (reflecting both logo and text) */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={
                animationStage === "morph"
                  ? { opacity: 0.12, y: 12, scale: 1 }
                  : { opacity: 0, y: 50, scale: 0.95 }
              }
              transition={{
                y: { type: "spring", stiffness: 90, damping: 13, mass: 1, delay: 0.05 },
                scale: { type: "spring", stiffness: 90, damping: 13, mass: 1, delay: 0.05 },
                opacity: { duration: 0.35, delay: 0.05 }
              }}
              className="absolute top-[72%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none select-none blur-[1px] z-10"
              style={{
                transformOrigin: "center top",
                transform: "scaleY(-1) translateX(-50%)"
              }}
            >
              {/* Flipped Logo Wrapper */}
              <div className="relative overflow-hidden" style={{ clipPath: "inset(0 0 18% 0)" }}>
                <img
                  src="/branding/fyp-logo.png"
                  alt="Reflection Logo"
                  className="h-32 sm:h-40 w-auto object-contain"
                />
              </div>
              {/* Flipped Subtitle */}
              <div
                className={cn(
                  "text-[10px] sm:text-xs tracking-[0.45em] uppercase font-light mt-1.5 font-sans",
                  isDark ? "text-white/70" : "text-[#22c55e] font-medium"
                )}
              >
                FIND <span className={cn(isDark ? "text-[#22c55e] font-normal" : "text-[#16a34a] font-bold")}>YOUR</span> PAGE
              </div>
              {/* Gradient fade mask matching active background theme */}
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  backgroundImage: isDark
                    ? "linear-gradient(to top, transparent, rgba(12, 13, 18, 0.7) 40%, #0c0d12 100%)"
                    : "linear-gradient(to top, transparent, rgba(248, 250, 252, 0.7) 40%, #f8fafc 100%)"
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
