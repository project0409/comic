"use client";

import Link from "@/compat/next-link";
import { BarChart3, Bookmark, BookOpen, LayoutDashboard, Pencil, Settings, ShieldCheck, Upload, User, Star } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthStore } from "@/store/authStore";
import { useVaultStore } from "@/store/vaultStore";

export default function ProfilePage() {
  const role = useAuthStore((s) => s.role);
  const displayName = useAuthStore((s) => s.displayName);
  const email = useAuthStore((s) => s.email);
  const provider = useAuthStore((s) => s.provider);
  const historyCount = useVaultStore((s) => s.history.length);
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
            "Read free chapters & track history",
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

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted">
              <BookOpen className="h-4 w-4 text-primary" />
              Comics Read
            </div>
            <div className="mt-3 text-3xl font-semibold tabular-nums">{historyCount}</div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br from-violet-600 via-indigo-700 to-pink-500 p-5 shadow-[0_8px_32px_rgba(124,58,237,0.22)] transition hover:scale-[1.02] hover:shadow-[0_12px_42px_rgba(124,58,237,0.3)] duration-300">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/5 blur-lg" />
            
            <div className="relative flex items-center gap-2 text-sm text-white/90">
              <Star className="h-4 w-4 fill-white text-white" />
              Points
            </div>
            <div className="relative mt-3 text-3xl font-bold tabular-nums text-white">12,560</div>
            <div className="relative mt-1 text-[11px] font-semibold text-white/80">+250 earned today</div>
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
          <Link href="/library">
            <Button variant="primary"><BookOpen className="h-4 w-4" /> My Library</Button>
          </Link>
          <Link href="/profile/edit">
            <Button variant="outline"><Pencil className="h-4 w-4" /> Edit Profile</Button>
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
                  <Link href="/library"><Button size="sm" variant="outline">Library</Button></Link>
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
