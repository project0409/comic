"use client";

import { useRouter } from "@/compat/next-navigation";
import { BookmarkCheck, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";

export default function SavedStoriesPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const removeBookmarkBySeries = useVaultStore((s) => s.removeBookmarkBySeries);

  const handleRemove = (seriesName: string) => {
    removeBookmarkBySeries(seriesName);
    toast({
      tone: "default",
      title: "Story Removed",
      message: `Removed "${seriesName}" from Saved Stories.`
    });
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-7 w-7 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white">
                Saved Stories
              </h1>
            </div>
            <p className="text-sm text-muted mt-1">Comics and chapters saved to your library for quick access.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/discover")}>
              Explore More
            </Button>
            <Button variant="outline" onClick={() => router.push("/vault")}>
              Open Vault
            </Button>
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <div className="sf-comic-panel sf-comic-surface flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card p-12 text-center space-y-4">
            <BookOpen className="h-12 w-12 text-muted/50" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-white">No saved stories yet</h3>
              <p className="text-sm text-muted max-w-md">
                Click the bookmark button on any comic in the catalog or trending row to save it here.
              </p>
            </div>
            <Button variant="primary" onClick={() => router.push("/discover")}>
              Browse Series Catalog
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="sf-comic-card sf-comic-surface group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={bookmark.thumbUrl ?? "/placeholders/panel-1.svg"}
                    alt={`${bookmark.seriesName} cover`}
                    className="sf-comic-image h-full w-full object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={() => handleRemove(bookmark.seriesName)}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white/80 hover:bg-rose-600 hover:text-white transition-all shadow-md"
                    title="Remove from Saved Stories"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-bold text-white text-base truncate">{bookmark.seriesName}</h3>
                    <p className="text-xs text-muted">Chapter {bookmark.chapterId} · Saved in library</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/read/${bookmark.chapterId}`)}
                    >
                      Read Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(bookmark.seriesName)}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
