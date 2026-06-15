"use client";

import { useRouter } from "next/navigation";
import { useAuthStore, type UserRole } from "@/store/authStore";
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

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-3xl tracking-widest">Access Denied</div>
          <div className="mt-2 text-sm text-muted">
            You need to be logged in to view this page.
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => router.push(redirectTo)}>
              Go to Login
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(role ?? "reader")) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="font-display text-3xl tracking-widest">Forbidden</div>
          <div className="mt-2 text-sm text-muted">
            You don&apos;t have the required permissions to access this page.
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
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
