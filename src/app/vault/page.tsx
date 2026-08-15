"use client";

import { useMemo, useState } from "react";
import { Check, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { Tabs } from "@/components/Tabs";
import { useVaultStore } from "@/store/vaultStore";
import { cn } from "@/components/cn";
import { RequireAuth } from "@/components/RequireAuth";

type TabKey = "bookmarks" | "collections" | "reactions" | "highlights";

export default function VaultPage() {
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

  return (
    <RequireAuth>
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-4xl tracking-widest">Vault</div>
          <div className="text-sm text-muted">Scrapbook · Bookmarks · Reactions</div>
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
                className="sf-comic-card break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={b.thumbUrl ?? "/placeholders/panel-1.svg"}
                    alt={`${b.seriesName} saved panel`}
                    className="sf-comic-image h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,51,102,0.24),rgba(0,229,255,0.08),rgba(255,193,7,0.08))]" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="text-sm font-semibold">{b.seriesName}</div>
                  <div className="text-xs text-muted">
                    Chapter {b.chapterId} · Page {b.pageIndex}
                  </div>
                  <textarea
                    className={cn(
                      "w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-3 text-sm outline-none",
                      "placeholder:text-muted"
                    )}
                    rows={3}
                    placeholder="Personal note…"
                    value={b.note ?? ""}
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
                    <div key={bookmark.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{bookmark.seriesName}</div>
                        <div className="text-xs text-muted">Chapter {bookmark.chapterId} / Page {bookmark.pageIndex}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBookmarkFromCollection(activeCollection.id, bookmark.id)}
                        className="rounded-xl border border-white/10 px-3 py-1 text-xs text-muted hover:border-danger/40 hover:text-white"
                      >
                        Remove
                      </button>
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
              No reactions yet. Long-press inside the reader to drop emojis.
            </div>
          ) : (
            reactions.map((r) => (
              <div key={r.id} className="sf-comic-card rounded-3xl border border-white/10 bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg">{r.emoji}</div>
                  <div className="text-xs text-muted">{new Date(r.atIso).toLocaleString()}</div>
                </div>
                <div className="mt-1 text-sm font-semibold">{r.seriesName}</div>
                <div className="text-xs text-muted">
                  Chapter {r.chapterId} · Page {r.pageIndex} · x:{Math.round(r.x)} y:{Math.round(r.y)}
                </div>
                {r.comment ? <div className="mt-2 text-sm text-white/75">{r.comment}</div> : null}
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
