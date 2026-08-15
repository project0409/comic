"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/compat/next-link";
import { useParams, useRouter } from "@/compat/next-navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Tabs } from "@/components/Tabs";
import type { Chapter, Series } from "@/lib/types";
import { UnlockModal } from "@/features/economy/UnlockModal";
import { canGuestRead } from "@/lib/guestReaderLimit";
import { useUiStore } from "@/store/uiStore";
import { useWalletStore } from "@/store/walletStore";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useCommentStore } from "@/store/commentStore";

type TabKey = "chapters" | "about" | "community";

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const displayName = useAuthStore((s) => s.displayName);
  const comments = useCommentStore((s) => s.comments);
  const addComment = useCommentStore((s) => s.addComment);
  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tab, setTab] = useState<TabKey>("chapters");
  const [unlockTarget, setUnlockTarget] = useState<Chapter | null>(null);
  const [comicCommentText, setComicCommentText] = useState("");
  const setAmbient = useUiStore((s) => s.setAmbientColor);
  const unlockedChapterIds = useWalletStore((s) => s.unlockedChapterIds);

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

  const handleReadChapter = (chapterId: string) => {
    if (!isAuthenticated && !canGuestRead(chapterId)) {
      toast({
        tone: "danger",
        title: "Free Preview Limit Reached (2/2)",
        message: "You've read your 2 free preview comics! Please log in or create an account to continue reading."
      });
      router.push(`/login?redirectTo=/read/${chapterId}`);
    } else {
      router.push(`/read/${chapterId}`);
    }
  };

  const heroStyle = useMemo(() => {
    return {
      background:
        "radial-gradient(900px 520px at 20% 10%, rgba(255,51,102,0.24), transparent 60%)," +
        "radial-gradient(900px 520px at 80% 20%, rgba(0,229,255,0.14), transparent 60%)," +
        "radial-gradient(760px 460px at 72% 82%, rgba(255,193,7,0.1), transparent 64%)," +
        "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))"
    } as const;
  }, []);

  const comicComments = useMemo(
    () => comments.filter((comment) => comment.targetType === "Comic" && comment.seriesId === id),
    [comments, id]
  );

  function submitComicComment() {
    if (!series) return;
    const body = comicCommentText.trim();
    if (!body) return;
    addComment({
      targetType: "Comic",
      seriesId: series.id,
      seriesName: series.title,
      readerName: displayName || "Reader",
      body
    });
    setComicCommentText("");
  }

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
        
        {/* Dedicated "Exit Comic" Navigation button */}
        <div className="relative mx-auto max-w-5xl px-4 pt-4 z-20">
          <Link
            href="/discover"
            className="sf-clickable inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition shadow-sm"
            title="Exit Comic: Back to Comic Library"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Exit Comic (Back to Library)</span>
          </Link>
        </div>

        <motion.div
          className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:py-8"
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
            <h1 className="font-display text-4xl font-bold tracking-widest text-white drop-shadow-[0_0_18px_rgba(255,51,102,0.18)] md:text-5xl">
              {series.title}
            </h1>
            <div className="text-sm text-white/80">by <span className="font-semibold text-white">{series.writerName}</span></div>
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
          <div id="chapters" className="scroll-mt-28 space-y-3">
            {chapters.map((c) => {
              if (c.status === "ComingSoon") {
                return (
                  <motion.div
                    key={c.id}
                    className="relative overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 border border-white/10 text-lg shrink-0 select-none">
                        🚧
                      </div>
                      <div>
                        <div className="font-display text-lg tracking-wider font-semibold text-white">
                          Chapter {c.number}: Coming Soon
                        </div>
                        <p className="text-sm text-muted">
                          Stay tuned for exciting updates. Est. release: {new Date(c.releaseDateIso).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge tone="muted" className="px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold">
                        Under Construction
                      </Badge>
                    </div>
                  </motion.div>
                );
              }

              const isUnlocked = !c.isLocked || unlockedChapterIds.includes(c.id);
              const badgeTone = isUnlocked ? (c.status === "Free" ? "primary" : "gold") : (c.status === "Free" ? "primary" : c.status === "Coins" ? "gold" : "muted");
              const badgeText = isUnlocked && c.status === "Coins" ? "Unlocked" : c.status === "Coins" ? `${c.coinPrice ?? 5} Coins` : c.status;

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
                    <div className="font-semibold text-white text-base">
                      Chapter {c.number}: {c.title}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {new Date(c.releaseDateIso).toLocaleDateString()} ·{" "}
                      <Badge tone={badgeTone as any}>{badgeText}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isUnlocked ? (
                      <Button
                        variant="gold"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              tone: "danger",
                              title: "Login Required",
                              message: "Please log in to unlock chapters with coins."
                            });
                            router.push("/login");
                            return;
                          }
                          setUnlockTarget(c);
                        }}
                      >
                        Unlock
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={() => handleReadChapter(c.id)}>
                        Read Now
                      </Button>
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
            <div className="font-display text-2xl tracking-widest text-white">About</div>
            <p className="mt-2 text-sm text-white/80">
              {series.description}
            </p>
          </div>
        ) : null}

        {tab === "community" ? (
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5">
            <div className="font-display text-2xl tracking-widest text-white">Community Reactions</div>
            <p className="mt-2 text-sm text-white/80">
              Readers’ emoji drops appear here (fed by <code className="rounded bg-black/30 px-1.5 py-0.5 text-primary">/api/interactions/react</code>).
            </p>
          </div>
        ) : null}
        <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 font-display text-2xl tracking-widest text-white">
              <MessageSquare className="h-5 w-5 text-primary" />
              Comic comments
            </div>
            <div className="text-xs text-muted">Sent to writer and admin inboxes</div>
          </div>
          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <textarea
              value={comicCommentText}
              onChange={(event) => setComicCommentText(event.target.value)}
              className="min-h-20 flex-1 resize-none rounded-2xl border border-white/10 bg-black/25 p-3 text-sm outline-none placeholder:text-muted focus:border-primary/45"
              placeholder="Share feedback about this comic..."
            />
            <Button
              variant="primary"
              className="gap-2 self-stretch md:self-auto"
              onClick={submitComicComment}
              disabled={!comicCommentText.trim()}
            >
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
          {comicComments.length > 0 ? (
            <div className="mt-4 space-y-2">
              {comicComments.slice(0, 4).map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span>{comment.readerName}</span>
                    <span>{new Date(comment.atIso).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-white/80">{comment.body}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </motion.main>

      <UnlockModal
        open={!!unlockTarget}
        chapter={unlockTarget}
        onClose={() => setUnlockTarget(null)}
        onUnlocked={(unlockedId) => {
          if (unlockedId) {
            setChapters((prev) =>
              prev.map((c) => (c.id === unlockedId ? { ...c, isLocked: false } : c))
            );
          }
          setUnlockTarget(null);
        }}
      />
    </div>
  );
}
