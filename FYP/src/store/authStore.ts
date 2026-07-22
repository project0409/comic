import { create } from "zustand";

export type AuthProvider = "google" | "email";
export type UserRole = "reader" | "writer" | "admin";

export type PendingEmailAuth = {
  role: Exclude<UserRole, "admin">;
  email: string;
  verificationCode: string;
  ipAddress?: string;
  createdAt?: number;
  expiresAt: number;
  mode: "login" | "register";
  displayName?: string;
};

export type VerifyEmailResult =
  | { ok: true; mode: "login" | "register"; email: string; displayName?: string }
  | { ok: false; reason: "no_pending" | "expired" | "invalid" | "ip_mismatch" };

type AuthState = {
  isAuthenticated: boolean;
  provider?: AuthProvider;
  role?: UserRole;
  otpVerified: boolean;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  pendingEmailAuth?: PendingEmailAuth;

  requestEmailVerification: (
    role: Exclude<UserRole, "admin">,
    email: string,
    options?: { mode?: "login" | "register"; displayName?: string }
  ) => Promise<{ ok: true; demoCode: string; ipAddress: string } | { ok: false; error: string }>;
  verifyEmailCode: (code: string) => Promise<VerifyEmailResult>;
  resendVerificationCode: () => Promise<{ demoCode: string; ipAddress: string } | null>;
  cancelPendingEmailAuth: () => void;

  loginWithCredentials: (role: Exclude<UserRole, "admin">, email: string) => void;
  loginWithGoogle: (role?: Exclude<UserRole, "admin">) => void;
  completeGoogleAuth: (profile: { email?: string; name?: string; picture?: string }) => void;
  verifyOtp: (otp: string) => boolean;

  loginAsAdmin: (email: string) => void;
  updateProfile: (profile: { displayName?: string; email?: string }) => void;

  logout: () => void;
};

const DEMO_OTP = "123456";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCode(code: string) {
  return code.replace(/\D/g, "").trim();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  provider: undefined,
  role: undefined,
  otpVerified: false,
  email: undefined,
  displayName: undefined,
  photoUrl: undefined,
  pendingEmailAuth: undefined,

  requestEmailVerification: async (role, email, options = {}) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmedEmail)) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    let response: Response;
    let data: {
      ok?: boolean;
      error?: string;
      demoCode?: string;
      ipAddress?: string;
      createdAt?: number;
      expiresAt?: number;
    };
    try {
      response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          email: trimmedEmail,
          mode: options.mode ?? "login",
          displayName: options.displayName?.trim()
        })
      });
      data = await response.json();
    } catch {
      return { ok: false, error: "Unable to send verification code right now." };
    }

    if (!response.ok || !data.ok || !data.demoCode || !data.expiresAt) {
      return { ok: false, error: data.error ?? "Unable to send verification code." };
    }

    const pending: PendingEmailAuth = {
      role,
      email: trimmedEmail,
      verificationCode: data.demoCode,
      ipAddress: data.ipAddress ?? "unknown",
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      mode: options.mode ?? "login",
      displayName: options.displayName?.trim() || trimmedEmail.split("@")[0] || role
    };

    set({
      pendingEmailAuth: pending,
      isAuthenticated: false,
      otpVerified: false,
      provider: "email",
      role
    });

    return { ok: true, demoCode: data.demoCode, ipAddress: data.ipAddress ?? "unknown" };
  },

  verifyEmailCode: async (code) => {
    const pending = get().pendingEmailAuth;
    if (!pending) return { ok: false, reason: "no_pending" };

    let response: Response;
    let data: {
      ok?: boolean;
      reason?: "no_pending" | "expired" | "invalid" | "ip_mismatch";
      mode?: "login" | "register";
      email?: string;
      displayName?: string;
      role?: Exclude<UserRole, "admin">;
    };
    try {
      response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pending.email, otp: normalizeCode(code) })
      });
      data = await response.json();
    } catch {
      return { ok: false, reason: "invalid" };
    }

    if (!response.ok || !data.ok) {
      return { ok: false, reason: data.reason ?? "invalid" };
    }

    if (pending.mode === "register") {
      set({ pendingEmailAuth: undefined });
      return {
        ok: true,
        mode: "register",
        email: data.email ?? pending.email,
        displayName: data.displayName ?? pending.displayName
      };
    }

    set({
      isAuthenticated: true,
      provider: "email",
      role: data.role ?? pending.role,
      email: data.email ?? pending.email,
      displayName: data.displayName ?? pending.displayName ?? pending.email.split("@")[0] ?? pending.role,
      otpVerified: true,
      pendingEmailAuth: undefined
    });

    return {
      ok: true,
      mode: "login",
      email: data.email ?? pending.email,
      displayName: data.displayName ?? pending.displayName
    };
  },

  resendVerificationCode: async () => {
    const pending = get().pendingEmailAuth;
    if (!pending) return null;

    let response: Response;
    let data: {
      ok?: boolean;
      demoCode?: string;
      ipAddress?: string;
      createdAt?: number;
      expiresAt?: number;
    };
    try {
      response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pending.email, resend: true })
      });
      data = await response.json();
    } catch {
      return null;
    }

    if (!response.ok || !data.ok || !data.demoCode || !data.expiresAt) return null;

    const next: PendingEmailAuth = {
      ...pending,
      verificationCode: data.demoCode,
      ipAddress: data.ipAddress ?? "unknown",
      createdAt: data.createdAt,
      expiresAt: data.expiresAt
    };
    set({ pendingEmailAuth: next });
    return { demoCode: data.demoCode, ipAddress: data.ipAddress ?? "unknown" };
  },

  cancelPendingEmailAuth: () => set({ pendingEmailAuth: undefined }),

  loginWithCredentials: (role, email) =>
    set({
      isAuthenticated: true,
      provider: "email",
      role,
      email: email.trim().toLowerCase(),
      displayName: email.trim().split("@")[0] || `${role} user`,
      photoUrl: undefined,
      otpVerified: true,
      pendingEmailAuth: undefined
    }),

  loginWithGoogle: (role = "reader") =>
    set({
      provider: "google",
      role,
      otpVerified: false,
      pendingEmailAuth: undefined
    }),

  completeGoogleAuth: (profile) =>
    set((state) => ({
      isAuthenticated: true,
      provider: "google",
      role: state.role ?? "reader",
      email: profile.email,
      displayName: profile.name || profile.email?.split("@")[0] || state.displayName || `${state.role ?? "reader"} user`,
      photoUrl: profile.picture,
      otpVerified: true,
      pendingEmailAuth: undefined
    })),

  verifyOtp: (otp) => {
    const ok = normalizeCode(otp) === DEMO_OTP;
    if (!ok) return false;
    set((state) => ({
      isAuthenticated: true,
      otpVerified: true,
      displayName: state.displayName ?? `${state.role ?? "reader"} user`
    }));
    return true;
  },

  loginAsAdmin: (email) =>
    set({
      isAuthenticated: true,
      provider: "email",
      role: "admin",
      otpVerified: true,
      email,
      displayName: "Admin",
      photoUrl: undefined,
      pendingEmailAuth: undefined
    }),

  updateProfile: (profile) => set((state) => ({ ...state, ...profile })),

  logout: () =>
    set({
      isAuthenticated: false,
      otpVerified: false,
      provider: undefined,
      role: undefined,
      email: undefined,
      displayName: undefined,
      photoUrl: undefined,
      pendingEmailAuth: undefined
    })
}));
