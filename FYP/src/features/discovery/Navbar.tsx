"use client";

import { Bell, Bookmark, Coins, LogOut, Pencil, Search, Settings, User, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/components/cn";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const GENRES = ["Action", "Romance", "Horror", "Mystery", "Fantasy"] as const;

export function Navbar({
  onSearch
}: {
  onSearch?: (q: string, genre?: (typeof GENRES)[number]) => void;
}) {
  const router = useRouter();
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
    <div className="sticky top-0 z-40 border-b border-white/8 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary shadow-glow">
            <span className="font-display text-lg">FYP</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-wider">FYP</div>
            <div className="text-xs text-muted">Cinema-grade reading</div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-surface px-3 py-2">
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
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-primary/40 bg-primary/15 text-white"
                      : "border-white/10 bg-white/5 text-muted hover:text-white hover:bg-white/8"
                  )}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
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
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/8"
                aria-label="Open notifications"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-4 w-4 text-muted" />
              </button>
              <div className="relative" ref={profileRef}>
                <button
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 hover:bg-white/8"
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
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl"
                    role="menu"
                  >
                    <div className="border-b border-white/10 px-4 py-3">
                      <div className="text-sm font-semibold">{displayName || "FYP User"}</div>
                      <div className="text-xs capitalize text-muted">{role ?? "reader"}</div>
                    </div>
                    {[
                      { href: "/profile", label: "Profile", icon: User },
                      { href: "/profile/edit", label: "Edit Profile", icon: Pencil },
                      { href: "/settings", label: "Settings", icon: Settings },
                      { href: "/saved-stories", label: "Saved Stories", icon: Bookmark },
                      { href: "/wallet", label: "Wallet", icon: Wallet }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-white/5 hover:text-white"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left text-sm text-muted hover:bg-white/5 hover:text-white"
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
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/8"
                aria-label="Open notifications"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-4 w-4 text-muted" />
              </button>
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/8"
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
