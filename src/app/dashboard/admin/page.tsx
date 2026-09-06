"use client";

import Link from "@/compat/next-link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useToastStore } from "@/store/toastStore";
import { useCommentStore } from "@/store/commentStore";

type Row = {
  id: string;
  chapterName: string;
  seriesId: string;
  chapterId: string;
  pages: number;
  uploadedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  isPublished: boolean;
};

type AdminCredentialView = "all" | "readers" | "writers" | "subscriptions";

type UserRow = {
  id: string;
  username: string;
  email: string;
  role: "reader" | "writer" | "admin";
  subscription: "Free" | "Premium" | "Creator Pro";
  status: "Active" | "Suspended";
  joinedAt: string;
  lastLogin: string;
  points: number;
};

export default function AdminPublishingGatePage() {
  const toast = useToastStore((s) => s.push);
  const comments = useCommentStore((s) => s.comments);
  const markReviewed = useCommentStore((s) => s.markReviewed);
  const [query, setQuery] = useState("");
  const [credentialView, setCredentialView] = useState<AdminCredentialView>("all");
  const [rows, setRows] = useState<Row[]>([
    {
      id: "r1",
      chapterName: "Night City Blade — Ch. 4",
      seriesId: "s1",
      chapterId: "c4",
      pages: 42,
      uploadedAt: "2026-05-18",
      status: "Pending",
      isPublished: false
    },
    {
      id: "r2",
      chapterName: "Rose & Ruin — Ch. 13",
      seriesId: "s2",
      chapterId: "c13",
      pages: 36,
      uploadedAt: "2026-05-22",
      status: "Pending",
      isPublished: false
    }
  ]);
  const [users, setUsers] = useState<UserRow[]>([
    {
      id: "u1",
      username: "sravan_reader",
      email: "sravan.reader@fyp.local",
      role: "reader",
      subscription: "Premium",
      status: "Active",
      joinedAt: "2026-05-02",
      lastLogin: "2026-06-24",
      points: 240
    },
    {
      id: "u2",
      username: "neon_writer",
      email: "writer@fyp.local",
      role: "writer",
      subscription: "Creator Pro",
      status: "Active",
      joinedAt: "2026-04-18",
      lastLogin: "2026-06-23",
      points: 1824
    },
    {
      id: "u3",
      username: "manga_fan_09",
      email: "fan09@fyp.local",
      role: "reader",
      subscription: "Free",
      status: "Active",
      joinedAt: "2026-06-01",
      lastLogin: "2026-06-20",
      points: 35
    },
    {
      id: "u4",
      username: "admin_master",
      email: "admin@fyp.local",
      role: "admin",
      subscription: "Creator Pro",
      status: "Active",
      joinedAt: "2026-03-11",
      lastLogin: "2026-06-25",
      points: 9999
    }
  ]);

  const pendingCount = useMemo(() => rows.filter((r) => r.status === "Pending").length, [rows]);
  const filteredUsers = useMemo(() => {
    const scoped = users.filter((user) => {
      if (credentialView === "readers") return user.role === "reader";
      if (credentialView === "writers") return user.role === "writer";
      if (credentialView === "subscriptions") return user.subscription !== "Free";
      return true;
    });
    const needle = query.trim().toLowerCase();
    if (!needle) return scoped;
    return scoped.filter((user) =>
      [user.username, user.email, user.role, user.subscription, user.status].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [credentialView, query, users]);
  const adminStats = useMemo(
    () => [
      { label: "Total Users", value: String(users.length), tone: "primary" as const, view: "all" as const },
      { label: "Readers", value: String(users.filter((user) => user.role === "reader").length), tone: "muted" as const, view: "readers" as const },
      { label: "Writers", value: String(users.filter((user) => user.role === "writer").length), tone: "gold" as const, view: "writers" as const },
      {
        label: "Subscription Members",
        value: String(users.filter((user) => user.subscription !== "Free").length),
        tone: "primary" as const,
        view: "subscriptions" as const
      }
    ],
    [users]
  );

  const credentialTitle = credentialView === "readers" ? "Reader Credentials" : credentialView === "writers" ? "Writer Credentials" : credentialView === "subscriptions" ? "Subscription Members" : "Website Users & Credentials";
  const credentialDescription = credentialView === "readers"
    ? "All reader usernames, email IDs, subscription status, points, and access controls."
    : credentialView === "writers"
      ? "All writer usernames, creator subscriptions, points, upload access, and account status."
      : credentialView === "subscriptions"
        ? "All paid subscription users with their usernames, roles, subscription plans, and account status."
        : "View usernames, roles, subscription members, and access status.";

  function setStatus(id: string, status: Row["status"]) {
    setRows((s) =>
      s.map((r) => (r.id === id ? { ...r, status, isPublished: status === "Approved" ? r.isPublished : false } : r))
    );
    toast({
      tone: status === "Approved" ? "success" : status === "Rejected" ? "danger" : "default",
      title: `Chapter ${status}`,
      message: "Action applied locally (demo)."
    });
  }

  function togglePublished(id: string) {
    setRows((s) =>
      s.map((r) => (r.id === id ? { ...r, isPublished: !r.isPublished } : r))
    );
    toast({ tone: "default", title: "Publish toggled", message: "is_published updated (demo)." });
  }

  function bulkApprove() {
    setRows((s) => s.map((r) => (r.status === "Pending" ? { ...r, status: "Approved" } : r)));
    toast({ tone: "success", title: "Bulk approved", message: "All pending chapters approved (demo)." });
  }

  function updateUser<K extends keyof UserRow>(id: string, key: K, value: UserRow[K]) {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, [key]: value } : user)));
  }

  function addUser() {
    const nextIndex = users.length + 1;
    setUsers((current) => [
      {
        id: crypto.randomUUID(),
        username: `new_user_${nextIndex}`,
        email: `new.user${nextIndex}@fyp.local`,
        role: "reader",
        subscription: "Free",
        status: "Active",
        joinedAt: new Date().toISOString().slice(0, 10),
        lastLogin: "Not yet",
        points: 0
      },
      ...current
    ]);
    toast({ tone: "success", title: "User added", message: "New editable user row created." });
  }

  function saveAdminChanges() {
    toast({
      tone: "success",
      title: "Admin changes saved",
      message: "User credentials, roles, subscriptions, and status changes saved locally."
    });
  }

  function toggleUserStatus(id: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } : user
      )
    );
    toast({ tone: "default", title: "User status changed", message: "Access status updated locally." });
  }

  function resetUserPassword(user: UserRow) {
    toast({
      tone: "default",
      title: "Password reset",
      message: `Reset link generated for ${user.username} (demo).`
    });
  }

  function removeUser(id: string) {
    setUsers((current) => current.filter((user) => user.id !== id));
    toast({ tone: "danger", title: "User removed", message: "User removed from the admin list locally." });
  }

  return (
    <RequireAuth roles={["admin"]} redirectTo="/admin/login">
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-4xl tracking-widest">Admin Home</div>
          <div className="text-sm text-muted">All credentials, approvals, subscriptions, and website users</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="muted">{pendingCount} pending</Badge>
          <Link href="/">
            <Button variant="ghost">Home Page</Button>
          </Link>
          <a href="#credentials">
            <Button variant="outline">Credentials</Button>
          </a>
          <a href="#approvals">
            <Button variant="outline">Approvals</Button>
          </a>
          <Button variant="outline" onClick={addUser}>
            Add User
          </Button>
          <Button variant="gold" onClick={saveAdminChanges}>
            Save Changes
          </Button>
          <Button variant="primary" onClick={bulkApprove}>
            Bulk approve
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {adminStats.map((stat) => {
          const active = credentialView === stat.view;
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => setCredentialView(stat.view)}
              className={`sf-comic-card rounded-3xl border p-5 text-left transition ${active ? "border-primary/45 bg-primary/10 shadow-glow" : "border-white/10 bg-card hover:border-highlight/35"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted">{stat.label}</div>
                <Badge tone={active ? "primary" : stat.tone}>{active ? "Selected" : "Live"}</Badge>
              </div>
              <div className="mt-3 text-3xl font-semibold tabular-nums">{stat.value}</div>
              <div className="mt-2 text-[11px] text-muted">Click to view details</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="sf-comic-card rounded-3xl border border-white/10 bg-card p-5">
          <div className="font-display text-2xl tracking-widest">Admin Home Panel</div>
          <div className="mt-2 text-sm text-muted">
            Access the public home page, all user credentials, subscriptions, and writer approvals from one place.
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <Link href="/" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 hover:border-primary/40">
              Open public home page
            </Link>
            <a href="#credentials" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 hover:border-primary/40">
              Manage all credentials
            </a>
            <a href="#approvals" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 hover:border-primary/40">
              Review all approvals
            </a>
          </div>
        </div>

        <div className="sf-comic-card rounded-3xl border border-white/10 bg-card p-5">
          <div className="font-display text-2xl tracking-widest">Approval Summary</div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-muted">Pending uploads</span>
              <Badge tone="gold">{pendingCount}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-muted">Approved uploads</span>
              <Badge tone="primary">{rows.filter((row) => row.status === "Approved").length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-muted">Published chapters</span>
              <Badge tone="primary">{rows.filter((row) => row.isPublished).length}</Badge>
            </div>
          </div>
        </div>

        <div className="sf-comic-card rounded-3xl border border-white/10 bg-card p-5">
          <div className="font-display text-2xl tracking-widest">Credential Summary</div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-muted">Active users</span>
              <Badge tone="primary">{users.filter((user) => user.status === "Active").length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-muted">Suspended users</span>
              <Badge tone="danger">{users.filter((user) => user.status === "Suspended").length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-muted">Paid members</span>
              <Badge tone="gold">{users.filter((user) => user.subscription !== "Free").length}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div id="credentials" className="scroll-mt-24 rounded-3xl border border-white/10 bg-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-2xl tracking-widest">{credentialTitle}</div>
            <div className="text-sm text-muted">{credentialDescription}</div>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm outline-none focus:border-primary/45 md:w-72"
            placeholder={`Search ${credentialView === "all" ? "users" : credentialTitle.toLowerCase()}...`}
          />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <div className="grid min-w-[980px] grid-cols-[1.2fr_1.6fr_1fr_1.1fr_0.9fr_0.8fr_1.6fr] bg-white/5 px-4 py-3 text-xs text-muted">
            <div>Username</div>
            <div>Email</div>
            <div>Role</div>
            <div>Subscription</div>
            <div>Status</div>
            <div>Points</div>
            <div className="text-right">Admin Actions</div>
          </div>

          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="grid min-w-[980px] grid-cols-[1.2fr_1.6fr_1fr_1.1fr_0.9fr_0.8fr_1.6fr] items-center border-t border-white/8 px-4 py-4 text-sm"
            >
              <div>
                <input
                  value={user.username}
                  onChange={(e) => updateUser(user.id, "username", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-semibold outline-none focus:border-primary/45"
                />
                <div className="mt-1 text-[11px] text-muted">Joined {user.joinedAt} · Last {user.lastLogin}</div>
              </div>
              <input
                value={user.email}
                onChange={(e) => updateUser(user.id, "email", e.target.value)}
                className="mr-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-primary/45"
              />
              <select
                value={user.role}
                onChange={(e) => updateUser(user.id, "role", e.target.value as UserRow["role"])}
                className="mr-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 capitalize outline-none focus:border-primary/45"
              >
                <option className="bg-black" value="reader">Reader</option>
                <option className="bg-black" value="writer">Writer</option>
                <option className="bg-black" value="admin">Admin</option>
              </select>
              <select
                value={user.subscription}
                onChange={(e) => updateUser(user.id, "subscription", e.target.value as UserRow["subscription"])}
                className="mr-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-primary/45"
              >
                <option className="bg-black" value="Free">Free</option>
                <option className="bg-black" value="Premium">Premium</option>
                <option className="bg-black" value="Creator Pro">Creator Pro</option>
              </select>
              <Badge tone={user.status === "Active" ? "primary" : "danger"}>{user.status}</Badge>
              <input
                type="number"
                value={user.points}
                onChange={(e) => updateUser(user.id, "points", Number(e.target.value))}
                className="mr-3 w-20 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right outline-none focus:border-primary/45"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => resetUserPassword(user)}>
                  Reset
                </Button>
                <Button
                  variant={user.status === "Active" ? "ghost" : "primary"}
                  size="sm"
                  onClick={() => toggleUserStatus(user.id)}
                >
                  {user.status === "Active" ? "Suspend" : "Activate"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeUser(user.id)}
                  disabled={user.role === "admin" && users.filter((item) => item.role === "admin").length <= 1}
                  title="At least one admin must remain"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted">No users match this search.</div>
          ) : null}
        </div>

        <div className="mt-3 text-xs text-muted">
          Demo admin controls: edits are stored locally in the current browser session. Connect these fields to your backend when your database is ready.
        </div>
      </div>

      <div id="approvals" className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-card">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="font-display text-2xl tracking-widest">Writer Upload Publishing</div>
          <div className="text-sm text-muted">Approve, reject, preview, publish, and unpublish writer chapters.</div>
        </div>
        <div className="grid grid-cols-5 bg-white/5 px-4 py-3 text-xs text-muted">
          <div>Chapter</div>
          <div>Pages</div>
          <div>Uploaded</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-5 items-center border-t border-white/8 px-4 py-4 text-sm">
            <div className="font-semibold">{r.chapterName}</div>
            <div className="text-muted">{r.pages}</div>
            <div className="text-muted">{r.uploadedAt}</div>
            <div>
              <Badge tone={r.status === "Approved" ? "primary" : r.status === "Rejected" ? "danger" : "gold"}>
                {r.status}
              </Badge>
              <div className="mt-1 text-xs text-muted">
                is_published:{" "}
                <span className={r.isPublished ? "text-emerald-400" : "text-muted"}>
                  {String(r.isPublished)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Link href={`/read/${r.chapterId}`} title="Read-only preview prototype">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setStatus(r.id, "Approved")}>
                Approve
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatus(r.id, "Rejected")}>
                Reject
              </Button>
              <Button
                variant={r.isPublished ? "danger" : "primary"}
                size="sm"
                onClick={() => togglePublished(r.id)}
                disabled={r.status !== "Approved"}
                title={r.status !== "Approved" ? "Disabled until approved" : "Toggle publish"}
              >
                {r.isPublished ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-2xl tracking-widest">All Reader Comments</div>
            <div className="text-sm text-muted">Comic and chapter comments delivered to admins and writers.</div>
          </div>
          <Badge tone="gold">{comments.filter((comment) => comment.status === "New").length} new</Badge>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-5 bg-white/5 px-4 py-3 text-xs text-muted">
            <div>Comic</div>
            <div>Chapter</div>
            <div>Reader</div>
            <div>Comment</div>
            <div className="text-right">Status</div>
          </div>
          {comments.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted">No comments yet.</div>
          ) : (
            comments.slice(0, 10).map((comment) => (
              <div key={comment.id} className="grid grid-cols-5 items-start border-t border-white/8 px-4 py-4 text-sm">
                <div className="font-semibold">{comment.seriesName}</div>
                <div className="text-muted">
                  {comment.targetType === "Comic" ? "Whole comic" : comment.chapterId}
                  {comment.pageIndex ? ` / Page ${comment.pageIndex}` : ""}
                </div>
                <div className="text-muted">{comment.readerName}</div>
                <div className="pr-3 text-white/80">{comment.body}</div>
                <div className="text-right">
                  <Badge tone={comment.status === "New" ? "gold" : "muted"}>{comment.status}</Badge>
                  {comment.status === "New" ? (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => markReviewed(comment.id)}>
                        Review
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
