"use client";

import { useRouter } from "@/compat/next-navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (!identifier.trim() || !password.trim()) {
      toast({ tone: "danger", title: "Validation Error", message: "Please enter username/mail ID and password." });
      return;
    }
    if (password.length < 6) {
      toast({ tone: "danger", title: "Weak password", message: "Password must be at least 6 characters." });
      return;
    }
    const normalizedIdentifier = identifier.trim();
    const configuredUsername = ADMIN_EMAIL?.split("@")[0];
    const matchesIdentifier =
      ADMIN_EMAIL &&
      (normalizedIdentifier.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
        normalizedIdentifier.toLowerCase() === configuredUsername?.toLowerCase());
    const envCredentialsConfigured = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
    const matchesEnv = matchesIdentifier && password === ADMIN_PASSWORD;
    if (envCredentialsConfigured && !matchesEnv) {
      toast({ tone: "danger", title: "Invalid credentials", message: "Please check your admin username/mail ID and password." });
      return;
    }
    loginAsAdmin(envCredentialsConfigured ? ADMIN_EMAIL! : normalizedIdentifier);
    toast({ tone: "success", title: "Admin login successful", message: "Redirecting to Admin Gate..." });
    router.push("/dashboard/admin");
  }

  return (
    <div className="relative z-20 grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="relative w-[min(460px,92vw)] rounded-3xl border border-white/10 bg-card p-6 shadow-2xl">
        <div className="mb-4">
          <div className="font-display text-3xl tracking-widest">FYP Admin Login</div>
          <div className="text-sm text-muted">Separate admin access for users, subscriptions, and publishing controls</div>
        </div>

        <div className="mb-4 rounded-2xl border border-highlight/20 bg-highlight/5 p-3 text-xs text-muted">
          After login you can view usernames, edit user credentials, manage roles, subscriptions, status, and writer uploads.
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
            <label className="block text-xs text-muted">
              Username / Mail ID
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none"
                placeholder="Enter username or mail ID"
                autoComplete="username"
              />
            </label>
            <label className="block text-xs text-muted">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>

            <Button className="w-full" variant="primary" size="lg" type="submit">
              Login as Admin
            </Button>

            <Button className="w-full" variant="ghost" type="button" onClick={() => router.push("/login")}>
              Go to normal login
            </Button>
            <Button className="w-full" variant="outline" type="button" onClick={() => router.push("/")}>
              Go to Home Page
            </Button>
        </form>
      </div>
    </div>
  );
}
