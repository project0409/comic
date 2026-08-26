"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/compat/next-navigation";
import { BookmarkCheck, BookOpen, Trash2, Folder, ChevronLeft, Pencil, Check, FolderHeart, ShieldAlert } from "lucide-react";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/components/cn";

type ViewTab = "all" | "playlists";

export default function SavedStoriesPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const collections = useVaultStore((s) => s.collections);
  const removeBookmarkBySeries = useVaultStore((s) => s.removeBookmarkBySeries);
  const removeBookmarkFromCollection = useVaultStore((s) => s.removeBookmarkFromCollection);
  const deleteCollection = useVaultStore((s) => s.deleteCollection);
  const renameCollection = useVaultStore((s) => s.renameCollection);

  const [activeTab, setActiveTab] = useState<ViewTab>("all");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Edit Collection name state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const activeCollection = useMemo(() => {
    return collections.find((col) => col.id === selectedCollectionId) ?? null;
  }, [collections, selectedCollectionId]);

  const activeCollectionBookmarks = useMemo(() => {
    if (!activeCollection) return [];
    return bookmarks.filter((bm) => activeCollection.bookmarkIds.includes(bm.id));
  }, [activeCollection, bookmarks]);

  const handleRemoveGlobal = (seriesName: string) => {
    removeBookmarkBySeries(seriesName);
    toast({
      tone: "default",
      title: "Story Removed",
      message: `Removed "${seriesName}" from Saved Stories.`
    });
  };

  const handleRemoveFromCollection = (collectionId: string, bookmarkId: string, seriesName: string) => {
    removeBookmarkFromCollection(collectionId, bookmarkId);
    toast({
      tone: "default",
      title: "Removed from Playlist",
      message: `Removed "${seriesName}" from playlist.`
    });
  };

  const handleRenameCollection = (id: string) => {
    const clean = editingName.trim();
    if (!clean) return;
    renameCollection(id, clean);
    setEditingId(null);
    setEditingName("");
    toast({
      tone: "success",
      title: "Playlist Renamed",
      message: `Renamed playlist to "${clean}".`
    });
  };

  const handleDeleteCollection = (id: string, name: string) => {
    deleteCollection(id);
    setSelectedCollectionId(null);
    toast({
      tone: "default",
      title: "Playlist Deleted",
      message: `Playlist "${name}" was deleted.`
    });
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-5">
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
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              Explore More
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/vault")}>
              Open Vault
            </Button>
          </div>
        </div>

        {/* Dynamic Folder Detail Sub-view */}
        {activeTab === "playlists" && activeCollection ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/15 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCollectionId(null)}
                  className="p-1.5 rounded-xl bg-black/35 hover:bg-black/60 text-white transition-colors"
                  aria-label="Back to playlists"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {editingId === activeCollection.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-primary/45 bg-black/40 text-sm outline-none text-white focus:ring-1 focus:ring-primary/40"
                    />
                    <button
                      onClick={() => handleRenameCollection(activeCollection.id)}
                      className="p-2 rounded-xl bg-primary text-white hover:bg-primary/95"
                      title="Save"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-xl font-bold text-white">
                      <span>{activeCollection.name}</span>
                      <button
                        onClick={() => {
                          setEditingId(activeCollection.id);
                          setEditingName(activeCollection.name);
                        }}
                        className="text-muted hover:text-white"
                        title="Rename"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-muted">Playlist · {activeCollectionBookmarks.length} items</span>
                  </div>
                )}
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteCollection(activeCollection.id, activeCollection.name)}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Delete Playlist
              </Button>
            </div>

            {activeCollectionBookmarks.length === 0 ? (
              <div className="sf-comic-panel sf-comic-surface flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card p-12 text-center space-y-4">
                <FolderHeart className="h-12 w-12 text-muted/50" />
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">Playlist is empty</h3>
                  <p className="text-sm text-muted max-w-sm">
                    Go to the catalog and tap the bookmark button on any comic to add it to this playlist.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeCollectionBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="sf-comic-card sf-comic-surface group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card transition-all hover:border-primary/40"
                  >
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img
                        src={bookmark.thumbUrl ?? "/placeholders/panel-1.svg"}
                        alt={bookmark.seriesName}
                        className="sf-comic-image h-full w-full object-cover"
                        loading="lazy"
                      />
                      <button
                        onClick={() => handleRemoveFromCollection(activeCollection.id, bookmark.id, bookmark.seriesName)}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white/80 hover:bg-rose-600 hover:text-white transition-all shadow-md"
                        title="Remove from Playlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="font-bold text-white text-base truncate">{bookmark.seriesName}</h3>
                        <p className="text-xs text-muted">Chapter {bookmark.chapterId} · Saved in playlist</p>
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
                          onClick={() => handleRemoveFromCollection(activeCollection.id, bookmark.id, bookmark.seriesName)}
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
        ) : (
          <div className="space-y-6">
            {/* Playlists / Saves Navigation Controls */}
            <div className="flex gap-2 select-none border-b border-white/5 pb-2">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSelectedCollectionId(null);
                }}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition border",
                  activeTab === "all"
                    ? "border-primary/45 bg-primary/10 text-white shadow-glow"
                    : "border-white/5 bg-white/5 text-muted hover:text-white"
                )}
              >
                All Saves ({bookmarks.length})
              </button>
              <button
                onClick={() => setActiveTab("playlists")}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition border",
                  activeTab === "playlists"
                    ? "border-primary/45 bg-primary/10 text-white shadow-glow"
                    : "border-white/5 bg-white/5 text-muted hover:text-white"
                )}
              >
                Playlists ({collections.length})
              </button>
            </div>

            {/* TAB: ALL SAVES */}
            {activeTab === "all" && (
              <>
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
                            onClick={() => handleRemoveGlobal(bookmark.seriesName)}
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white/80 hover:bg-rose-600 hover:text-white transition-all shadow-md"
                            title="Remove from Saved Stories"
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
                              onClick={() => handleRemoveGlobal(bookmark.seriesName)}
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
              </>
            )}

            {/* TAB: PLAYLISTS */}
            {activeTab === "playlists" && (
              <>
                {collections.length === 0 ? (
                  <div className="sf-comic-panel sf-comic-surface flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card p-12 text-center space-y-4">
                    <Folder className="h-12 w-12 text-muted/50" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-white">No playlists created yet</h3>
                      <p className="text-xs text-muted max-w-sm leading-relaxed">
                        Go to the home page or catalog, hover over a comic card, and tap the bookmark button. You will be prompted to create or choose a playlist!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {collections.map((col) => {
                      const firstBmId = col.bookmarkIds[0];
                      const firstBm = bookmarks.find((b) => b.id === firstBmId);
                      const cover = firstBm?.thumbUrl ?? "/placeholders/panel-1.svg";
                      return (
                        <button
                          key={col.id}
                          onClick={() => setSelectedCollectionId(col.id)}
                          className="sf-comic-card sf-comic-surface group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card p-4 hover:border-primary/45 hover:shadow-lg transition text-left cursor-pointer"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="relative aspect-[3/4] w-14 overflow-hidden rounded-xl border border-white/10 shrink-0 shadow">
                              <img src={cover} alt={col.name} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-black/20" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block font-bold text-white text-base group-hover:text-primary transition-colors truncate">
                                {col.name}
                              </span>
                              <span className="block text-xs text-muted mt-0.5">
                                {col.bookmarkIds.length} {col.bookmarkIds.length === 1 ? "comic" : "comics"}
                              </span>
                            </div>
                            <ChevronLeft className="h-5 w-5 text-muted rotate-180 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
