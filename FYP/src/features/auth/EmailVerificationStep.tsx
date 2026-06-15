"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useAuthStore, type VerifyEmailResult } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

const RESEND_COOLDOWN_SEC = 30;

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

type EmailVerificationStepProps = {
  onVerified: (result: Extract<VerifyEmailResult, { ok: true }>) => void;
  onBack: () => void;
  title?: string;
  verifyLabel?: string;
};

export function EmailVerificationStep({
  onVerified,
  onBack,
  title = "Verify your email",
  verifyLabel = "Verify"
}: EmailVerificationStepProps) {
  const toast = useToastStore((s) => s.push);
  const pending = useAuthStore((s) => s.pendingEmailAuth);
  const verifyEmailCode = useAuthStore((s) => s.verifyEmailCode);
  const resendVerificationCode = useAuthStore((s) => s.resendVerificationCode);

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const verifiedRef = useRef(false);

  const code = digits.join("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function submitCode() {
    if (verifiedRef.current || loading) return;
    if (code.length !== 6) {
      toast({ tone: "danger", title: "Incomplete code", message: "Enter all 6 digits of the verification code." });
      return;
    }

    setLoading(true);
    const result = await verifyEmailCode(code);
    setLoading(false);

    if (!result.ok) {
      const messages = {
        no_pending: "Start again to request a new verification code.",
        expired: "Your verification code expired. Resend a new one.",
        invalid: "That code is incorrect. Demo code is 123456.",
        ip_mismatch: "This code was requested from a different IP address. Start again to request a new code."
      };
      toast({
        tone: "danger",
        title: result.reason === "expired" ? "Code expired" : "Invalid code",
        message: messages[result.reason]
      });
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }

    verifiedRef.current = true;
    onVerified(result);
  }

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submitCode();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleResend() {
    if (cooldown > 0) return;
    const resend = await resendVerificationCode();
    if (!resend) {
      toast({ tone: "danger", title: "Cannot resend", message: "Start again to request a new code." });
      return;
    }
    setCooldown(RESEND_COOLDOWN_SEC);
    setDigits(["", "", "", "", "", ""]);
    toast({
      tone: "default",
      title: "Code resent",
      message: `A new code was sent to ${pending?.email ?? "your email"}. Demo code: ${resend.demoCode}. Verification request detected from IP: ${resend.ipAddress}`
    });
    inputRefs.current[0]?.focus();
  }

  if (!pending) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted">
        No pending verification. Go back and try again.
        <Button className="mt-4 w-full" variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    );
  }

  const actionLabel = pending.mode === "register" ? "Verify & Complete Registration" : "Verify & Login";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <div className="font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-muted">
            We sent a 6-digit code to{" "}
            <span className="inline-flex items-center gap-1 text-white">
              <Mail className="h-3.5 w-3.5" />
              {maskEmail(pending.email)}
            </span>
          </div>
          {pending.ipAddress ? (
            <div className="mt-1 text-xs text-muted">Verification request detected from IP: {pending.ipAddress}</div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs text-muted">Enter verification code</div>
        <div className="mt-3 flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-12 w-10 rounded-xl border border-white/15 bg-black/30 text-center text-lg font-semibold tracking-widest outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/25 sm:h-14 sm:w-12"
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              autoFocus={i === 0}
            />
          ))}
        </div>
        <div className="mt-3 text-center text-[11px] text-muted">
          Demo code: <span className="font-mono text-white">123456</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-muted"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Verifying…
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Button
        className="w-full"
        variant="primary"
        size="lg"
        onClick={submitCode}
        disabled={code.length !== 6 || loading}
      >
        {verifyLabel || actionLabel}
      </Button>

      <div className="flex flex-wrap gap-2">
        <Button className="flex-1" variant="outline" onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </Button>
        <Button className="flex-1" variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
    </motion.div>
  );
}
