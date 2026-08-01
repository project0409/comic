"use client";

import { useRouter } from "@/compat/next-navigation";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useVaultStore } from "@/store/vaultStore";

export default function SavedStoriesPage() {
  const router = useRouter();
  const bookmarks = useVaultStore((s) => s.bookmarks);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-4xl tracking-widest">Saved Stories</div>
            <div className="text-sm text-muted">Panels and chapters saved from your vault.</div>
          </div>
          <Button variant="outline" onClick={() => router.push("/vault")}>
            Open Vault
          </Button>
        </div>

        {bookmarks.length === 0 ? (
          <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 text-sm text-muted">
            No saved stories yet. Open a series and save panels while reading.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="sf-comic-card overflow-hidden rounded-3xl border border-white/10 bg-card">
                <div className="aspect-[16/8] overflow-hidden">
                  <img
                    src={bookmark.thumbUrl ?? "/placeholders/panel-1.svg"}
                    alt={`${bookmark.seriesName} saved panel`}
                    className="sf-comic-image h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <div className="font-semibold">{bookmark.seriesName}</div>
                    <div className="text-xs text-muted">Chapter {bookmark.chapterId} · Page {bookmark.pageIndex}</div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => router.push(`/read/${bookmark.chapterId}`)}>
                    Continue Reading
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
