"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

/**
 * Route guard for every page under /admin.
 *
 * Previously each admin page only checked that a token existed in
 * localStorage, so any signed-in member could render the entire admin UI.
 * The backend rejected most of the writes, but the interface itself was
 * visible to everyone and a few read routes were genuinely unguarded.
 *
 * The role is fetched from the API rather than read from the cached `user`
 * object in localStorage, because that copy is fully under the user's control
 * -- editing it would otherwise be enough to render these pages. This is a UX
 * guard; the backend re-checks the role on every request and remains the
 * actual boundary.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "allowed" | "denied">(
    "checking"
  );

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const me = await api.getMe(token);
        if (cancelled) return;

        if (me?.role === "admin" || me?.role === "super_admin") {
          setState("allowed");
        } else {
          setState("denied");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Admin access check failed", error);
        setState("denied");
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          Your account does not have permission to view this page.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
