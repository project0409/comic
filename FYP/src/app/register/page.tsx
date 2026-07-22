"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/Button";
import { setAuthFlash } from "@/lib/authFlash";
import { createGoogleAuthUrl, getActiveGoogleClientId } from "@/lib/googleIdentity";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [role, setRole] = useState<"reader" | "writer">("reader");
  const [submitting, setSubmitting] = useState(false);

  function handleRegisterSubmit(e?: React.FormEvent) {
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
    setAuthFlash({ type: "register_success", email: email.trim().toLowerCase() });
    setSubmitting(false);

    toast({
      tone: "success",
      title: "Account created",
      message: `${role === "reader" ? "Reader" : "Writer"} account created. Please log in.`
    });
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
            "radial-gradient(900px 500px at 25% 20%, rgba(255,51,102,0.24), transparent 60%), radial-gradient(900px 500px at 70% 70%, rgba(0,229,255,0.1), transparent 60%), radial-gradient(700px 420px at 78% 18%, rgba(255,193,7,0.08), transparent 62%), repeating-linear-gradient(135deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 16px)"
        }}
      />

      <div className="relative w-[min(480px,92vw)] rounded-3xl border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-5">
          <div className="font-display text-4xl tracking-widest">Register</div>
          <div className="mt-1 text-sm text-muted">Create your FYP profile</div>
        </div>

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
      </div>
    </div>
  );
}
