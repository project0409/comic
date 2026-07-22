"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Tabs } from "@/components/Tabs";
import type { Chapter, Series } from "@/lib/types";
import { UnlockModal } from "@/features/economy/UnlockModal";
import { useUiStore } from "@/store/uiStore";

type TabKey = "chapters" | "about" | "community";

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tab, setTab] = useState<TabKey>("chapters");
  const [unlockTarget, setUnlockTarget] = useState<Chapter | null>(null);
  const setAmbient = useUiStore((s) => s.setAmbientColor);

  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then((list: Series[]) => {
        const s = list.find((x) => x.id === id) ?? null;
        setSeries(s);
        if (s) setAmbient(s.ambientColorHex);
      });
    fetch(`/api/series/${id}/chapters`)
      .then((r) => r.json())
      .then(setChapters)
      .catch(() => setChapters([]));
  }, [id, setAmbient]);

  const heroStyle = useMemo(() => {
    return {
      background:
        "radial-gradient(900px 520px at 20% 10%, rgba(255,51,102,0.24), transparent 60%)," +
        "radial-gradient(900px 520px at 80% 20%, rgba(0,229,255,0.14), transparent 60%)," +
        "radial-gradient(760px 460px at 72% 82%, rgba(255,193,7,0.1), transparent 64%)," +
        "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))"
    } as const;
  }, []);

  if (!series) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-muted">Loading series…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <div className="relative overflow-hidden border-b border-white/8 bg-surface">
        <div className="absolute inset-0 opacity-70" style={heroStyle} />
        <motion.div
          className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[220px_1fr] md:py-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          <div className="aspect-[3/4] w-[220px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary/10">
            <img
              src={series.coverUrl}
              alt={`${series.title} cover`}
              className="sf-comic-image h-full w-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl tracking-widest drop-shadow-[0_0_18px_rgba(255,51,102,0.18)] md:text-5xl">
              {series.title}
            </h1>
            <div className="text-sm text-white/70">by {series.writerName}</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="muted">{series.genre}</Badge>
              <Badge tone="primary">{series.readers.toLocaleString()} readers</Badge>
              {series.earlyAccessPriceCoins ? <Badge tone="gold">Early Access</Badge> : null}
            </div>

            <div className="pt-2">
              <Tabs<TabKey>
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "chapters", label: "Chapters", badge: String(chapters.length) },
                  { value: "about", label: "About" },
                  { value: "community", label: "Community Reactions" }
                ]}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.main
        className="mx-auto max-w-5xl space-y-6 px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.36 }}
      >
        {tab === "chapters" ? (
          <div className="space-y-3">
            {chapters.map((c) => {
              const badgeTone = c.status === "Free" ? "primary" : c.status === "Coins" ? "gold" : "muted";
              const badgeText = c.status === "Coins" ? `${c.coinPrice ?? 5} Coins` : c.status;
              return (
                <motion.div
                  key={c.id}
                  className="sf-comic-card flex flex-col gap-3 rounded-2xl border border-white/10 bg-card p-4 md:flex-row md:items-center md:justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <div className="font-semibold">
                      Chapter {c.number}: {c.title}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {new Date(c.releaseDateIso).toLocaleDateString()} ·{" "}
                      <Badge tone={badgeTone as any}>{badgeText}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.isLocked ? (
                      <Button variant="gold" onClick={() => setUnlockTarget(c)}>
                        Unlock
                      </Button>
                    ) : (
                      <Link href={`/read/${c.id}`}>
                        <Button variant="primary">Read Now</Button>
                      </Link>
                    )}
                    <Button variant="ghost" onClick={() => setTab("about")}>
                      Details
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {tab === "about" ? (
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5">
            <div className="font-display text-2xl tracking-widest">About</div>
            <p className="mt-2 text-sm text-white/70">
              This is a UI prototype. Wire these fields to your real backend later (series synopsis, tags, content warnings,
              community guidelines, etc.).
            </p>
          </div>
        ) : null}

        {tab === "community" ? (
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5">
            <div className="font-display text-2xl tracking-widest">Community Reactions</div>
            <p className="mt-2 text-sm text-white/70">
              Readers’ emoji drops appear here (fed by <code className="rounded bg-black/30 px-1.5 py-0.5">/api/interactions/react</code>).
            </p>
          </div>
        ) : null}
      </motion.main>

      <UnlockModal
        open={!!unlockTarget}
        chapter={unlockTarget}
        onClose={() => setUnlockTarget(null)}
        onUnlocked={() => setUnlockTarget(null)}
      />
    </div>
  );
}
