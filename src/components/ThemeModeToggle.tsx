"use client";

import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/components/cn";
import { useUiStore } from "@/store/uiStore";

export function ThemeModeToggle({ className }: { className?: string }) {
  const themeMode = useUiStore((s) => s.themeMode);
  const resolvedTheme = useUiStore((s) => s.resolvedTheme);
  const setThemeMode = useUiStore((s) => s.setThemeMode);

  // Fallback to resolved theme, ensuring it is either dark or light
  const currentTheme = resolvedTheme === "light" ? "light" : "dark";

  function toggleTheme() {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
  }

  return (
    <button
      type="button"
      id="tour-theme-toggle"
      onClick={toggleTheme}
      className={cn(
        "sf-clickable relative overflow-hidden grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-primary/40 hover:bg-white/8 cursor-pointer",
        className
      )}
      aria-label={`Switch theme. Current theme is ${currentTheme}.`}
      title={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {currentTheme === "light" ? (
          <motion.div
            key="light"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="text-amber-500"
          >
            <Sun className="h-5 w-5 fill-amber-500/20" />
          </motion.div>
        ) : (
          <motion.div
            key="dark"
            initial={{ scale: 0, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="text-primary"
          >
            <Moon className="h-5 w-5 fill-primary/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
