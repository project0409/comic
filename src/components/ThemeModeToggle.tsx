"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/cn";
import { useUiStore, type ThemeMode } from "@/store/uiStore";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Moon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System default", icon: Monitor }
];

export function ThemeModeToggle({ className }: { className?: string }) {
  const themeMode = useUiStore((s) => s.themeMode);
  const resolvedTheme = useUiStore((s) => s.resolvedTheme);
  const setThemeMode = useUiStore((s) => s.setThemeMode);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const activeOption = useMemo(() => OPTIONS.find((option) => option.value === themeMode) ?? OPTIONS[2], [themeMode]);
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative inline-flex",
        className
      )}
    >
      <button
        type="button"
        className="sf-clickable sf-comic-panel sf-comic-surface grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-card/90 text-white shadow-glow hover:border-highlight/35"
        aria-label={`Open theme options. Current mode ${themeMode}. Resolved theme ${resolvedTheme}.`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${activeOption.label}`}
        onClick={() => setOpen((value) => !value)}
      >
        <ActiveIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div
          className="sf-comic-panel sf-comic-surface absolute right-0 top-14 z-50 flex items-center gap-1 rounded-full border border-white/10 bg-card/95 p-1 shadow-2xl"
          role="menu"
          aria-label="Theme options"
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = themeMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "sf-clickable grid h-10 w-10 place-items-center rounded-full border transition",
                  active
                    ? "border-white/80 bg-primary/20 text-white shadow-[0_0_22px_rgba(255,51,102,0.22)]"
                    : "border-transparent text-muted hover:border-highlight/35 hover:bg-white/8 hover:text-white"
                )}
                role="menuitemradio"
                aria-label={`Use ${option.label} theme`}
                aria-checked={active}
                title={option.label}
                onClick={() => {
                  setThemeMode(option.value);
                  setOpen(false);
                }}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
