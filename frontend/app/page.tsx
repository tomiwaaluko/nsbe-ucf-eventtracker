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
      setErrorMessage(
        `Account linking required. Please sign in with your email/password account (${email || "your account"}) to link your ${provider} account.`
      );
      setShowError(true);
      toast.info("Account Linking Required", {
        description: `Please sign in with your existing account to link ${provider}.`,
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
