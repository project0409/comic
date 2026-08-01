export async function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.google?.accounts?.id) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.dataset.googleIdentity = "true";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(s);
  });
}

export function getStoredGoogleClientId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("fyp_google_client_id") ?? "";
}

export function setStoredGoogleClientId(clientId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fyp_google_client_id", clientId);
}

export function getActiveGoogleClientId() {
  const envId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();
  return envId || getStoredGoogleClientId().trim();
}

export function createGoogleAuthUrl(clientId: string, mode: "login" | "signup" = "login") {
  if (typeof window === "undefined") return "";
  const nonce = crypto.randomUUID();
  sessionStorage.setItem("fyp_google_nonce", nonce);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/google`,
    response_type: "id_token",
    scope: "openid email profile",
    prompt: "select_account",
    nonce,
    state: mode
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function readGoogleRedirectCredential() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const idToken = params.get("id_token");
  const state = params.get("state");
  if (!idToken) return null;
  return {
    credential: idToken,
    mode: state === "signup" ? "signup" : "login"
  } as const;
}
