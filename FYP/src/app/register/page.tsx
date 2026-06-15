"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/Button";
import { EmailVerificationStep } from "@/features/auth/EmailVerificationStep";
import { setAuthFlash } from "@/lib/authFlash";
import { createGoogleAuthUrl, getActiveGoogleClientId } from "@/lib/googleIdentity";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

type Step = "form" | "verify";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const requestEmailVerification = useAuthStore((s) => s.requestEmailVerification);
  const cancelPendingEmailAuth = useAuthStore((s) => s.cancelPendingEmailAuth);

  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [role, setRole] = useState<"reader" | "writer">("reader");
  const [submitting, setSubmitting] = useState(false);

  async function handleRegisterSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !dob || !username.trim() || !email.trim() || !password.trim() || !retypePassword.trim()) {
      toast({ tone: "danger", title: "Missing fields", message: "Please fill all signup fields." });
      return;
    }
    if (username.trim().length < 3) {
      toast({ tone: "danger", title: "Invalid username", message: "Username must be at least 3 characters." });
      return;
    }
    if (password.length < 6) {
      toast({ tone: "danger", title: "Weak password", message: "Password must be at least 6 characters." });
      return;
    }
    if (password !== retypePassword) {
      toast({ tone: "danger", title: "Password mismatch", message: "Password and retype password must match." });
      return;
    }

    setSubmitting(true);
    const result = await requestEmailVerification(role, email, {
      mode: "register",
      displayName: `${firstName.trim()} ${lastName.trim()}`.trim()
    });
    setSubmitting(false);

    if (!result.ok) {
      toast({ tone: "danger", title: "Invalid email", message: result.error });
      return;
    }

    toast({
      tone: "default",
      title: "Verify your email",
      message: `Code sent to ${email.trim()}. Demo code: ${result.demoCode}. Verification request detected from IP: ${result.ipAddress}`
    });
    setStep("verify");
  }

  function handleRegisterVerified(result: { email: string }) {
    setAuthFlash({ type: "register_success", email: result.email });
    router.replace("/login");
  }

  function handleGoogleSignup() {
    loginWithGoogle(role);
    const clientId = getActiveGoogleClientId();
    if (!clientId) {
      toast({ tone: "danger", title: "Google setup required", message: "Add or paste a Google OAuth client ID first." });
      router.push("/auth/google?mode=signup");
      return;
    }
    toast({ tone: "default", title: "Google sign-up", message: "Redirecting to Google account chooser..." });
    window.location.assign(createGoogleAuthUrl(clientId, "signup"));
  }

  function handleMicrosoftSignup() {
    toast({
      tone: "default",
      title: "Microsoft signup",
      message: "Microsoft signup is not configured yet. Use email or Google signup."
    });
  }

  return (
    <div className="relative z-20 grid min-h-dvh place-items-center overflow-hidden px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-35 blur-[2px]"
        style={{
          background:
            "radial-gradient(900px 500px at 25% 20%, rgba(124,58,237,0.35), transparent 60%), radial-gradient(900px 500px at 70% 70%, rgba(245,158,11,0.14), transparent 60%), repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 16px)"
        }}
      />

      <div className="relative w-[min(480px,92vw)] rounded-3xl border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-5">
          <div className="font-display text-4xl tracking-widest">Register</div>
          <div className="mt-1 text-sm text-muted">
            {step === "verify" ? "Verify your email to finish registration" : "Create your FYP profile"}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="space-y-4"
              onSubmit={handleRegisterSubmit}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-xs font-semibold text-white/80">
                  First name
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50"
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </label>

                <label className="block text-xs font-semibold text-white/80">
                  Last name
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50"
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-xs font-semibold text-white/80">
                  Date of birth
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50"
                    autoComplete="bday"
                  />
                </label>

                <label className="block text-xs font-semibold text-white/80">
                  Username
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50"
                    placeholder="Username"
                    autoComplete="username"
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-white/80">
                Mail ID
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50"
                  placeholder="Mail ID"
                  autoComplete="email"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-xs font-semibold text-white/80">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50"
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                </label>

                <label className="block text-xs font-semibold text-white/80">
                  Retype password
                  <input
                    type="password"
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50"
                    placeholder="Retype password"
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-white/80">
                Role
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "reader" | "writer")}
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-primary/50"
                >
                  <option className="bg-black text-white" value="reader">
                    Reader
                  </option>
                  <option className="bg-black text-white" value="writer">
                    Writer
                  </option>
                </select>
              </label>

              <Button className="w-full" variant="primary" size="lg" type="submit" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account"}
              </Button>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Button className="w-full" variant="outline" size="lg" type="button" onClick={handleGoogleSignup}>
                    Sign up with Google
                  </Button>
                </div>

                <div>
                  <Button className="w-full" variant="outline" size="lg" type="button" onClick={handleMicrosoftSignup}>
                    Sign up with Microsoft
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/login" className="text-white underline decoration-white/30 hover:decoration-white">
                  Log in
                </Link>
              </div>
            </motion.form>
          ) : (
            <EmailVerificationStep
              key="verify"
              title="Verify to complete registration"
              verifyLabel="Verify & Finish"
              onVerified={handleRegisterVerified}
              onBack={() => {
                cancelPendingEmailAuth();
                setStep("form");
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
