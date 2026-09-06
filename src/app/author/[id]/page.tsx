"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "@/compat/next-navigation";
import Link from "@/compat/next-link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Heart, Users, BookOpen, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { InstagramAuthorStar } from "@/components/InstagramAuthorStar";
import { CatalogSeriesCard } from "@/features/discovery/CatalogSeriesCard";
import { mockAuthors, seriesList, releaseCalendar } from "@/lib/mockData";
import { useAuthorStore } from "@/store/authorStore";

export default function AuthorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Retrieve followed state from store
  const toggleFollow = useAuthorStore((s) => s.toggleFollow);
  const followedIds = useAuthorStore((s) => s.followedAuthorIds);
  const isFollowing = useMemo(() => followedIds.includes(id), [followedIds, id]);

  // Find author
  const author = useMemo(() => {
    return mockAuthors.find((a) => a.id === id) ?? null;
  }, [id]);

  // Filter published comics by this author
  const publishedComics = useMemo(() => {
    if (!author) return [];
    return seriesList.filter((s) => s.writerName.toLowerCase() === author.name.toLowerCase());
  }, [author]);

  // Filter upcoming comics by this author
  const upcomingComics = useMemo(() => {
    if (!author) return [];
    return releaseCalendar.filter(
      (rc) => rc.writerName && rc.writerName.toLowerCase() === author.name.toLowerCase()
    );
  }, [author]);

  const followerCount = useMemo(() => {
    if (!author) return 0;
    return isFollowing ? author.followerCount + 1 : author.followerCount;
  }, [author, isFollowing]);

  if (!author) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-white bg-background">
        <p className="text-lg text-muted">Author profile not found.</p>
        <Button variant="primary" onClick={() => router.push("/discover")}>
          Go to Discovery
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background text-white select-none">
      {/* Background glow base */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.06] blur-[150px]"
        style={{ backgroundColor: "#7C3AED" }}
      />

      {/* Nav back bar */}
      <div className="relative mx-auto max-w-5xl px-4 pt-6 z-20">
        <button
          onClick={() => router.back()}
          className="sf-clickable inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span>Back</span>
        </button>
      </div>

      <main className="relative mx-auto max-w-5xl px-4 py-8 space-y-10 z-10">
        {/* Profile Card Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {/* Avatar image with Instagram gradient story ring for top authors */}
            <div
              className={cn(
                "shrink-0 rounded-3xl overflow-hidden flex items-center justify-center shadow-xl transition-transform hover:scale-105",
                author.isTopAuthor
                  ? "p-[3.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                  : "border-2 border-primary/30 bg-black/40 p-2"
              )}
            >
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-[20px] bg-black/70 flex items-center justify-center p-2">
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Author info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-display text-3xl font-bold tracking-widest text-white">
                      {author.name}
                    </h1>
                    {author.isTopAuthor && (
                      <InstagramAuthorStar size={24} title="Top Author · Verified Star" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Verified Creator
                    </span>
                    {author.isTopAuthor && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                        Top Author
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      <strong className="text-white font-bold">{followerCount.toLocaleString()}</strong> followers
                    </span>
                  </div>
                  <Button
                    variant={isFollowing ? "outline" : "primary"}
                    size="sm"
                    onClick={() => toggleFollow(author.id)}
                    className={isFollowing ? "border-primary text-primary hover:bg-primary/5" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isFollowing ? "fill-primary" : ""}`} />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted max-w-3xl">
                {author.bio}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Content sections grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Published Comics */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold tracking-wide text-white">
                Comics Uploaded ({publishedComics.length})
              </h2>
            </div>

            {publishedComics.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-card/20">
                <p className="text-sm text-muted">No published comics available for this author.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedComics.map((comic) => (
                  <CatalogSeriesCard key={comic.id} series={comic} />
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Upcoming comics list */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold tracking-wide text-white">
                Upcoming Pipeline
              </h2>
            </div>

            {upcomingComics.length === 0 ? (
              <div className="text-center py-8 rounded-2xl border border-dashed border-white/10 bg-card/20 p-4">
                <p className="text-xs text-muted">No upcoming comics scheduled in this creator's pipeline.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingComics.map((item) => (
                  <div
                    key={item.id}
                    className="sf-comic-card sf-comic-surface p-4 rounded-2xl border border-white/10 select-none space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative inline-flex items-center rounded-[999px_999px_999px_8px] bg-amber-400/25 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        {item.status === "ComingSoon" ? "Coming Soon" : "In Queue"}
                      </div>
                      <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
                        {item.genre} / {item.subgenre}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>
                        Release:{" "}
                        <span className={item.status === "InQueue" ? "text-amber-400 font-bold" : "text-white/80"}>
                          {item.releaseDateLabel}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
