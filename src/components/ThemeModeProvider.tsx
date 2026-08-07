"use client";

import { useEffect } from "react";
import { useUiStore, type ResolvedTheme, type ThemeMode } from "@/store/uiStore";

const STORAGE_KEY = "fyp-theme-mode";

export function ThemeModeProvider() {
  const themeMode = useUiStore((s) => s.themeMode);
  const setThemeMode = useUiStore((s) => s.setThemeMode);
  const setResolvedTheme = useUiStore((s) => s.setResolvedTheme);

  // Restore preference on refresh, default to dark
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const resolved = stored === "light" || stored === "dark" ? stored : "dark";
    setThemeMode(resolved);
  }, [setThemeMode]);

  // Apply resolved theme and save preference in localStorage
  useEffect(() => {
    const resolved = themeMode === "light" || themeMode === "dark" ? themeMode : "dark";
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    setResolvedTheme(resolved as ResolvedTheme);
    window.localStorage.setItem(STORAGE_KEY, resolved);
  }, [setResolvedTheme, themeMode]);

  return null;
}
