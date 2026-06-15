"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const ADMIN_2FA_CODE = process.env.NEXT_PUBLIC_ADMIN_2FA_CODE ?? "123456";

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"credentials" | "two-factor">("credentials");
  const [otp, setOtp] = useState("");
  const [verifiedAdminEmail, setVerifiedAdminEmail] = useState("");

  function handleLogin() {
    if (!identifier.trim() || !password.trim()) {
      toast({ tone: "danger", title: "Validation Error", message: "Please enter username/mail ID and password." });
      return;
    }
    const normalizedIdentifier = identifier.trim();
    const configuredUsername = ADMIN_EMAIL?.split("@")[0];
    const matchesIdentifier =
      ADMIN_EMAIL &&
      (normalizedIdentifier.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
        normalizedIdentifier.toLowerCase() === configuredUsername?.toLowerCase());
    const matchesEnv = matchesIdentifier && ADMIN_PASSWORD && password === ADMIN_PASSWORD;
    if (!matchesEnv) {
      toast({ tone: "danger", title: "Invalid credentials", message: "Please check your admin username/mail ID and password." });
      return;
    }
    setVerifiedAdminEmail(ADMIN_EMAIL);
    setStep("two-factor");
    toast({ tone: "default", title: "Two-factor required", message: `Enter admin code. Demo code: ${ADMIN_2FA_CODE}` });
  }

  function handleTwoFactor() {
    if (otp.trim() !== ADMIN_2FA_CODE) {
      toast({ tone: "danger", title: "Invalid code", message: "Please enter the correct 2FA code." });
      return;
    }
    loginAsAdmin(verifiedAdminEmail);
    toast({ tone: "success", title: "Admin verified", message: "Redirecting to Admin Gate..." });
    router.push("/dashboard/admin");
  }

  return (
    <div className="relative z-20 grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="relative w-[min(460px,92vw)] rounded-3xl border border-white/10 bg-card p-6 shadow-2xl">
        <div className="mb-4">
          <div className="font-display text-3xl tracking-widest">FYP Admin Login</div>
          <div className="text-sm text-muted">Separate admin access</div>
        </div>

        {step === "credentials" ? (
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
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleTwoFactor();
            }}
          >
            <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="font-semibold text-white">Two-factor authentication</div>
                <div className="mt-1 text-sm text-muted">
                  Enter the 6-digit admin verification code.
                </div>
              </div>
            </div>

            <label className="block text-xs text-muted">
              2FA code
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center text-lg tracking-[0.35em] outline-none"
                placeholder="000000"
                inputMode="numeric"
                autoFocus
              />
            </label>

            <div className="text-center text-[11px] text-muted">
              Demo code: <span className="font-mono text-white">{ADMIN_2FA_CODE}</span>
            </div>

            <Button className="w-full" variant="primary" size="lg" type="submit" disabled={otp.length !== 6}>
              Verify & Login
            </Button>

            <Button
              className="w-full"
              variant="ghost"
              type="button"
              onClick={() => {
                setStep("credentials");
                setOtp("");
              }}
            >
              Back
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
