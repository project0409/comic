"use client";

import Link from "@/compat/next-link";
import { useRouter } from "@/compat/next-navigation";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { consumeAuthFlash, setAuthFlash } from "@/lib/authFlash";
import { createGoogleAuthUrl, getActiveGoogleClientId } from "@/lib/googleIdentity";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [role, setRole] = useState<"reader" | "writer">("reader");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => (role === "reader" ? "Reader Login" : "Writer Login"), [role]);

  useEffect(() => {
    const flash = consumeAuthFlash();
    if (flash?.type === "register_success") {
      toast({
        tone: "success",
        title: "Registered successfully",
        message: flash.email ? `Account created for ${flash.email}. Please log in.` : "Your account is ready. Please log in."
      });
      if (flash.email) setEmail(flash.email);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  function handleCredentialsSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ tone: "danger", title: "Validation Error", message: "Please enter both email and password." });
      return;
    }
    if (password.length < 6) {
      toast({ tone: "danger", title: "Weak password", message: "Password must be at least 6 characters." });
      return;
    }

    setSubmitting(true);
    loginWithCredentials(role, email);
    const bonusAwarded = useWalletStore.getState().grantWelcomeBonusForNewUser(email);
    setSubmitting(false);

    if (bonusAwarded) {
      toast({
        tone: "success",
        title: "Welcome! 🎉",
        message: "Your reading profile is active. Start exploring all free chapters!"
      });
    } else {
      toast({
        tone: "success",
        title: `${role === "reader" ? "Reader" : "Writer"} Login`,
        message: "Welcome back! Your reading library and progress are ready."
      });
    }
    setAuthFlash({ type: "login_success", displayName: email.trim().split("@")[0] });
    router.replace(role === "writer" ? "/dashboard/writer" : "/");
  }

  function handleGoogleLogin() {
    loginWithGoogle(role);
    const clientId = getActiveGoogleClientId();
    if (!clientId) {
      toast({ tone: "danger", title: "Google setup required", message: "Add or paste a Google OAuth client ID first." });
      router.push("/auth/google?mode=login");
      return;
    }
    toast({ tone: "default", title: "Google Authentication", message: "Redirecting to Google account chooser..." });
    window.location.assign(createGoogleAuthUrl(clientId, "login"));
  }

  return (
    <div className="relative z-20 grid min-h-dvh place-items-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-35 blur-[2px]"
        style={{
          background:
            "radial-gradient(900px 500px at 30% 10%, rgba(255,51,102,0.24), transparent 60%), radial-gradient(900px 500px at 80% 60%, rgba(0,229,255,0.1), transparent 60%), radial-gradient(700px 420px at 72% 85%, rgba(255,193,7,0.08), transparent 62%), repeating-linear-gradient(135deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 16px)"
        }}
      />

      <div className="relative w-[min(440px,92vw)] rounded-3xl border border-white/10 bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary shadow-glow">
            <span className="font-display text-xl">FYP</span>
          </div>
          <div>
            <div className="font-display text-2xl tracking-widest">FYP</div>
            <div className="text-sm text-muted">{title}</div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-highlight/20 bg-highlight/5 p-3 text-xs text-muted">
          Select Reader or Writer to continue with the correct access permissions.
        </div>

        <motion.form
          key="credentials"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          className="space-y-3"
          onSubmit={handleCredentialsSubmit}
        >
              <div className="grid grid-cols-2 gap-2">
                {(["reader", "writer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-2xl border px-4 py-2 text-sm capitalize transition ${
                      role === r
                        ? "border-primary/40 bg-primary/15 text-white"
                        : "border-white/10 bg-white/5 text-muted hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <label className="block text-xs text-muted">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-primary/40"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label className="block text-xs text-muted">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-primary/40"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              <Button className="w-full" variant="primary" size="lg" type="submit" disabled={submitting}>
                {submitting ? "Logging in..." : `Login as ${role === "reader" ? "Reader" : "Writer"}`}
              </Button>

              <Button className="w-full" variant="outline" size="lg" type="button" onClick={handleGoogleLogin}>
                Google OAuth
              </Button>

              <div className="text-center text-sm text-muted">
                New here?{" "}
                <Link href="/register" className="text-white underline decoration-white/30 hover:decoration-white">
                  Create an account
                </Link>
              </div>
        </motion.form>
      </div>
    </div>
  );
}
