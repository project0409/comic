"use client";

import { cn } from "./cn";

export function Tabs<T extends string>({
  value,
  onChange,
  tabs
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: Array<{ value: T; label: string; badge?: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
              active ? "bg-card text-white shadow" : "text-muted hover:text-white hover:bg-white/5"
            )}
          >
            <span className="font-medium">{t.label}</span>
            {t.badge ? (
              <span className={cn("rounded-full px-2 py-0.5 text-[11px]", active ? "bg-primary/25" : "bg-white/10")}>
                {t.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

