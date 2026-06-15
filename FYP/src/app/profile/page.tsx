"use client";

import Link from "next/link";
import { Bookmark, Coins, Pencil, Settings, User } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthStore } from "@/store/authStore";
import { useVaultStore } from "@/store/vaultStore";
import { useWalletStore } from "@/store/walletStore";

export default function ProfilePage() {
  const role = useAuthStore((s) => s.role);
  const displayName = useAuthStore((s) => s.displayName);
  const email = useAuthStore((s) => s.email);
  const provider = useAuthStore((s) => s.provider);
  const coinBalance = useWalletStore((s) => s.coinBalance);
  const savedCount = useVaultStore((s) => s.bookmarks.length);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/20 text-primary">
                <User className="h-8 w-8" />
              </div>
              <div>
                <div className="font-display text-3xl tracking-widest">{displayName || "FYP User"}</div>
                <div className="text-sm text-muted">{email || "Google account"} · {provider ?? "email"}</div>
              </div>
            </div>
            <Badge tone="primary" className="w-fit capitalize">{role ?? "reader"}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Coins className="h-4 w-4 text-gold" />
              Coin Balance
            </div>
            <div className="mt-3 text-3xl font-semibold tabular-nums">{coinBalance}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Bookmark className="h-4 w-4 text-primary" />
              Saved Stories
            </div>
            <div className="mt-3 text-3xl font-semibold tabular-nums">{savedCount}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-card p-5">
            <div className="text-sm text-muted">Account Type</div>
            <div className="mt-3 text-3xl font-semibold capitalize">{role ?? "reader"}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/profile/edit">
            <Button variant="primary"><Pencil className="h-4 w-4" /> Edit Profile</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline"><Settings className="h-4 w-4" /> Settings</Button>
          </Link>
          <Link href="/saved-stories">
            <Button variant="outline"><Bookmark className="h-4 w-4" /> Saved Stories</Button>
          </Link>
        </div>
      </div>
    </RequireAuth>
  );
}
