"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/compat/next-navigation";
import { QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import {
  createGoogleAuthUrl,
  getStoredGoogleClientId,
  loadGoogleIdentityScript,
  readGoogleRedirectCredential,
  setStoredGoogleClientId
} from "@/lib/googleIdentity";
import { setAuthFlash } from "@/lib/authFlash";

export default function GoogleAuthPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.push);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const completeGoogleAuth = useAuthStore((s) => s.completeGoogleAuth);
  const role = useAuthStore((s) => s.role);

  const [step, setStep] = useState<"google" | "otp">("google");
  const [otp, setOtp] = useState("");
  const [clientId, setClientId] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const buttonRef = useRef<HTMLDivElement | null>(null);

  // This otpauth link will open *any* authenticator app that supports TOTP (including Google Authenticator).
  // For a real app, this secret must come from your backend during enrollment.
  const otpSecret = "JBSWY3DPEHPK3PXP";
  const otpAuthUri = useMemo(() => {
    const label = encodeURIComponent("FYP:demo");
    const issuer = encodeURIComponent("FYP");
    return `otpauth://totp/${label}?secret=${otpSecret}&issuer=${issuer}`;
  }, [otpSecret]);

  useEffect(() => {
    // Prefer env var, fallback to localStorage for quick testing without .env
    const envId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();
    const stored = getStoredGoogleClientId().trim();
    setClientId(envId || stored);
    const params = new URLSearchParams(window.location.search);
    setMode(params.get("mode") === "signup" ? "signup" : "login");
  }, []);

  useEffect(() => {
    const result = readGoogleRedirectCredential();
    if (!result?.credential) return;

    const profile = decodeGoogleCredential(result.credential);
    completeGoogleAuth(profile);
    setAuthFlash({
      type: "login_success",
      displayName: profile.name || profile.email
    });
    toast({
      tone: "success",
      title: result.mode === "signup" ? "Google sign-up complete" : "Google login complete",
      message: profile.email ? `Connected ${profile.email}.` : "Google account connected."
    });
    window.history.replaceState(null, "", "/auth/google");
    router.replace("/");
  }, [completeGoogleAuth, router, toast]);

  useEffect(() => {
    loadGoogleIdentityScript()
      .then(() => setScriptReady(true))
      .catch(() => setScriptReady(false));
  }, []);

  useEffect(() => {
    if (!scriptReady) return;
    if (!clientId) return;
    if (!buttonRef.current) return;
    if (!window.google?.accounts?.id) {
      setGsiReady(false);
      return;
    }
    setGsiReady(true);

    // Initialize and render the real Google button.
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => {
        if (resp.credential) {
          const profile = decodeGoogleCredential(resp.credential);
          completeGoogleAuth(profile);
          toast({
            tone: "success",
            title: "Google connected",
            message: profile.email ? `Signed in as ${profile.email}.` : "Signed in with Google."
          });
          setAuthFlash({ type: "login_success", displayName: profile.name || profile.email });
          router.replace("/");
        } else {
          toast({ tone: "danger", title: "Google sign-in failed", message: "No credential returned." });
        }
      }
    });

    // Render only once
    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 360
    });
  }, [clientId, completeGoogleAuth, router, scriptReady, toast]);

  async function openAuthenticator() {
    toast({ tone: "default", title: "Authenticator", message: "Opening Authenticator (if installed)..." });
    window.location.href = otpAuthUri;
  }

  function submitOtp() {
    const ok = verifyOtp(otp);
    if (!ok) {
      toast({ tone: "danger", title: "Invalid OTP", message: "Use demo OTP: 123456" });
      return;
    }
    setAuthFlash({ type: "login_success" });
    router.replace("/");
  }

  return (
    <div className="relative z-20 mx-auto max-w-xl space-y-6 px-4 py-10">
      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-3xl tracking-widest">Google Authentication</div>
            <div className="mt-1 text-sm text-muted">
              Login as <span className="text-white">{role ?? "reader"}</span> · Frontend-only flow (no backend).
            </div>
          </div>
          <Badge tone="primary">2-Step</Badge>
        </div>

        {step === "google" ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              Step 1: Sign in with Google. After that, continue to OTP verification.
              <div className="mt-2 text-xs text-muted">
                Using Google Identity Services on frontend. (You provided: client_id only)
              </div>
            </div>

            <label className="block text-xs text-muted">
              Google client_id
              <input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none"
                placeholder="xxxxxx.apps.googleusercontent.com"
              />
            </label>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/20 p-4">
              <div ref={buttonRef} />
              {!scriptReady ? (
                <div className="mt-2 text-xs text-muted">Loading Google sign-in…</div>
              ) : !clientId ? (
                <div className="mt-2 text-xs text-muted">Paste client_id to enable Google sign-in.</div>
              ) : !gsiReady ? (
                <div className="mt-2 text-xs text-danger">
                  Google script loaded, but GSI not ready. Check HTTPS + Authorized JavaScript origins.
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-muted">
              <div className="font-semibold text-white/85">Fix common Google auth issues</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Site must run on <span className="text-white">https</span> (or <span className="text-white">localhost</span>).
                </li>
                <li>
                  In Google Cloud Console → OAuth Client → add this origin to{" "}
                  <span className="text-white">Authorized JavaScript origins</span>.
                </li>
                <li>
                  Current origin:{" "}
                  <span className="text-white">{typeof window !== "undefined" ? window.location.origin : ""}</span>
                </li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const origin = window.location.origin;
                    await navigator.clipboard.writeText(origin);
                    toast({ tone: "default", title: "Copied", message: "Origin copied. Paste into Google Console." });
                  }}
                >
                  Copy Origin
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank", "noopener,noreferrer")}
                >
                  Open Google Credentials
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStoredGoogleClientId(clientId.trim());
                  toast({ tone: "default", title: "Saved", message: "Saved client_id for this browser (localStorage)." });
                }}
                disabled={!clientId.trim()}
              >
                Save client_id
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  if (!clientId.trim()) {
                    toast({ tone: "danger", title: "Google setup required", message: "Paste your Google OAuth client ID first." });
                    return;
                  }
                  setStoredGoogleClientId(clientId.trim());
                  window.location.assign(createGoogleAuthUrl(clientId.trim(), mode));
                }}
              >
                Continue with Google
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  window.open("https://accounts.google.com/signin", "_blank", "noopener,noreferrer");
                  toast({ tone: "default", title: "Google Sign-in", message: "Opened Google sign-in in a new tab." });
                }}
              >
                Open Google (fallback)
              </Button>
            </div>

            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() => {
                toast({ tone: "default", title: "Authenticator", message: "Go to Step 2: scan QR + enter OTP." });
                setStep("otp");
              }}
            >
              Go to Authenticator (Step 2)
            </Button>
            <Button className="w-full" variant="ghost" onClick={() => router.push("/login")}>
              Back to Login
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div className="text-sm text-white/80">
                Step 2: Scan this QR in your Authenticator app, then enter the OTP here.
                <div className="mt-2 text-xs text-muted">
                  Demo setup: scan QR (looks like a real QR), or click “Open Authenticator” to deep-link via{" "}
                  <code className="rounded bg-black/30 px-1">otpauth://</code>. OTP accepted in this prototype is{" "}
                  <span className="text-white">123456</span>.
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <QrCode className="h-4 w-4" />
                  Authenticator QR
                </div>
                <div className="mt-3 grid place-items-center rounded-2xl bg-white p-3">
                  <FakeQr value={otpAuthUri} />
                </div>
                <div className="mt-2 text-[11px] text-muted">
                  Scan using Google Authenticator / Microsoft Authenticator / any TOTP app.
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="outline" onClick={openAuthenticator}>
                    Open Authenticator
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(otpSecret);
                      toast({ tone: "default", title: "Copied", message: "OTP secret copied (demo)." });
                    }}
                  >
                    Copy Secret
                  </Button>
                </div>

                <label className="block text-xs text-muted">
                  Enter OTP
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-lg tracking-[0.35em] outline-none"
                    inputMode="numeric"
                    placeholder="••••••"
                  />
                </label>

                <Button className="w-full" variant="primary" size="lg" onClick={submitOtp} disabled={otp.length !== 6}>
                  Verify OTP
                </Button>
              </div>
            </div>

            <Button className="w-full" variant="ghost" onClick={() => setStep("google")}>
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function hashToSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function decodeGoogleCredential(credential: string) {
  try {
    const payload = credential.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const data = JSON.parse(json) as { email?: string; name?: string; picture?: string };
    return {
      email: data.email,
      name: data.name,
      picture: data.picture
    };
  } catch {
    return {};
  }
}

