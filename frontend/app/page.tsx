"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFlow } from "@/components/AuthFlow";
import { toast } from "sonner";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Check for OAuth errors or account linking requirements (always run first)
    const error = searchParams.get("error");
    const linkRequired = searchParams.get("link_required");
    const email = searchParams.get("email");
    const provider = searchParams.get("provider");

    if (error) {
      setErrorMessage(error);
      setShowError(true);
      toast.error("Authentication Error", {
        description: error,
      });
      return;
    }
    if (linkRequired) {
      // The backend sends this when the OAuth provider reported an email it
      // has not verified. Auto-linking on an unverified address would let
      // anyone claim someone else's account, so we refuse.
      //
      // The message names the actual fix. It used to say "sign in with your
      // email/password account to link", which is not something the user can
      // do -- there is no link UI wired up, and the OAuth code has already
      // been consumed by the callback, so it could not be replayed anyway.
      const providerName = provider
        ? provider.charAt(0).toUpperCase() + provider.slice(1)
        : "your provider";
      setErrorMessage(
        `Your ${providerName} account's email address (${email || "unknown"}) is not verified. Verify it in your ${providerName} account settings, then try signing in again.`
      );
      setShowError(true);
      toast.error("Email not verified", {
        description: `${providerName} has not verified this email address.`,
      });
      return;
    }

    if (!token) return;

    // Validate token before redirecting - stale/expired tokens can linger in localStorage
    const validateAndRedirect = async () => {
      try {
        const { api } = await import("@/lib/api");
        await api.getMe(token);
        router.push("/dashboard");
      } catch {
        // Token invalid or expired - clear and show login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };
    validateAndRedirect();
  }, [router, searchParams]);

  const handleAuthComplete = (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    // Store user data and redirect to dashboard
    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthFlow onAuthComplete={handleAuthComplete} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}
