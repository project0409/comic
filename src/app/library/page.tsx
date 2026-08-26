"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "@/compat/next-navigation";
import Link from "@/compat/next-link";
import {
  BookmarkCheck,
  BookOpen,
  Trash2,
  Folder,
  ChevronLeft,
  Pencil,
  Check,
  FolderHeart,
  Clock,
  Send,
  Sparkles,
  ChevronRight,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useVaultStore } from "@/store/vaultStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/components/cn";
import { seriesList } from "@/lib/mockData";

type LibraryTab = "history" | "saved";
type PlaylistTab = "all" | "playlists";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  recommendedSeriesIds?: string[];
}

export default function LibraryPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);

  // Store Hooks
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const collections = useVaultStore((s) => s.collections);
  const history = useVaultStore((s) => s.history);
  const clearHistory = useVaultStore((s) => s.clearHistory);
  const removeBookmarkBySeries = useVaultStore((s) => s.removeBookmarkBySeries);
  const removeBookmarkFromCollection = useVaultStore((s) => s.removeBookmarkFromCollection);
  const deleteCollection = useVaultStore((s) => s.deleteCollection);
  const renameCollection = useVaultStore((s) => s.renameCollection);

  // Layout tabs
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTab>("history");
  const [activePlaylistTab, setActivePlaylistTab] = useState<PlaylistTab>("all");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Edit Collection name state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Agent Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "agent",
      text: "Hello! I am your FYP Comic Guide Agent. 🧠\nWhich genre or story style are you looking for today? Select a genre chip below or type what you like!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Map history items to full Series object
  const historyItemsWithDetails = useMemo(() => {
    return history
      .map((h) => {
        const series = seriesList.find((s) => s.id === h.seriesId);
        return series ? { ...h, series } : null;
      })
      .filter((h) => h !== null) as Array<{
      seriesId: string;
      chapterId: string;
      readAtIso: string;
      series: typeof seriesList[0];
    }>;
  }, [history]);

  const activeCollection = useMemo(() => {
    return collections.find((col) => col.id === selectedCollectionId) ?? null;
  }, [collections, selectedCollectionId]);

  const activeCollectionBookmarks = useMemo(() => {
    if (!activeCollection) return [];
    return bookmarks.filter((bm) => activeCollection.bookmarkIds.includes(bm.id));
  }, [activeCollection, bookmarks]);

  // Playlist actions
  const handleRemoveGlobal = (seriesName: string) => {
    removeBookmarkBySeries(seriesName);
    toast({
      tone: "default",
      title: "Story Removed",
      message: `Removed "${seriesName}" from library.`
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

  // Agent response logic
  const triggerAgentReply = (userQuery: string) => {
    setAgentTyping(true);

    setTimeout(() => {
      const query = userQuery.toLowerCase().trim();
      let replyText = "";
      let matchedIds: string[] = [];

      if (query.includes("action") || query.includes("blade") || query.includes("fight")) {
        replyText = "💥 High-octane action, sword clashes, and fast chases! Here are my top Action recommendations:";
        matchedIds = seriesList.filter((s) => s.genre === "Action" || s.genre === "Fantasy").map((s) => s.id);
      } else if (query.includes("sci-fi") || query.includes("cyberpunk") || query.includes("hacker") || query.includes("future")) {
        replyText = "🚀 Cybernetic neon nets and grid hacks await you! Take a look at these Sci-Fi & Cyberpunk comics:";
        matchedIds = seriesList.filter((s) => s.genre === "Sci-Fi").map((s) => s.id);
      } else if (query.includes("romance") || query.includes("love") || query.includes("heart")) {
        replyText = "💖 Fast racing hearts and romantic tension! I suggest reading this sweet pilot story:";
        matchedIds = seriesList.filter((s) => s.genre === "Romance").map((s) => s.id);
      } else if (query.includes("horror") || query.includes("spooky") || query.includes("scary")) {
        replyText = "💀 Late-night calls and radio horror frequencies! Keep the lights on for this Horror selection:";
        matchedIds = seriesList.filter((s) => s.genre === "Horror").map((s) => s.id);
      } else if (query.includes("mystery") || query.includes("detective") || query.includes("mirror")) {
        replyText = "🔍 mirror room labyrinth mysteries! Find the hidden clue in these Mystery selections:";
        matchedIds = seriesList.filter((s) => s.genre === "Mystery").map((s) => s.id);
      } else if (query.includes("fantasy") || query.includes("dragon")) {
        replyText = "🐉 Magical dragon-drives and iron clashing! You will love shadow-steampunk worlds:";
        matchedIds = seriesList.filter((s) => s.genre === "Fantasy").map((s) => s.id);
      } else {
        replyText = "💡 I couldn't find a direct genre match, but here are the highest-rated webcomics currently trending on FYP:";
        matchedIds = [...seriesList].sort((a, b) => b.rating - a.rating).slice(0, 3).map((s) => s.id);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: "agent",
          text: replyText,
          recommendedSeriesIds: matchedIds
        }
      ]);
      setAgentTyping(false);
    }, 1200);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");
    triggerAgentReply(text);
  };

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, agentTyping]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {/* Header Title Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-7 w-7 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white">
                My Library
              </h1>
            </div>
            <p className="text-sm text-muted mt-1">
              Resume your reading history, track your progress, and explore recommended genres.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              Explore Comics
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/vault")}>
              Saved Items
            </Button>
          </div>
        </div>

        {/* Outer Split Layout: Library content on left, AI Agent Sidebar on right */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          
          {/* LEFT COLUMN: HISTORY & PLAYLISTS */}
          <div className="space-y-6">
            {/* Library Page Tab buttons */}
            <div className="flex gap-2 select-none border-b border-white/10 pb-3">
              <button
                onClick={() => setActiveLibraryTab("history")}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition border",
                  activeLibraryTab === "history"
                    ? "border-primary/45 bg-primary/10 text-white shadow-glow"
                    : "border-white/5 bg-white/5 text-muted hover:text-white"
                )}
              >
                Reading History ({history.length})
              </button>
              <button
                onClick={() => setActiveLibraryTab("saved")}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition border",
                  activeLibraryTab === "saved"
                    ? "border-primary/45 bg-primary/10 text-white shadow-glow"
                    : "border-white/5 bg-white/5 text-muted hover:text-white"
                )}
              >
                Playlists &amp; Saves
              </button>
            </div>

            {/* TAB 1: READING HISTORY */}
            {activeLibraryTab === "history" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-semibold uppercase tracking-wider">
                    Recently Opened chapters
                  </span>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-rose-400 hover:text-rose-500 font-bold transition-colors"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {historyItemsWithDetails.length === 0 ? (
                  <div className="sf-comic-panel sf-comic-surface flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card p-12 text-center space-y-4">
                    <Clock className="h-12 w-12 text-muted/30" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-white">Your history is empty</h3>
                      <p className="text-sm text-muted max-w-sm">
                        Comics you read will appear here automatically so you can resume them at any time.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {historyItemsWithDetails.map((item) => (
                      <div
                        key={item.seriesId}
                        className="sf-comic-card sf-comic-surface flex overflow-hidden rounded-2xl border border-white/10 bg-card/40 transition hover:border-primary/30 p-3 items-center gap-4"
                      >
                        <div className="aspect-[3/4] w-14 shrink-0 rounded-lg overflow-hidden border border-white/5 bg-black/20">
                          <img
                            src={item.series.coverUrl}
                            alt={item.series.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div>
                            <h3 className="font-bold text-white text-sm truncate leading-snug">
                              {item.series.title}
                            </h3>
                            <p className="text-[11px] text-primary font-bold">
                              Last read: {item.chapterId.includes("c1") ? "Chapter 1" : item.chapterId.includes("c2") ? "Chapter 2" : "Chapter " + item.chapterId.split("_").pop()?.replace("ch", "") || "Chapter Details"}
                            </p>
                            <span className="text-[9px] text-muted block">
                              Opened {new Date(item.readAtIso).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-1.5 pt-0.5">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => router.push(`/read/${item.chapterId}`)}
                            >
                              Resume
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/series/${item.seriesId}`)}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PLAYLISTS & SAVES (REPLICATES SAVED-STORIES) */}
            {activeLibraryTab === "saved" && (
              <div className="space-y-6">
                {selectedCollectionId && activeCollection ? (
                  // playlist detail subview
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
                            <span className="text-xs text-muted">
                              Playlist · {activeCollectionBookmarks.length} items
                            </span>
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
                            Add comics here by tapping bookmark on details page.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {activeCollectionBookmarks.map((bookmark) => (
                          <div
                            key={bookmark.id}
                            className="sf-comic-card sf-comic-surface flex overflow-hidden rounded-2xl border border-white/10 bg-card transition-all hover:border-primary/40 p-3 items-center gap-4"
                          >
                            <div className="aspect-[3/4] w-14 shrink-0 rounded-lg overflow-hidden border border-white/5 bg-black/20">
                              <img
                                src={bookmark.thumbUrl ?? "/placeholders/panel-1.svg"}
                                alt={bookmark.seriesName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div>
                                <h3 className="font-bold text-white text-sm truncate leading-snug">
                                  {bookmark.seriesName}
                                </h3>
                                <p className="text-[11px] text-muted">
                                  Chapter {bookmark.chapterId} · Saved
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => router.push(`/read/${bookmark.chapterId}`)}
                                >
                                  Read
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveFromCollection(activeCollection.id, bookmark.id, bookmark.seriesName)}
                                  className="text-rose-500 hover:text-rose-600"
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
                  // playlist landing view
                  <div className="space-y-6">
                    {/* Navigation Tab buttons (All Saves vs Folders) */}
                    <div className="flex gap-2 border-b border-white/5 pb-2">
                      <button
                        onClick={() => setActivePlaylistTab("all")}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-lg transition",
                          activePlaylistTab === "all"
                            ? "bg-white/10 text-white"
                            : "text-muted hover:text-white"
                        )}
                      >
                        All Saves ({bookmarks.length})
                      </button>
                      <button
                        onClick={() => setActivePlaylistTab("playlists")}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-lg transition",
                          activePlaylistTab === "playlists"
                            ? "bg-white/10 text-white"
                            : "text-muted hover:text-white"
                        )}
                      >
                        Playlists ({collections.length})
                      </button>
                    </div>

                    {activePlaylistTab === "all" ? (
                      bookmarks.length === 0 ? (
                        <div className="sf-comic-panel sf-comic-surface flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card p-12 text-center space-y-4">
                          <Folder className="h-12 w-12 text-muted/30" />
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-white">No saved stories</h3>
                            <p className="text-sm text-muted max-w-sm">
                              You haven't bookmarked any comics yet. Explore catalog to save.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {bookmarks.map((bookmark) => (
                            <div
                              key={bookmark.id}
                              className="sf-comic-card sf-comic-surface flex overflow-hidden rounded-2xl border border-white/10 bg-card/40 transition hover:border-primary/30 p-3 items-center gap-4"
                            >
                              <div className="aspect-[3/4] w-14 shrink-0 rounded-lg overflow-hidden border border-white/5 bg-black/20">
                                <img
                                  src={bookmark.thumbUrl ?? "/placeholders/panel-1.svg"}
                                  alt={bookmark.seriesName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1 space-y-2">
                                <div>
                                  <h3 className="font-bold text-white text-sm truncate leading-snug">
                                    {bookmark.seriesName}
                                  </h3>
                                  <p className="text-[11px] text-muted">
                                    Chapter {bookmark.chapterId}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => router.push(`/read/${bookmark.chapterId}`)}
                                  >
                                    Read
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveGlobal(bookmark.seriesName)}
                                    className="text-rose-500 hover:text-rose-600"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      // Playlists folder list
                      collections.length === 0 ? (
                        <div className="sf-comic-panel sf-comic-surface flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card p-12 text-center space-y-4">
                          <Folder className="h-12 w-12 text-muted/30" />
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-white">No playlists found</h3>
                            <p className="text-sm text-muted max-w-sm">
                              Create playlists from details pages to organize your collection.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {collections.map((col) => (
                            <div
                              key={col.id}
                              onClick={() => setSelectedCollectionId(col.id)}
                              className="sf-comic-card sf-comic-surface flex overflow-hidden rounded-2xl border border-white/10 bg-card/40 cursor-pointer p-4 items-center justify-between transition hover:border-primary/40"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                  <Folder className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-white text-base">{col.name}</h3>
                                  <span className="text-xs text-muted">
                                    {col.bookmarkIds.length} {col.bookmarkIds.length === 1 ? "comic" : "comics"}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted" />
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AI RECOMMENDATION GENRE AGENT */}
          <aside className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold tracking-wide text-white">
                FYP Recommendation Agent
              </h2>
            </div>

            {/* Chat Agent Container */}
            <div className="flex flex-col h-[520px] rounded-3xl border border-white/10 bg-card/65 backdrop-blur-md overflow-hidden">
              {/* Top info bar */}
              <div className="bg-white/5 p-3.5 border-b border-white/10 flex items-center gap-2">
                <div className="relative">
                  <div className="h-8.5 w-8.5 rounded-full bg-primary/20 flex items-center justify-center p-1.5">
                    🤖
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-card" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Genre Guide Agent</h3>
                  <span className="text-[10px] text-emerald-400 font-semibold">Online · Ready to recommend</span>
                </div>
              </div>

              {/* Message scroll area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 select-text">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] space-y-1.5",
                      msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap",
                        msg.sender === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 rounded-bl-none"
                      )}
                    >
                      {msg.text}
                    </div>

                    {/* If there are recommended series in this message */}
                    {msg.recommendedSeriesIds && msg.recommendedSeriesIds.length > 0 && (
                      <div className="w-full flex flex-col gap-2 pt-1 select-none">
                        {msg.recommendedSeriesIds
                          .map((id) => seriesList.find((s) => s.id === id))
                          .filter((s) => s !== undefined)
                          .map((s) => (
                            <Link
                              href={`/series/${s.id}`}
                              key={s.id}
                              className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-primary/25 rounded-xl transition"
                            >
                              <img
                                src={s.coverUrl}
                                alt={s.title}
                                className="h-10 w-7 rounded object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[11px] font-bold text-slate-850 dark:text-white truncate">
                                  {s.title}
                                </h4>
                                <span className="text-[9px] text-primary font-bold">
                                  ★ {s.rating} · {s.genre}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted" />
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {agentTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-muted w-24 mr-auto rounded-bl-none animate-pulse">
                    <span>Agent is searching...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Quick Genre Chips */}
              <div className="p-3 bg-white/5 border-t border-white/10 space-y-2 select-none">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted block">
                  Quick Genre Recommendation:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Action 💥", query: "Action" },
                    { label: "Sci-Fi 🚀", query: "Sci-Fi" },
                    { label: "Romance 💖", query: "Romance" },
                    { label: "Mystery 🔍", query: "Mystery" },
                    { label: "Fantasy 🐉", query: "Fantasy" },
                    { label: "Horror 💀", query: "Horror" }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleSendMessage(chip.query)}
                      className="px-2.5 py-1 text-[10px] bg-black/40 border border-white/10 hover:border-primary/30 text-white rounded-full transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Field */}
              <div className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask agent for a genre..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 h-9 px-3 rounded-xl border border-white/10 bg-black/35 text-xs outline-none text-white focus:border-primary/35 focus:ring-1 focus:ring-primary/20"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="h-9 w-9 rounded-xl bg-primary text-white hover:bg-primary/95 flex items-center justify-center transition"
                  aria-label="Send query"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
          
        </div>
      </div>
    </RequireAuth>
  );
}
