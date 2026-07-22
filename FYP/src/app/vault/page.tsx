"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/Tabs";
import { useVaultStore } from "@/store/vaultStore";
import { cn } from "@/components/cn";
import { RequireAuth } from "@/components/RequireAuth";

type TabKey = "bookmarks" | "reactions" | "highlights";

export default function VaultPage() {
  const [tab, setTab] = useState<TabKey>("bookmarks");
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const reactions = useVaultStore((s) => s.reactions);
  const highlights = useVaultStore((s) => s.highlights);
  const updateNote = useVaultStore((s) => s.updateBookmarkNote);

  const tabs = useMemo(
    () => [
      { value: "bookmarks" as const, label: "My Bookmarks", badge: String(bookmarks.length) },
      { value: "reactions" as const, label: "My Reactions", badge: String(reactions.length) },
      { value: "highlights" as const, label: "My Highlights", badge: String(highlights.length) }
    ],
    [bookmarks.length, reactions.length, highlights.length]
  );

  return (
    <RequireAuth>
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-4xl tracking-widest">Vault</div>
          <div className="text-sm text-muted">Scrapbook · Bookmarks · Reactions</div>
        </div>
      </div>

      <Tabs<TabKey> value={tab} onChange={setTab} tabs={tabs} />

      {tab === "bookmarks" ? (
        <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
          {bookmarks.length === 0 ? (
            <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 text-sm text-muted">
              No bookmarks yet. Long-press inside the reader to save a panel.
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="sf-comic-card break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={b.thumbUrl ?? "/placeholders/panel-1.svg"}
                    alt={`${b.seriesName} saved panel`}
                    className="sf-comic-image h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,51,102,0.24),rgba(0,229,255,0.08),rgba(255,193,7,0.08))]" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="text-sm font-semibold">{b.seriesName}</div>
                  <div className="text-xs text-muted">
                    Chapter {b.chapterId} · Page {b.pageIndex}
                  </div>
                  <textarea
                    className={cn(
                      "w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none",
                      "placeholder:text-muted"
                    )}
                    rows={3}
                    placeholder="Personal note…"
                    value={b.note ?? ""}
                    onChange={(e) => updateNote(b.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "reactions" ? (
        <div className="space-y-3">
          {reactions.length === 0 ? (
            <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 text-sm text-muted">
              No reactions yet. Long-press inside the reader to drop emojis.
            </div>
          ) : (
            reactions.map((r) => (
              <div key={r.id} className="sf-comic-card rounded-3xl border border-white/10 bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg">{r.emoji}</div>
                  <div className="text-xs text-muted">{new Date(r.atIso).toLocaleString()}</div>
                </div>
                <div className="mt-1 text-sm font-semibold">{r.seriesName}</div>
                <div className="text-xs text-muted">
                  Chapter {r.chapterId} · Page {r.pageIndex} · x:{Math.round(r.x)} y:{Math.round(r.y)}
                </div>
                {r.comment ? <div className="mt-2 text-sm text-white/75">{r.comment}</div> : null}
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "highlights" ? (
        <div className="space-y-3">
          {highlights.map((h) => (
            <div key={h.id} className="sf-comic-card rounded-3xl border border-white/10 bg-card p-5">
              <div className="text-sm text-muted">Chapter {h.chapterId}</div>
              <blockquote className="mt-2 border-l-2 border-primary/60 pl-4 text-lg text-white/85">
                “{h.quote}”
              </blockquote>
              {h.context ? <div className="mt-2 text-sm text-muted">{h.context}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
    </RequireAuth>
  );
}
