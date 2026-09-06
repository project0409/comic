"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { RequireAuth } from "@/components/RequireAuth";
import { useCommentStore } from "@/store/commentStore";

type UploadStatus = "Processing" | "Pending Approval" | "Published" | "Rejected";
type FileRow = { id: string; name: string; progress: number; stage: "Processing" | "Compressing" | "Uploading" | "Done" };

export default function WriterDashboardPage() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const toast = useToastStore((s) => s.push);
  const comments = useCommentStore((s) => s.comments);
  const markReviewed = useCommentStore((s) => s.markReviewed);

  const stats = useMemo(
    () => [
      { label: "Total reads", value: "48,204" },
      { label: "Active series", value: "3" },
      { label: "Reader Reviews", value: "1,824" },
      { label: "Pending approvals", value: "2" }
    ],
    []
  );

  const [chapterRows, setChapterRows] = useState<
    Array<{ name: string; pages: number; date: string; status: UploadStatus; published: boolean }>
  >([
    { name: "Night City Blade — Ch. 4", pages: 42, date: "2026-05-18", status: "Pending Approval", published: false },
    { name: "Rose & Ruin — Ch. 12", pages: 38, date: "2026-05-12", status: "Published", published: true },
    { name: "The Hollow Map — Ch. 2", pages: 26, date: "2026-05-07", status: "Rejected", published: false }
  ]);

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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-4xl tracking-widest">Writer Dashboard</div>
          <div className="text-sm text-muted">Upload new chapters · Track approval status</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-white/10 bg-card p-5">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-2xl tracking-widest">Upload New Chapter</div>

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
          <div className="font-display text-2xl tracking-widest">Chapter metadata</div>
          <div className="mt-4 space-y-3">
            <label className="block text-xs text-muted">
              Series selector
              <select className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none">
                <option>Night City Blade</option>
                <option>Rose & Ruin</option>
                <option>The Hollow Map</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-muted">
                Chapter #
                <input className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none" defaultValue="4" />
              </label>
              <label className="block text-xs text-muted">
                Release date
                <input className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none" type="date" />
              </label>
            </div>
            <label className="block text-xs text-muted">
              Title
              <input className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none" defaultValue="Neon Vows" />
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
                toast({ tone: "success", title: "Upload submitted", message: "Chapter submitted for review (demo)." });
                setFiles([]);
              }}
            >
              Submit (disabled until all files processed)
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
            <div>Chapter</div>
            <div>Pages</div>
            <div>Upload date</div>
            <div>Status</div>
          </div>
          {chapterRows.map((r) => (
            <div key={r.name} className="grid grid-cols-4 border-t border-white/8 px-4 py-3 text-sm">
              <div className="font-semibold">{r.name}</div>
              <div className="text-muted">{r.pages}</div>
              <div className="text-muted">{r.date}</div>
              <div>
                <Badge tone={statusTone(r.status) as any}>{r.status}</Badge>
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
                    "ml-2 rounded-full px-2 py-1 text-xs",
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

      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-2xl tracking-widest">Reader Comments Inbox</div>
            <div className="text-sm text-muted">Comic and chapter comments sent from readers for writers and admins.</div>
          </div>
          <Badge tone="primary">{comments.filter((comment) => comment.status === "New").length} new</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted">
              No reader comments yet.
            </div>
          ) : (
            comments.slice(0, 8).map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{comment.seriesName}</div>
                  <Badge tone={comment.status === "New" ? "gold" : "muted"}>{comment.status}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {comment.targetType === "Comic" ? "Whole comic" : `Chapter ${comment.chapterId}`}
                  {comment.pageIndex ? ` / Page ${comment.pageIndex}` : ""} / {comment.readerName} / {new Date(comment.atIso).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-white/80">{comment.body}</div>
                {comment.status === "New" ? (
                  <Button className="mt-3" variant="outline" size="sm" onClick={() => markReviewed(comment.id)}>
                    Mark reviewed
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
