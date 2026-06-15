"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

export default function EditProfilePage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const currentName = useAuthStore((s) => s.displayName);
  const currentEmail = useAuthStore((s) => s.email);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [displayName, setDisplayName] = useState(currentName ?? "");
  const [email, setEmail] = useState(currentEmail ?? "");

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-3xl tracking-widest">Edit Profile</div>
          <div className="mt-1 text-sm text-muted">Update the account details shown in your profile menu.</div>

          <div className="mt-6 space-y-4">
            <label className="block text-xs text-muted">
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none"
                placeholder="Your name"
              />
            </label>
            <label className="block text-xs text-muted">
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none"
                placeholder="you@example.com"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  if (!displayName.trim()) {
                    toast({ tone: "danger", title: "Name required", message: "Please enter a display name." });
                    return;
                  }
                  updateProfile({ displayName: displayName.trim(), email: email.trim() || undefined });
                  toast({ tone: "success", title: "Profile updated", message: "Your changes were saved." });
                  router.push("/profile");
                }}
              >
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => router.push("/profile")}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
