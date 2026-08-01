export type AuthFlash =
  | { type: "login_success"; displayName?: string }
  | { type: "register_success"; email?: string };

const KEY = "fyp_auth_flash";

export function setAuthFlash(flash: AuthFlash) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(flash));
}

export function consumeAuthFlash(): AuthFlash | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as AuthFlash;
  } catch {
    return null;
  }
}
