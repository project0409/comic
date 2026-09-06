"use client";

import { useEffect } from "react";
import { useRouter } from "@/compat/next-navigation";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Button } from "./Button";

export function RequireAuth({
  children,
  roles,
  redirectTo = "/login"
}: {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const toast = useToastStore((s) => s.push);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        tone: "danger",
        title: "Login Required",
        message: "Please log in or create an account to access this feature."
      });
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router, toast]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="sf-comic-panel rounded-3xl border border-white/10 bg-card p-8 shadow-2xl space-y-4">
          <div className="text-4xl select-none">🔒</div>
          <h2 className="font-display text-2xl font-bold tracking-wider text-white">Login Required</h2>
          <p className="text-sm text-muted">
            You must be logged in to access your saved stories, reading history, vault, and profile features.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="primary" onClick={() => router.push(redirectTo)}>
              Log In
            </Button>
            <Button variant="outline" onClick={() => router.push("/register")}>
              Create Account
            </Button>
            <Button variant="ghost" onClick={() => router.push("/discover")}>
              Browse Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(role ?? "reader")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="sf-comic-panel rounded-3xl border border-white/10 bg-card p-8 shadow-2xl space-y-4">
          <h2 className="font-display text-2xl font-bold tracking-wider text-white">Access Restricted</h2>
          <p className="text-sm text-muted">
            You do not have the required permissions to view this page.
          </p>
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
