"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/compat/next-navigation";
import { ArrowLeft, BookOpen, Check, MoreVertical, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { Tabs } from "@/components/Tabs";
import { Button } from "@/components/Button";
import { useVaultStore } from "@/store/vaultStore";
import { cn } from "@/components/cn";
import { RequireAuth } from "@/components/RequireAuth";

type TabKey = "bookmarks" | "collections" | "reactions" | "highlights";

export default function VaultPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("bookmarks");
  const [collectionName, setCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isAddingComics, setIsAddingComics] = useState(false);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const bookmarks = useVaultStore((s) => s.bookmarks);
  const collections = useVaultStore((s) => s.collections);
  const reactions = useVaultStore((s) => s.reactions);
  const highlights = useVaultStore((s) => s.highlights);
  const updateNote = useVaultStore((s) => s.updateBookmarkNote);
  const deleteBookmark = useVaultStore((s) => s.deleteBookmark);
  const createCollection = useVaultStore((s) => s.createCollection);
  const renameCollection = useVaultStore((s) => s.renameCollection);
  const deleteCollection = useVaultStore((s) => s.deleteCollection);
  const addBookmarkToCollection = useVaultStore((s) => s.addBookmarkToCollection);
  const removeBookmarkFromCollection = useVaultStore((s) => s.removeBookmarkFromCollection);

  const tabs = useMemo(
    () => [
      { value: "bookmarks" as const, label: "My Bookmarks", badge: String(bookmarks.length) },
      { value: "collections" as const, label: "Collections", badge: String(collections.length) },
      { value: "reactions" as const, label: "My Reactions", badge: String(reactions.length) },
      { value: "highlights" as const, label: "My Highlights", badge: String(highlights.length) }
    ],
    [bookmarks.length, collections.length, reactions.length, highlights.length]
  );

  const activeCollection = useMemo(
    () => collections.find((collection) => collection.id === activeCollectionId) ?? collections[0] ?? null,
    [activeCollectionId, collections]
  );

  const activeCollectionBookmarks = useMemo(() => {
    if (!activeCollection) return [];
    return bookmarks.filter((bookmark) => activeCollection.bookmarkIds.includes(bookmark.id));
  }, [activeCollection, bookmarks]);

  const availableBookmarks = useMemo(() => {
    if (!activeCollection) return [];
    return bookmarks.filter((bookmark) => !activeCollection.bookmarkIds.includes(bookmark.id));
  }, [activeCollection, bookmarks]);

  function handleCreateCollection() {
    const name = collectionName.trim();
    if (!name) return;
    const createdId = createCollection(name);
    if (createdId) {
      setActiveCollectionId(createdId);
    }
    setCollectionName("");
    setIsCreatingCollection(false);
    setIsAddingComics(false);
    setSelectedBookmarkIds([]);
    setTab("collections");
  }

  function startRename(collectionId: string, currentName: string) {
    setRenamingId(collectionId);
    setRenameValue(currentName);
    setOpenMenuId(null);
  }

  function handleRename(collectionId: string) {
    const name = renameValue.trim();
    if (!name) return;
    renameCollection(collectionId, name);
    setRenamingId(null);
    setRenameValue("");
  }

  function handleDeleteCollection(collectionId: string) {
    deleteCollection(collectionId);
    setOpenMenuId(null);
    setIsAddingComics(false);
    setSelectedBookmarkIds([]);
    if (activeCollection?.id === collectionId) {
      const nextCollection = collections.find((collection) => collection.id !== collectionId);
      setActiveCollectionId(nextCollection?.id ?? null);
    }
  }

  function toggleBookmarkSelection(bookmarkId: string) {
    setSelectedBookmarkIds((current) =>
      current.includes(bookmarkId) ? current.filter((id) => id !== bookmarkId) : [...current, bookmarkId]
    );
  }

  function handleSaveSelectedComics() {
    if (!activeCollection) return;
    selectedBookmarkIds.forEach((bookmarkId) => addBookmarkToCollection(activeCollection.id, bookmarkId));
    setSelectedBookmarkIds([]);
    setIsAddingComics(false);
  }

  useEffect(() => {
    // When navigating back from Vault, ensure reader routes are bypassed and user returns to Home
    const handlePopState = () => {
      router.replace("/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  return (
    <RequireAuth>
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-5">
        <div>
          <div className="font-display text-4xl tracking-widest">Vault</div>
          <div className="text-sm text-muted">Scrapbook · Bookmarks · Reactions</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>

      <Tabs<TabKey> value={tab} onChange={setTab} tabs={tabs} />

      {tab === "bookmarks" ? (
        <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
          {bookmarks.length === 0 ? (
            <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 text-sm text-muted">
              No bookmarks yet. Long-press inside the reader to save a panel.
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="sf-comic-card break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-card group transition hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden cursor-pointer group/cover"
                  onClick={() => router.push(`/read/${b.chapterId}?from=/vault`)}
                  title={`Read ${b.seriesName} (Chapter ${b.chapterId})`}
                >
                  <img
                    src={b.thumbUrl ?? "/placeholders/panel-1.svg"}
                    alt={`${b.seriesName} saved panel`}
                    className="sf-comic-image h-full w-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,51,102,0.24),rgba(0,229,255,0.08),rgba(255,193,7,0.08))]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-lg">
                      <Play className="h-3.5 w-3.5 fill-white" /> Read Chapter
                    </span>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div
                    className="cursor-pointer group/title"
                    onClick={() => router.push(`/read/${b.chapterId}?from=/vault`)}
                  >
                    <div className="text-sm font-semibold group-hover/title:text-primary transition line-clamp-1">
                      {b.seriesName}
                    </div>
                    <div className="text-xs text-muted">
                      Chapter {b.chapterId} · Page {b.pageIndex}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs gap-1.5 py-1.5 h-8"
                      onClick={() => router.push(`/read/${b.chapterId}?from=/vault`)}
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Read Comic
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => deleteBookmark(b.id)}
                      title="Delete Bookmark"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <textarea
                    className={cn(
                      "w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none",
                      "placeholder:text-muted"
                    )}
                    rows={2}
                    placeholder="Personal note…"
                    value={b.note ?? ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateNote(b.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "collections" ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-2xl tracking-widest">Collections</div>
              <div className="text-sm text-muted">Create named sets for your saved comics.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingCollection((current) => !current);
                setCollectionName("");
              }}
              className="sf-clickable inline-flex items-center gap-2 rounded-2xl border border-primary/45 bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New
            </button>
          </div>

          {isCreatingCollection ? (
            <div className="rounded-3xl border border-white/10 bg-card p-5">
              <div className="font-display text-xl tracking-widest">Create Collection</div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm outline-none placeholder:text-muted focus:border-primary/45"
                  placeholder="Collection name, e.g. Horror favorites"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  disabled={!collectionName.trim()}
                  className="sf-clickable rounded-2xl border border-primary/40 bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCollection(false);
                    setCollectionName("");
                  }}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-muted hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {collections.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => {
                    setActiveCollectionId(collection.id);
                    setIsAddingComics(false);
                    setSelectedBookmarkIds([]);
                  }}
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm font-semibold",
                    activeCollection?.id === collection.id
                      ? "border-primary/55 bg-primary/15 text-white"
                      : "border-white/10 bg-card text-muted hover:text-white"
                  )}
                >
                  {collection.name}
                </button>
              ))}
            </div>
          ) : null}

          {collections.length === 0 ? (
            <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 text-sm text-muted">
              No collections yet. Click + New to create your first collection.
            </div>
          ) : activeCollection ? (
            <div className="rounded-3xl border border-white/10 bg-card p-5">
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {renamingId === activeCollection.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="h-10 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm outline-none focus:border-primary/45"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(activeCollection.id)}
                        disabled={!renameValue.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(null);
                          setRenameValue("");
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-muted hover:text-white"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl font-semibold">{activeCollection.name}</div>
                      <div className="text-xs text-muted">
                        {activeCollectionBookmarks.length} saved comics / Created{" "}
                        {new Date(activeCollection.createdAtIso).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === activeCollection.id ? null : activeCollection.id)}
                    className="rounded-2xl border border-white/10 bg-black/20 p-2 text-muted hover:text-white"
                    aria-label="Collection options"
                  >
                    <MoreVertical className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {openMenuId === activeCollection.id ? (
                    <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-2xl border border-white/10 bg-black text-sm shadow-2xl shadow-black/40">
                      <button
                        type="button"
                        onClick={() => startRename(activeCollection.id, activeCollection.name)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => startRename(activeCollection.id, activeCollection.name)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Rename collection
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCollection(activeCollection.id)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete collection
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold">Saved comics</div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingComics((current) => !current);
                    setSelectedBookmarkIds([]);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 px-4 py-2 text-sm font-semibold text-white hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add
                </button>
              </div>

              {isAddingComics ? (
                <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                  {bookmarks.length === 0 ? (
                    <div className="text-sm text-muted">No saved comics available. Save comics to bookmarks first.</div>
                  ) : availableBookmarks.length === 0 ? (
                    <div className="text-sm text-muted">All saved comics are already in this collection.</div>
                  ) : (
                    <>
                      <div className="grid gap-2 md:grid-cols-2">
                        {availableBookmarks.map((bookmark) => (
                          <label
                            key={bookmark.id}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-card p-3 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBookmarkIds.includes(bookmark.id)}
                              onChange={() => toggleBookmarkSelection(bookmark.id)}
                              className="h-4 w-4 accent-primary"
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">{bookmark.seriesName}</span>
                              <span className="block text-xs text-muted">
                                Chapter {bookmark.chapterId} / Page {bookmark.pageIndex}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingComics(false);
                            setSelectedBookmarkIds([]);
                          }}
                          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-muted hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveSelectedComics}
                          disabled={selectedBookmarkIds.length === 0}
                          className="rounded-2xl border border-primary/40 bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              <div className="mt-4 space-y-2">
                {activeCollectionBookmarks.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-muted">
                    No comics saved in collection.
                  </div>
                ) : (
                  activeCollectionBookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 hover:border-primary/40 transition">
                      <div
                        className="min-w-0 cursor-pointer group flex-1"
                        onClick={() => router.push(`/read/${bookmark.chapterId}?from=/vault`)}
                      >
                        <div className="truncate text-sm font-semibold group-hover:text-primary transition">{bookmark.seriesName}</div>
                        <div className="text-xs text-muted">Chapter {bookmark.chapterId} / Page {bookmark.pageIndex}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs h-7 px-3 gap-1"
                          onClick={() => router.push(`/read/${bookmark.chapterId}?from=/vault`)}
                        >
                          <Play className="h-3 w-3 fill-white" /> Read
                        </Button>
                        <button
                          type="button"
                          onClick={() => removeBookmarkFromCollection(activeCollection.id, bookmark.id)}
                          className="rounded-xl border border-white/10 px-3 py-1 text-xs text-muted hover:border-danger/40 hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "reactions" ? (
        <div className="space-y-3">
          {reactions.length === 0 ? (
            <div className="sf-comic-panel sf-comic-surface rounded-3xl border border-white/10 bg-card p-6 text-sm text-muted">
              No reactions yet. Click directly on any comic panel in the reader to drop emoji reactions!
            </div>
          ) : (
            reactions.map((r) => (
              <div
                key={r.id}
                onClick={() => router.push(`/read/${r.chapterId}?from=/vault`)}
                className="sf-comic-card group rounded-3xl border border-white/10 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                title={`Open ${r.seriesName} (Chapter ${r.chapterId})`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl h-11 w-11 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    {r.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold group-hover:text-primary transition truncate">
                      {r.seriesName}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      Chapter {r.chapterId} · Page {r.pageIndex} · {new Date(r.atIso).toLocaleDateString()}
                    </div>
                    {r.comment ? (
                      <div className="mt-2 text-xs text-white/80 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 inline-block max-w-md">
                        &ldquo;{r.comment}&rdquo;
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs h-8 px-3 gap-1.5 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/read/${r.chapterId}?from=/vault`);
                    }}
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Read
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "highlights" ? (
        <div className="space-y-3">
          {highlights.map((h) => (
            <div key={h.id} className="sf-comic-card rounded-3xl border border-white/10 bg-card p-5">
              <div className="text-sm text-muted">Chapter {h.chapterId}</div>
              <blockquote className="mt-2 border-l-2 border-primary/60 pl-4 text-lg text-white/85">
                “{h.quote}”
              </blockquote>
              {h.context ? <div className="mt-2 text-sm text-muted">{h.context}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
    </RequireAuth>
  );
}
