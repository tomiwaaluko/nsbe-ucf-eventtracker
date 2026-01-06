"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFlow } from "@/components/AuthFlow";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
      return;
    }

    // Check for OAuth errors or account linking requirements
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
    } else if (linkRequired) {
      setErrorMessage(
        `Account linking required. Please sign in with your email/password account (${email || "your account"}) to link your ${provider} account.`
      );
      setShowError(true);
      toast.info("Account Linking Required", {
        description: `Please sign in with your existing account to link ${provider}.`,
      });
    }
  }, [router, searchParams]);

  const handleAuthComplete = (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    // Store user data and redirect to dashboard
    console.log("Storing user data in localStorage:", userData);
    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthFlow onAuthComplete={handleAuthComplete} />
    </div>
  );
}
