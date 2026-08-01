"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { RequireAuth } from "@/components/RequireAuth";
import { useToastStore } from "@/store/toastStore";
import { useUiStore, type ThemeMode } from "@/store/uiStore";

const THEME_OPTIONS: { value: ThemeMode; label: string; helper: string }[] = [
  { value: "dark", label: "Dark", helper: "Deep comic night" },
  { value: "light", label: "Light", helper: "Bright reading view" },
  { value: "system", label: "System", helper: "Follow device" }
];

export default function SettingsPage() {
  const toast = useToastStore((s) => s.push);
  const themeMode = useUiStore((s) => s.themeMode);
  const resolvedTheme = useUiStore((s) => s.resolvedTheme);
  const setThemeMode = useUiStore((s) => s.setThemeMode);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [spoilerShield, setSpoilerShield] = useState(true);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-3xl tracking-widest">Settings</div>
          <div className="mt-1 text-sm text-muted">Control reading and notification preferences.</div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-surface/70 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Background theme</div>
                <div className="mt-1 text-xs text-muted">
                  Current view: <span className="capitalize text-highlight">{resolvedTheme}</span>
                </div>
              </div>
              <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
                {THEME_OPTIONS.map((option) => {
                  const active = themeMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setThemeMode(option.value)}
                      className={cn(
                        "sf-clickable rounded-2xl border px-3 py-2 text-left transition sm:min-w-28",
                        active
                          ? "border-primary/45 bg-primary/18 text-white shadow-[0_0_22px_rgba(255,51,102,0.16)]"
                          : "border-white/10 bg-white/5 text-muted hover:border-highlight/35 hover:bg-white/8 hover:text-white"
                      )}
                      aria-pressed={active}
                    >
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="block text-[11px] leading-tight opacity-75">{option.helper}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10">
            {[
              { label: "Email notifications", value: emailAlerts, setValue: setEmailAlerts },
              { label: "Auto-play reader audio", value: autoPlayAudio, setValue: setAutoPlayAudio },
              { label: "Spoiler shield", value: spoilerShield, setValue: setSpoilerShield }
            ].map((item) => (
              <label key={item.label} className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
                <span className="text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.setValue(e.target.checked)}
                  className="h-5 w-5 accent-[var(--sf-primary)]"
                />
              </label>
            ))}
          </div>

          <Button
            className="mt-5"
            variant="primary"
            onClick={() => toast({ tone: "success", title: "Settings saved", message: "Your preferences were updated." })}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </RequireAuth>
  );
}
