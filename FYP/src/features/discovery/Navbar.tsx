"use client";

import { Bell, Bookmark, Coins, LogOut, Pencil, Search, Settings, User, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/components/cn";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const GENRES = ["Action", "Romance", "Horror", "Mystery", "Fantasy"] as const;
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/series", label: "Series" },
  { href: "/vault", label: "Vault" }
];

export function Navbar({
  onSearch
}: {
  onSearch?: (q: string, genre?: (typeof GENRES)[number]) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const coinBalance = useWalletStore((s) => s.coinBalance);
  const toast = useToastStore((s) => s.push);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const displayName = useAuthStore((s) => s.displayName);
  const logout = useAuthStore((s) => s.logout);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<(typeof GENRES)[number] | undefined>(undefined);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const placeholder = useMemo(() => (genre ? `Search in ${genre}…` : "Search series…"), [genre]);
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
      { href: "/saved-stories", label: "Saved Stories", icon: Bookmark },
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
    if (!profileOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [profileOpen]);

  return (
    <div className="sticky top-0 z-40 border-b border-white/8 bg-bg/82 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 lg:flex-nowrap lg:gap-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary shadow-glow">
            <span className="font-display text-lg">FYP</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-wider">FYP</div>
            <div className="text-xs text-muted">Cinema-grade reading</div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sf-clickable relative rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                  active ? "text-white" : "text-muted hover:text-white"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[linear-gradient(90deg,var(--sf-primary),var(--sf-highlight))] transition-opacity duration-300",
                    active ? "opacity-100 shadow-[0_0_12px_rgba(255,51,102,0.55)]" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="order-3 flex min-w-full items-center gap-3 md:order-none md:min-w-0 md:flex-1">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-surface/90 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] transition focus-within:border-primary/45 focus-within:shadow-[0_0_22px_rgba(255,51,102,0.12)]">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              placeholder={placeholder}
              aria-label="Search series"
            />
          </div>

          <div className="hidden items-center gap-2 md:flex" role="group" aria-label="Genre filters">
            {GENRES.map((g) => {
              const active = genre === g;
              return (
                <button
                  key={g}
                  onClick={() => setGenre(active ? undefined : g)}
                  className={cn(
                    "sf-clickable rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-primary/45 bg-primary/18 text-white shadow-[0_0_18px_rgba(255,51,102,0.14)]"
                      : "border-white/10 bg-white/5 text-muted hover:bg-white/8 hover:text-white"
                  )}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {isAuthenticated ? (
            <>
              {role === "reader" ? (
                <Button variant="outline" size="sm" onClick={() => router.push("/saved-stories")}>
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
              <div className="relative" ref={profileRef}>
                <button
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
                    className="sf-comic-panel sf-comic-surface absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl"
                    role="menu"
                  >
                    <div className="border-b border-white/10 px-4 py-3">
                      <div className="text-sm font-semibold">{displayName || "FYP User"}</div>
                      <div className="text-xs capitalize text-muted">{role ?? "reader"}</div>
                    </div>
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className="sf-clickable flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-white/5 hover:text-white"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      className="sf-clickable flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left text-sm text-muted hover:bg-white/5 hover:text-white"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        toast({ tone: "default", title: "Logged out", message: "You have been logged out." });
                        router.push("/");
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
                Login
              </Button>
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
                className="sf-clickable grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:border-primary/35 hover:bg-white/8"
                aria-label="Open profile"
                onClick={() => router.push("/login")}
              >
                <span className="text-sm font-semibold">SR</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
