"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }
    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // ignore (offline dev / unsupported)
      }
    };
    register();
  }, []);
  return null;
}
