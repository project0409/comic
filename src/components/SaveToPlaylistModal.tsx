import { useState, useMemo, useEffect } from "react";
import { X, Plus, FolderHeart, Folder, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";
import type { Series } from "@/lib/types";
import { firstChapterBySeries } from "@/lib/mockData";

export function SaveToPlaylistModal({
  open,
  series,
  onClose
}: {
  open: boolean;
  series: Series;
  onClose: () => void;
}) {
  const toast = useToastStore((s) => s.push);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const addBookmark = useVaultStore((s) => s.addBookmark);
  const collections = useVaultStore((s) => s.collections);
  const createCollection = useVaultStore((s) => s.createCollection);
  const addBookmarkToCollection = useVaultStore((s) => s.addBookmarkToCollection);
  const removeBookmarkFromCollection = useVaultStore((s) => s.removeBookmarkFromCollection);

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Find or create bookmark for this series
  const getOrCreateBookmarkId = (): string => {
    const existing = bookmarks.find((b) => b.seriesName === series.title);
    if (existing) return existing.id;

    // Create a new bookmark
    return addBookmark({
      seriesName: series.title,
      chapterId: firstChapterBySeries[series.id] ?? "c1",
      pageIndex: 1,
      x: 0,
      y: 0,
      thumbUrl: series.coverUrl
    });
  };

  // Determine which playlists currently contain this series
  const activePlaylists = useMemo(() => {
    const bookmark = bookmarks.find((b) => b.seriesName === series.title);
    if (!bookmark) return [];

    return collections
      .filter((col) => col.bookmarkIds.includes(bookmark.id))
      .map((col) => col.id);
  }, [bookmarks, collections, series.title]);

  const handleTogglePlaylist = (collectionId: string) => {
    const bookmarkId = getOrCreateBookmarkId();
    const isActive = activePlaylists.includes(collectionId);
    const collection = collections.find((c) => c.id === collectionId);

    if (!collection) return;

    if (isActive) {
      removeBookmarkFromCollection(collectionId, bookmarkId);
      toast({
        tone: "default",
        title: "Removed from Playlist",
        message: `Removed "${series.title}" from "${collection.name}".`
      });
    } else {
      addBookmarkToCollection(collectionId, bookmarkId);
      toast({
        tone: "success",
        title: "Added to Playlist! 📁",
        message: `Added "${series.title}" to "${collection.name}".`
      });
    }
  };

  const handleSaveToGenrePlaylist = () => {
    const genre = series.genre;
    let collection = collections.find((c) => c.name.toLowerCase() === genre.toLowerCase());
    let collectionId = collection?.id;

    if (!collectionId) {
      collectionId = createCollection(genre);
    }

    if (collectionId) {
      const bookmarkId = getOrCreateBookmarkId();
      addBookmarkToCollection(collectionId, bookmarkId);
      toast({
        tone: "success",
        title: "Saved by Genre! 📁",
        message: `Saved "${series.title}" into the "${genre}" playlist.`
      });
      onClose();
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;

    const newId = createCollection(name);
    if (newId) {
      const bookmarkId = getOrCreateBookmarkId();
      addBookmarkToCollection(newId, bookmarkId);
      toast({
        tone: "success",
        title: "Playlist Created! 🎉",
        message: `Saved "${series.title}" to your new playlist "${name}".`
      });
      setNewPlaylistName("");
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-[min(380px,94vw)] rounded-3xl border border-white/10 bg-[var(--sf-surface)] p-5 shadow-2xl backdrop-blur-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-display text-lg font-bold tracking-wider text-white">Save to Playlist</h3>
            <p className="text-[11px] text-muted truncate max-w-[240px]">Saving: {series.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Genre Save */}
        <button
          type="button"
          onClick={handleSaveToGenrePlaylist}
          className="w-full flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-left hover:bg-primary/15 transition group"
        >
          <FolderHeart className="h-5 w-5 text-primary group-hover:scale-105 transition-transform" />
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-white">Genre Playlist Quick Save</span>
            <span className="block text-[10px] text-muted truncate">Save to "{series.genre}" playlist</span>
          </div>
        </button>

        {/* Custom Playlists list */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted">My Playlists</div>
          {collections.length === 0 ? (
            <div className="text-xs text-muted/60 italic py-2 text-center">
              No playlists created yet. Use the tool below to start.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1.5">
              {collections.map((col) => {
                const isActive = activePlaylists.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleTogglePlaylist(col.id)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/5 bg-black/15 px-3 py-2 text-left hover:border-white/10 hover:bg-black/25 transition text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className="h-4 w-4 text-highlight shrink-0" />
                      <span className="text-white font-medium truncate">{col.name}</span>
                    </div>
                    {isActive ? (
                      <Check className="h-4 w-4 text-primary shrink-0 font-bold" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-white/20 hover:border-white/45 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Playlist Form */}
        <form onSubmit={handleCreatePlaylist} className="border-t border-white/10 pt-3 space-y-2">
          <div className="text-xs font-semibold text-muted">Create Custom Playlist</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="e.g. Bedtime Stories, Action list"
              className="h-9 flex-1 rounded-xl border border-white/10 bg-black/25 px-3 text-xs outline-none focus:border-primary/45 placeholder:text-muted"
            />
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="h-9 shrink-0 gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Create
            </Button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
