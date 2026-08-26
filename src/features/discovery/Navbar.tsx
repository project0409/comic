"use client";

import { Bell, Bookmark, Coins, HelpCircle, LogOut, Pencil, Search, Settings, User, Wallet } from "lucide-react";
import Link from "@/compat/next-link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "@/compat/next-navigation";
import { cn } from "@/components/cn";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { chaptersBySeries, seriesList } from "@/lib/mockData";
import type { Series } from "@/lib/types";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/series", label: "Series" },
  { href: "/library", label: "Library" },
  { href: "/vault", label: "Vault" }
];
const PREFERRED_GENRE_ORDER = ["Action", "Romance", "Horror", "Mystery", "Fantasy", "Sci-Fi"];

export function Navbar({
  onSearch,
  searchValue = "",
  genreValue,
  seriesOptions
}: {
  onSearch?: (q: string, genre?: string) => void;
  searchValue?: string;
  genreValue?: string;
  seriesOptions?: Series[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const coinBalance = useWalletStore((s) => s.coinBalance);
  const toast = useToastStore((s) => s.push);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const displayName = useAuthStore((s) => s.displayName);
  const logout = useAuthStore((s) => s.logout);
  const menuSeries = seriesOptions?.length ? seriesOptions : seriesList;
  const genres = useMemo(() => {
    const available = Array.from(new Set(menuSeries.map((series) => series.genre)));
    return available.sort((a, b) => {
      const aIndex = PREFERRED_GENRE_ORDER.indexOf(a);
      const bIndex = PREFERRED_GENRE_ORDER.indexOf(b);
      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      if (aIndex >= 0) return -1;
      if (bIndex >= 0) return 1;
      return a.localeCompare(b);
    });
  }, [menuSeries]);
  const [q, setQ] = useState(searchValue);
  const [genre, setGenre] = useState<string | undefined>(genreValue);
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const placeholder = useMemo(() => (genre ? `Search in ${genre}...` : "Search series..."), [genre]);
  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return menuSeries
      .filter((series) => {
        const chapterText = (chaptersBySeries[series.id] ?? [])
          .map((chapter) => chapter.title)
          .join(" ")
          .toLowerCase();
        const keywordText = (series.searchKeywords ?? []).join(" ").toLowerCase();
        const matchesComicKeyword = query === "comic" || query === "comics";
        const matchesQuery =
          matchesComicKeyword ||
          series.title.toLowerCase().includes(query) ||
          series.writerName.toLowerCase().includes(query) ||
          series.genre.toLowerCase().includes(query) ||
          series.description.toLowerCase().includes(query) ||
          keywordText.includes(query) ||
          chapterText.includes(query);
        const matchesGenre = genre ? series.genre === genre : true;
        return matchesQuery && matchesGenre;
      })
      .slice(0, 6);
  }, [genre, menuSeries, q]);
  const showSuggestions = searchFocused && q.trim().length > 0;
  const initials = useMemo(() => {
    const source = displayName || role || "User";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  }, [displayName, role]);
  const profileMenuItems = useMemo(() => {
    const items = [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/profile/edit", label: "Edit Profile", icon: Pencil },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/library", label: "Library", icon: Bookmark },
      { href: "/wallet", label: "Wallet", icon: Wallet }
    ];
    if (role === "writer" || role === "admin") {
      items.push({ href: "/dashboard/writer", label: "Writer Dashboard", icon: Pencil });
      items.push({ href: "/dashboard/analytics", label: "Analytics", icon: Coins });
    }
    if (role === "admin") {
      items.push({ href: "/dashboard/admin", label: "Admin Gate", icon: Settings });
    }
    return items;
  }, [role]);

  useEffect(() => {
    const t = setTimeout(() => onSearch?.(q, genre), 250);
    return () => clearTimeout(t);
  }, [q, genre, onSearch]);

  useEffect(() => {
    setQ(searchValue);
  }, [searchValue]);

  useEffect(() => {
    setGenre(genreValue);
  }, [genreValue]);

  useEffect(() => {
    if (!profileOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [profileOpen]);

  useEffect(() => {
    if (!searchFocused) return;
    function onPointerDown(e: MouseEvent) {
      if (!searchRef.current?.contains(e.target as Node)) setSearchFocused(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [searchFocused]);

  function selectGenre(nextGenre: string) {
    setQ("");
    setGenre(nextGenre);
    setSearchFocused(false);
    onSearch?.("", nextGenre);
  }

  function openSeries(seriesId: string) {
    setSearchFocused(false);
    router.push(`/series/${seriesId}`);
  }

  return (
    <div id="tour-navbar" className="sticky top-0 z-40 border-b border-white/5 bg-bg/75 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.22)] transition-all">
      <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3 lg:flex-nowrap lg:gap-4">
        <Link href="/" className="sf-clickable flex shrink-0 items-center" aria-label="FYP home">
          <img
            src="/branding/fyp-logo.png"
            alt="FYP"
            className="h-14 w-auto max-w-[200px] object-contain sm:h-16 sm:max-w-[240px]"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sf-clickable relative rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-250",
                  active ? "text-white" : "text-muted hover:text-white"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-primary to-highlight transition-all duration-300",
                    active ? "opacity-100 scale-100 shadow-[0_0_12px_rgba(255,51,102,0.6)]" : "opacity-0 scale-50"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="order-3 flex min-w-full flex-col gap-3 md:order-none md:min-w-0 md:flex-1">
          <div ref={searchRef} id="tour-search-bar" className="relative w-full md:max-w-[650px]">
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-surface px-4 py-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] transition duration-200 focus-within:border-primary/45 focus-within:shadow-[0_0_22px_rgba(255,51,102,0.15)]">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && suggestions[0]) openSeries(suggestions[0].id);
                }}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                placeholder={placeholder}
                aria-label="Search series"
                autoComplete="off"
              />
            </div>

            {showSuggestions ? (
              <div className="sf-search-dropdown absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_18px_46px_rgba(0,0,0,0.42)]">
                {suggestions.length > 0 ? (
                  suggestions.map((series) => (
                    <button
                      key={series.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => openSeries(series.id)}
                      className="sf-clickable flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/8"
                    >
                      <img
                        src={series.coverUrl}
                        alt=""
                        className="h-12 w-9 shrink-0 rounded-md border border-white/10 object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">{series.title}</span>
                        <span className="block truncate text-xs text-muted">
                          {series.genre} / {series.writerName}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-muted">No comics found.</div>
                )}
              </div>
            ) : null}
          </div>

          <div id="tour-genres" className="hidden items-center gap-2 md:flex overflow-x-auto whitespace-nowrap max-w-[280px] sm:max-w-[400px] md:max-w-[420px] lg:max-w-[650px] scrollbar-none py-1 flex-nowrap select-none" role="group" aria-label="Genre filters">
            {genres.map((g) => {
              const active = genre === g;
              return (
                <Link
                  key={g}
                  href={`/series?genre=${encodeURIComponent(g)}`}
                  onClick={() => selectGenre(g)}
                  className={cn(
                    "sf-clickable rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                    active
                      ? "border-transparent bg-gradient-to-r from-primary to-highlight text-white shadow-[0_4px_16px_rgba(255,51,102,0.32)] scale-[1.03]"
                      : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {g}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
          <ThemeModeToggle />
          {isAuthenticated ? (
            <>
              {role === "reader" ? (
                <Button id="tour-reader-hub" variant="outline" size="sm" onClick={() => router.push("/saved-stories")}>
                  Reader Hub
                </Button>
              ) : null}
              {role === "writer" || role === "admin" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(role === "admin" ? "/dashboard/admin" : "/dashboard/writer")}
                >
                  Dashboard
                </Button>
              ) : null}
              <Badge tone="gold" className="gap-2">
                <Coins className="h-3.5 w-3.5" />
                <span className="tabular-nums">{coinBalance}</span>
              </Badge>
              <button
                className="sf-clickable grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:border-highlight/30 hover:bg-white/8"
                aria-label="Open notifications"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-4 w-4 text-muted" />
              </button>

              <button
                id="tour-help-button"
                className="sf-clickable grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:border-highlight/30 hover:bg-white/8"
                aria-label="Restart tour guide"
                title="Take the Tour Again"
                onClick={() => {
                  const path = pathname || "/";
                  if (path !== "/") {
                    router.push("/");
                    setTimeout(() => {
                      useOnboardingStore.getState().set({ isTourActive: true, currentStep: 0, showWelcomeModal: false, showCompletionModal: false });
                    }, 600);
                  } else {
                    useOnboardingStore.getState().set({ isTourActive: true, currentStep: 0, showWelcomeModal: false, showCompletionModal: false });
                  }
                }}
              >
                <HelpCircle className="h-4 w-4 text-muted" />
              </button>

              <div className="relative z-50" ref={profileRef}>
                <button
                  id="tour-profile-menu"
                  className="sf-clickable flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 hover:border-primary/35 hover:bg-white/8"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((open) => !open)}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-xs font-semibold text-primary">
                    {initials}
                  </span>
                  <span className="hidden text-xs capitalize text-muted md:block">{role ?? "reader"}</span>
                </button>
                {profileOpen ? (
                  <div
                    className="absolute right-0 top-full mt-2.5 w-64 overflow-hidden rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-2xl shadow-2xl z-50 pointer-events-auto"
                    role="menu"
                  >
                    <div className="border-b border-white/10 px-4 py-3">
                      <div className="text-sm font-semibold text-white">{displayName || "FYP User"}</div>
                      <div className="text-xs capitalize text-muted">{role ?? "reader"}</div>
                    </div>
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className="sf-clickable flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-white/5 hover:text-white transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      className="sf-clickable flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left text-sm text-muted hover:bg-white/5 hover:text-white transition-colors"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        toast({ tone: "default", title: "Logged out", message: "You have been logged out." });
                        router.push("/");
                      }}
                    >
                      <LogOut className="h-4 w-4 text-rose-400" />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Button variant="primary" size="sm" onClick={() => router.push("/login")}>
                Login
              </Button>
              <button
                onClick={() => {
                  toast({
                    tone: "danger",
                    title: "Login Required",
                    message: "Please log in to access your wallet and coins."
                  });
                  router.push("/login");
                }}
                className="sf-clickable hidden gap-2 sm:flex items-center"
                title="Wallet Coins (Login required)"
              >
                <Badge tone="gold" className="gap-2 cursor-pointer hover:scale-105 transition-transform">
                  <Coins className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{coinBalance}</span>
                </Badge>
              </button>
              <button
                className="sf-clickable hidden h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:border-highlight/30 hover:bg-white/8 sm:grid"
                aria-label="Open notifications"
                onClick={() => {
                  toast({
                    tone: "danger",
                    title: "Login Required",
                    message: "Please log in to view notifications."
                  });
                  router.push("/login");
                }}
              >
                <Bell className="h-4 w-4 text-muted" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
