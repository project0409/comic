"use client";

import { useMemo, useState } from "react";
import Link from "@/compat/next-link";
import { BarChart3, BookOpen, Star, Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { RequireAuth } from "@/components/RequireAuth";
import { Navbar } from "@/features/discovery/Navbar";
import { seriesList, chaptersBySeries } from "@/lib/mockData";

type UploadStatus = "Processing" | "Pending Approval" | "Published" | "Rejected";
type FileRow = { id: string; name: string; progress: number; stage: "Processing" | "Compressing" | "Uploading" | "Done" };

export default function WriterDashboardPage() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const toast = useToastStore((s) => s.push);

  const writerComic = seriesList.find((s) => s.id === "s3") || seriesList[0]!;
  const writerChapters = chaptersBySeries[writerComic.id] ?? [];

  const stats = useMemo(
    () => [
      { label: "Total reads", value: writerComic.readers.toLocaleString() },
      { label: "Active series", value: "1" },
      { label: "Reader Reviews", value: "1,824" },
      { label: "Published chapters", value: `${writerChapters.length}` }
    ],
    [writerComic, writerChapters]
  );

  const [chapterRows, setChapterRows] = useState<
    Array<{
      name: string;
      pages: number;
      date: string;
      status: UploadStatus;
      published: boolean;
      description?: string;
      comicId?: string;
      chapterId?: string;
    }>
  >([
    {
      name: "Night City Blade — Ch. 4: Neon Vows",
      pages: 42,
      date: "2026-05-18",
      status: "Published",
      published: true,
      comicId: "s3",
      chapterId: "c_s3_ch4",
      description: "A blade-for-hire navigates the neon underbelly of a megacity where every alley hides a syndicate."
    },
    {
      name: "Night City Blade — Ch. 3: Rooftop Sniper",
      pages: 36,
      date: "2026-05-12",
      status: "Published",
      published: true,
      comicId: "s3",
      chapterId: "c_s3_ch3",
      description: "High-ground showdowns across the rain-slick rooftops of Neo-Kyoto."
    },
    {
      name: "Night City Blade — Ch. 2: Neon Syndicate",
      pages: 32,
      date: "2026-05-06",
      status: "Published",
      published: true,
      comicId: "s3",
      chapterId: "c_s3_ch2",
      description: "Infiltrating the criminal syndicate controlling the neon district power grid."
    },
    {
      name: "Night City Blade — Ch. 1: Alley Ambush",
      pages: 28,
      date: "2026-05-01",
      status: "Published",
      published: true,
      comicId: "s3",
      chapterId: "c_s3_ch1",
      description: "The blade-for-hire takes on an impossible contract in the lowest slums."
    },
    {
      name: "Rose & Ruin — Ch. 12",
      pages: 38,
      date: "2026-05-12",
      status: "Published",
      published: true,
      comicId: "s5",
      description: "Two rival pilots trade encrypted love notes across a citywide high-speed hover race."
    },
    {
      name: "The Hollow Map — Ch. 2",
      pages: 26,
      date: "2026-05-07",
      status: "Rejected",
      published: false,
      comicId: "s4",
      description: "Cartographers chart a quantum dimension that rewrites its geometry nightly."
    }
  ]);

  const [selectedSeries, setSelectedSeries] = useState("Night City Blade");
  const [isNewSeries, setIsNewSeries] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesGenre, setNewSeriesGenre] = useState("Sci-Fi");
  const [chapterNumber, setChapterNumber] = useState("5");
  const [releaseDate, setReleaseDate] = useState("");
  const [chapterTitle, setChapterTitle] = useState("Shadow Protocol");
  const [description, setDescription] = useState("");

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const next: FileRow[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      progress: 10,
      stage: "Processing"
    }));
    setFiles((s) => [...next, ...s]);

    // Prototype progress simulation
    next.forEach((row) => {
      const timer = setInterval(() => {
        setFiles((prev) =>
          prev.map((r) => {
            if (r.id !== row.id) return r;
            const p = Math.min(100, r.progress + 12);
            const stage = p < 40 ? "Processing" : p < 70 ? "Compressing" : p < 100 ? "Uploading" : "Done";
            return { ...r, progress: p, stage };
          })
        );
      }, 380);
      setTimeout(() => clearInterval(timer), 4200);
    });
  }

  const statusTone = (s: UploadStatus) =>
    s === "Processing" ? "gold" : s === "Pending Approval" ? "primary" : s === "Published" ? "primary" : "danger";

  return (
    <RequireAuth roles={["writer", "admin"]}>
      <Navbar />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-display text-4xl tracking-widest">Writer Dashboard</div>
          <div className="text-sm text-muted">Upload new chapters · Track approval status</div>
        </div>
        <Link href="/dashboard/analytics">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>View Analytics</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-white/10 bg-card p-5">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* My Published Comics & Chapter Analytics Showcase */}
      <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl tracking-widest">My Published Comics</span>
              <Badge tone="primary">1 Active Series</Badge>
            </div>
            <div className="text-xs text-muted mt-1">
              Select your comic or individual chapters below to view in-depth reader analytics, comments, and reviews.
            </div>
          </div>
          <Link href={`/dashboard/analytics?comic=${writerComic.id}`}>
            <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
              <BarChart3 className="h-4 w-4" />
              <span>Full Analytics Overview</span>
            </Button>
          </Link>
        </div>

        {/* Primary Comic Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 transition-all">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative h-44 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img
                src={writerComic.coverUrl}
                alt={writerComic.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge tone="gold" className="text-[10px] px-1.5 py-0.5">{writerComic.genre}</Badge>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-bold tracking-wide text-white">
                    {writerComic.title}
                  </h3>
                  <Badge tone="primary" className="text-xs">Published</Badge>
                </div>
                <div className="text-xs text-muted mt-1">
                  Author: <span className="text-white font-medium">{writerComic.writerName} (You)</span> · {writerChapters.length} Chapters Released
                </div>
                <p className="text-xs text-muted/90 mt-2 line-clamp-2 leading-relaxed">
                  {writerComic.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/8">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-white">{writerComic.readers.toLocaleString()}</span> reads
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-white">{writerComic.rating}</span> rating
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-sky-400" />
                    <span className="font-semibold text-white">{writerChapters.length}</span> chapters
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/comic/${writerComic.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted hover:text-white">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Reader View</span>
                    </Button>
                  </Link>
                  <Link href={`/dashboard/analytics?comic=${writerComic.id}`}>
                    <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>View Comic Analytics</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters of Comic */}
          <div className="mt-5 pt-4 border-t border-white/8">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Chapters & Chapter-Wise Analytics
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {writerChapters.map((ch) => (
                <div
                  key={ch.id}
                  className="rounded-xl border border-white/8 bg-black/25 p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                      <span>Chapter {ch.number}</span>
                      <span className="text-primary/90 font-medium">Free</span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {ch.title}
                    </div>
                    <div className="text-[11px] text-muted/70 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{ch.releaseDateIso}</span>
                    </div>
                  </div>

                  <Link href={`/dashboard/analytics?comic=${writerComic.id}&chapter=${ch.id}`} className="mt-3 block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5 border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>View Analytics</span>
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-2xl tracking-widest">Upload New Comic / Chapter</div>

          <label className="mt-4 block">
            <div className="grid place-items-center rounded-3xl border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center">
              <div className="text-sm font-semibold">Drop raw comic pages here (.JPG/.PNG)</div>
              <div className="mt-1 text-xs text-muted">Prototype: choose files to simulate processing</div>
              <input
                className="mt-4 w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-white hover:file:bg-white/15"
                type="file"
                multiple
                accept="image/png,image/jpeg"
                onChange={(e) => onPickFiles(e.target.files)}
              />
            </div>
          </label>

          {files.length ? (
            <div className="mt-4 space-y-2">
              {files.slice(0, 6).map((f) => (
                <div key={f.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{f.name}</div>
                      <div className="text-xs text-muted">{f.stage}</div>
                    </div>
                    <div className="text-xs tabular-nums text-muted">{f.progress}%</div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${f.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-2xl tracking-widest">Comic & Chapter Metadata</div>
          <div className="mt-4 space-y-3">
            <label className="block text-xs text-muted">
              Series selector
              <select
                value={isNewSeries ? "__new__" : selectedSeries}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setIsNewSeries(true);
                  } else {
                    setIsNewSeries(false);
                    setSelectedSeries(e.target.value);
                  }
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none"
              >
                <option value="Night City Blade">Night City Blade</option>
                <option value="Rose & Ruin">Rose & Ruin</option>
                <option value="The Hollow Map">The Hollow Map</option>
                <option value="Cyberpunk Odyssey: Neo-Zenith">Cyberpunk Odyssey: Neo-Zenith</option>
                <option value="Shadow of the Dragon">Shadow of the Dragon</option>
                <option value="__new__">+ Create New Comic Series</option>
              </select>
            </label>

            {isNewSeries && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <label className="block text-xs text-muted">
                  New Comic Title
                  <input
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none text-white placeholder:text-muted/50"
                    placeholder="e.g. Iron Vow"
                    value={newSeriesTitle}
                    onChange={(e) => setNewSeriesTitle(e.target.value)}
                  />
                </label>
                <label className="block text-xs text-muted">
                  Genre
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none text-white"
                    value={newSeriesGenre}
                    onChange={(e) => setNewSeriesGenre(e.target.value)}
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Action">Action</option>
                    <option value="Romance">Romance</option>
                    <option value="Horror">Horror</option>
                    <option value="Mystery">Mystery</option>
                  </select>
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-muted">
                Chapter #
                <input
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none text-white"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(e.target.value)}
                />
              </label>
              <label className="block text-xs text-muted">
                Release date
                <input
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none text-white"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </label>
            </div>

            <label className="block text-xs text-muted">
              Chapter Title
              <input
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none text-white"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
              />
            </label>

            {/* Comic / Chapter Description Box */}
            <label className="block text-xs text-muted">
              Comic / Chapter Description
              <textarea
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-muted/50 outline-none focus:border-primary/50 transition-colors resize-none"
                rows={3}
                placeholder="Write a brief synopsis or description about this comic / chapter release..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="block text-xs text-muted">
              Access type
              <input className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none text-muted" defaultValue="Free Release (Standard)" readOnly />
            </label>

            <Button
              className="w-full"
              variant="primary"
              disabled={files.length === 0 || files.some((f) => f.stage !== "Done")}
              onClick={() => {
                const seriesName = isNewSeries ? newSeriesTitle.trim() || "Untitled Comic" : selectedSeries;
                const newRow = {
                  name: `${seriesName} — Ch. ${chapterNumber}${chapterTitle ? `: ${chapterTitle}` : ""}`,
                  pages: files.length || 24,
                  date: releaseDate || new Date().toISOString().split("T")[0],
                  status: "Pending Approval" as UploadStatus,
                  published: false,
                  description: description.trim() || undefined
                };
                setChapterRows((prev) => [newRow, ...prev]);
                toast({
                  tone: "success",
                  title: "Upload submitted",
                  message: `"${seriesName}" submitted with description for review (demo).`
                });
                setFiles([]);
                setDescription("");
              }}
            >
              Submit Upload (disabled until all files processed)
            </Button>

            <div className="text-xs text-muted">
              Publish toggle is disabled until admin approves (see <code className="rounded bg-black/30 px-1.5 py-0.5">/dashboard/admin</code>).
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="font-display text-2xl tracking-widest">Chapter Status List</div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-4 bg-white/5 px-4 py-2 text-xs text-muted">
            <div>Comic / Chapter</div>
            <div>Pages</div>
            <div>Upload date</div>
            <div>Status</div>
          </div>
          {chapterRows.map((r) => (
            <div key={r.name} className="grid grid-cols-4 border-t border-white/8 px-4 py-3 text-sm">
              <div className="min-w-0 pr-2">
                <div className="font-semibold truncate">{r.name}</div>
                {r.description && (
                  <div className="text-xs text-muted/80 line-clamp-1 mt-0.5 italic">
                    &ldquo;{r.description}&rdquo;
                  </div>
                )}
              </div>
              <div className="text-muted">{r.pages}</div>
              <div className="text-muted">{r.date}</div>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge tone={statusTone(r.status) as any}>{r.status}</Badge>
                {r.published && (
                  <Link
                    href={
                      r.chapterId && r.comicId
                        ? `/dashboard/analytics?comic=${r.comicId}&chapter=${r.chapterId}`
                        : r.comicId
                        ? `/dashboard/analytics?comic=${r.comicId}`
                        : `/dashboard/analytics`
                    }
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                      title="View chapter analytics"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>Analytics</span>
                    </button>
                  </Link>
                )}
                <button
                  disabled={r.status !== "Published"}
                  onClick={() => {
                    if (r.status !== "Published") {
                      toast({
                        tone: "default",
                        title: "Publish disabled",
                        message: "Admin approval tarvatha publish cheyyandi."
                      });
                      return;
                    }
                    setChapterRows((prev) =>
                      prev.map((x) => (x.name === r.name ? { ...x, published: !x.published } : x))
                    );
                    toast({
                      tone: "success",
                      title: r.published ? "Unpublished" : "Published",
                      message: "Publish toggle updated (demo)."
                    });
                  }}
                  className={cn(
                    "rounded-full px-2 py-1 text-xs cursor-pointer",
                    r.status !== "Published" ? "bg-white/5 text-muted opacity-70" : "bg-white/10 text-white"
                  )}
                  title="Prototype"
                >
                  {r.published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