// QR-looking placeholder (deterministic) so the UI can show "Authenticator QR"
// without bringing in a full QR encoder dependency (backend will provide a real QR later).
function FakeQr({ value }: { value: string }) {
  const size = 25; // grid size
  const seed = useMemo(() => hashToSeed(value), [value]);
  const cell = 6;
  const pad = 10;
  const px = pad * 2 + size * cell;

  const isFinder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    const inTopLeft = inBox(0, 0);
    const inTopRight = inBox(size - 7, 0);
    const inBottomLeft = inBox(0, size - 7);
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const finderFill = (x: number, y: number, ox: number, oy: number) => {
    const dx = x - ox;
    const dy = y - oy;
    const outer = dx === 0 || dy === 0 || dx === 6 || dy === 6;
    const inner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
    return outer || inner;
  };

  // cheap PRNG (LCG)
  let state = seed || 1;
  const rand = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const squares: Array<{ x: number; y: number; on: boolean }> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let on = rand() > 0.5;
      // Reserve finder patterns
      if (x < 7 && y < 7) on = finderFill(x, y, 0, 0);
      if (x >= size - 7 && y < 7) on = finderFill(x, y, size - 7, 0);
      if (x < 7 && y >= size - 7) on = finderFill(x, y, 0, size - 7);
      // Quiet-ish area around finders
      if (isFinder(x, y)) on = on;
      squares.push({ x, y, on });
    }
  }

  return (
    <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-label="Authenticator QR">
      <rect x="0" y="0" width={px} height={px} rx="14" fill="#ffffff" />
      {squares
        .filter((s) => s.on)
        .map((s) => (
          <rect
            key={`${s.x}-${s.y}`}
            x={pad + s.x * cell}
            y={pad + s.y * cell}
            width={cell}
            height={cell}
            fill="#0B0B0B"
          />
        ))}
    </svg>
  );
}
