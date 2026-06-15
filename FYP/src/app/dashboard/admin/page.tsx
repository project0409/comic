"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

type Row = {
  id: string;
  chapterName: string;
  seriesId: string;
  chapterId: string;
  pages: number;
  uploadedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  isPublished: boolean;
};

export default function AdminPublishingGatePage() {
  const toast = useToastStore((s) => s.push);
  const role = useAuthStore((s) => s.role);

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-3xl tracking-widest">Admin Gate</div>
          <div className="mt-2 text-sm text-muted">
            Admin login normal login lo undadu. Separate admin login use cheyyandi.
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/admin/login">
              <Button variant="primary">Go to Admin Login</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [rows, setRows] = useState<Row[]>([
    {
      id: "r1",
      chapterName: "Night City Blade — Ch. 4",
      seriesId: "s1",
      chapterId: "c4",
      pages: 42,
      uploadedAt: "2026-05-18",
      status: "Pending",
      isPublished: false
    },
    {
      id: "r2",
      chapterName: "Rose & Ruin — Ch. 13",
      seriesId: "s2",
      chapterId: "c13",
      pages: 36,
      uploadedAt: "2026-05-22",
      status: "Pending",
      isPublished: false
    }
  ]);

  const pendingCount = useMemo(() => rows.filter((r) => r.status === "Pending").length, [rows]);

  function setStatus(id: string, status: Row["status"]) {
    setRows((s) =>
      s.map((r) => (r.id === id ? { ...r, status, isPublished: status === "Approved" ? r.isPublished : false } : r))
    );
    toast({
      tone: status === "Approved" ? "success" : status === "Rejected" ? "danger" : "default",
      title: `Chapter ${status}`,
      message: "Action applied locally (demo)."
    });
  }

  function togglePublished(id: string) {
    setRows((s) =>
      s.map((r) => (r.id === id ? { ...r, isPublished: !r.isPublished } : r))
    );
    toast({ tone: "default", title: "Publish toggled", message: "is_published updated (demo)." });
  }

  function bulkApprove() {
    setRows((s) => s.map((r) => (r.status === "Pending" ? { ...r, status: "Approved" } : r)));
    toast({ tone: "success", title: "Bulk approved", message: "All pending chapters approved (demo)." });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-4xl tracking-widest">Admin Gate</div>
          <div className="text-sm text-muted">Approve / Reject writer uploads</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="muted">{pendingCount} pending</Badge>
          <Button variant="primary" onClick={bulkApprove}>
            Bulk approve
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-card">
        <div className="grid grid-cols-5 bg-white/5 px-4 py-3 text-xs text-muted">
          <div>Chapter</div>
          <div>Pages</div>
          <div>Uploaded</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-5 items-center border-t border-white/8 px-4 py-4 text-sm">
            <div className="font-semibold">{r.chapterName}</div>
            <div className="text-muted">{r.pages}</div>
            <div className="text-muted">{r.uploadedAt}</div>
            <div>
              <Badge tone={r.status === "Approved" ? "primary" : r.status === "Rejected" ? "danger" : "gold"}>
                {r.status}
              </Badge>
              <div className="mt-1 text-xs text-muted">
                is_published:{" "}
                <span className={r.isPublished ? "text-emerald-400" : "text-muted"}>
                  {String(r.isPublished)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Link href={`/read/${r.chapterId}`} title="Read-only preview prototype">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setStatus(r.id, "Approved")}>
                Approve
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatus(r.id, "Rejected")}>
                Reject
              </Button>
              <Button
                variant={r.isPublished ? "danger" : "primary"}
                size="sm"
                onClick={() => togglePublished(r.id)}
                disabled={r.status !== "Approved"}
                title={r.status !== "Approved" ? "Disabled until approved" : "Toggle publish"}
              >
                {r.isPublished ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
