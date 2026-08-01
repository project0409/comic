"use client";

import { useEffect } from "react";
import { useUiStore, type ResolvedTheme, type ThemeMode } from "@/store/uiStore";

const STORAGE_KEY = "fyp-theme-mode";
const THEME_MODES: ThemeMode[] = ["dark", "light", "system"];

function isThemeMode(value: string | null): value is ThemeMode {
  return Boolean(value && THEME_MODES.includes(value as ThemeMode));
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeModeProvider() {
  const themeMode = useUiStore((s) => s.themeMode);
  const setThemeMode = useUiStore((s) => s.setThemeMode);
  const setResolvedTheme = useUiStore((s) => s.setResolvedTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isThemeMode(stored)) {
      setThemeMode(stored);
    }
  }, [setThemeMode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    const applyTheme = () => {
      const resolved = themeMode === "system" ? getSystemTheme() : themeMode;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
      setResolvedTheme(resolved);
      window.localStorage.setItem(STORAGE_KEY, themeMode);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [setResolvedTheme, themeMode]);

  return null;
}
