"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { RequireAuth } from "@/components/RequireAuth";

export default function AnalyticsDashboardPage() {
  const [chapter, setChapter] = useState("Night City Blade — Ch. 4");

  const metrics = useMemo(
    () => [
      { label: "Total Reads", value: "12,804" },
      { label: "Avg Linger Time", value: "5m 42s" },
      { label: "Completion Rate", value: "71%" },
      { label: "AI Queries", value: "1,204" }
    ],
    []
  );

  const heat = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const linger = Math.max(3, Math.round(40 - i * 1.2 + (i % 3) * 2));
        const t = i / 23;
        const color =
          t < 0.45 ? "bg-emerald-500/70" : t < 0.7 ? "bg-amber-500/75" : "bg-red-500/75";
        return { page: i + 1, lingerSec: linger, color };
      }),
    []
  );

  const aiFeed = useMemo(
    () => [
      { page: 12, q: "Why does the blade glow violet?", count: 48 },
      { page: 9, q: "Who is the masked informant?", count: 32 },
      { page: 6, q: "What does the coin sigil mean?", count: 21 }
    ],
    []
  );

  return (
    <RequireAuth roles={["writer", "admin"]}>
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-4xl tracking-widest">Analytics</div>
          <div className="text-sm text-muted">Engagement · Drop-off · Lore Master usage</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Chapter</span>
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-2 text-sm outline-none"
          >
            <option>Night City Blade — Ch. 4</option>
            <option>Rose & Ruin — Ch. 12</option>
            <option>The Hollow Map — Ch. 2</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-3xl border border-white/10 bg-card p-5">
            <div className="text-xs text-muted">{m.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="font-display text-2xl tracking-widest">Drop-off Heatmap</div>
            <Badge tone="muted">{chapter}</Badge>
          </div>

          <div className="mt-5 flex items-end gap-1.5">
            {heat.map((h) => (
              <div key={h.page} className="group relative flex-1">
                <div
                  className={`w-full rounded-t-md ${h.color}`}
                  style={{ height: `${Math.min(140, h.lingerSec * 3)}px` }}
                />
                <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-2 py-1 text-[11px] text-white group-hover:block">
                  Page {h.page} · {h.lingerSec}s
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted">Green = high engagement → Red = drop-off point</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-2xl tracking-widest">AI Query Feed</div>
          <div className="mt-4 space-y-3">
            {aiFeed.map((r) => (
              <div key={r.q} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted">Page {r.page}</div>
                  <Badge tone="primary">{r.count}x</Badge>
                </div>
                <div className="mt-2 text-sm font-semibold">{r.q}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="font-display text-2xl tracking-widest">Engagement Flow Map</div>
        <div className="mt-2 text-sm text-muted">
          Visual journey map (prototype): skip patterns, re-read loops, bookmark clusters, reaction density per page.
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-muted">Re-read loops</div>
            <div className="mt-2 text-sm">Page 7 → Page 6 (14%)</div>
            <div className="text-sm">Page 12 → Page 9 (9%)</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-muted">Bookmark clusters</div>
            <div className="mt-2 text-sm">Panels around Page 11 (hotspot)</div>
            <div className="text-sm">Panels around Page 18 (secondary)</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-muted">Reaction density</div>
            <div className="mt-2 text-sm">🔥 peaks at Page 12</div>
            <div className="text-sm">🤯 peaks at Page 9</div>
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}

