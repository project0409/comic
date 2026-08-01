"use client";

import Link from "@/compat/next-link";
import { BarChart3, Bookmark, Coins, LayoutDashboard, Pencil, Settings, ShieldCheck, Upload, User } from "lucide-react";
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
  const roleName = role ?? "reader";
  const permissions =
    roleName === "admin"
      ? [
          "Approve or reject writer uploads",
          "Publish and unpublish approved chapters",
          "Preview submitted chapters",
          "Access writer dashboards and analytics"
        ]
      : roleName === "writer"
        ? [
            "Upload chapter pages",
            "Edit chapter metadata",
            "Track approval and publish status",
            "View analytics and reader engagement"
          ]
        : [
            "Read available comic chapters",
            "Save panels and stories",
            "Use wallet and unlock coin chapters",
            "Manage profile, settings, and vault"
          ];

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
          {roleName === "writer" || roleName === "admin" ? (
            <Link href="/dashboard/writer">
              <Button variant="outline"><Upload className="h-4 w-4" /> Writer Tools</Button>
            </Link>
          ) : null}
          {roleName === "writer" || roleName === "admin" ? (
            <Link href="/dashboard/analytics">
              <Button variant="outline"><BarChart3 className="h-4 w-4" /> Analytics</Button>
            </Link>
          ) : null}
          {roleName === "admin" ? (
            <Link href="/dashboard/admin">
              <Button variant="gold"><ShieldCheck className="h-4 w-4" /> Admin Gate</Button>
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
          <div className="sf-comic-card rounded-3xl border border-white/10 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <LayoutDashboard className="h-4 w-4 text-highlight" />
              Role Features
            </div>
            <div className="mt-3 font-display text-2xl tracking-widest capitalize">{roleName} Access</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {roleName === "reader" ? (
                <>
                  <Link href="/series"><Button size="sm" variant="primary">Browse Comics</Button></Link>
                  <Link href="/vault"><Button size="sm" variant="outline">Open Vault</Button></Link>
                  <Link href="/wallet"><Button size="sm" variant="outline">Wallet</Button></Link>
                </>
              ) : null}
              {roleName === "writer" ? (
                <>
                  <Link href="/dashboard/writer"><Button size="sm" variant="primary">Upload Chapter</Button></Link>
                  <Link href="/dashboard/analytics"><Button size="sm" variant="outline">View Analytics</Button></Link>
                </>
              ) : null}
              {roleName === "admin" ? (
                <>
                  <Link href="/dashboard/admin"><Button size="sm" variant="primary">Review Uploads</Button></Link>
                  <Link href="/dashboard/writer"><Button size="sm" variant="outline">Writer Tools</Button></Link>
                </>
              ) : null}
            </div>
          </div>

          <div className="sf-comic-card rounded-3xl border border-white/10 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Permissions
            </div>
            <div className="mt-3 grid gap-2">
              {permissions.map((permission) => (
                <div key={permission} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                  {permission}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
