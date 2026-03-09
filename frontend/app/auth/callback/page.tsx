"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Check for password recovery in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");

      if (type === "recovery") {
        // Password reset flow - redirect to reset-password page with hash intact
        router.push(`/reset-password${window.location.hash}`);
        return;
      }

      const token = searchParams.get("token");
      const isNew = searchParams.get("is_new") === "true";
      const error = searchParams.get("error");
      const linkRequired = searchParams.get("link_required");
      const email = searchParams.get("email");
      const provider = searchParams.get("provider");
      const accountLinked = searchParams.get("account_linked");

      // Read and clear oauth_mode
      const oauthMode = localStorage.getItem("oauth_mode");
      localStorage.removeItem("oauth_mode");

      if (token) {
        // Login mode should reject new users
        if (oauthMode === "login" && isNew) {
          // Don't store the token — reject this login attempt
          router.push("/?error=" + encodeURIComponent("No account found. Please sign up first."));
          return;
        }

        // Success - store token and redirect
        try {
          localStorage.setItem("token", token);

          // Store account linking flag temporarily for dashboard notification
          if (accountLinked === "true" && provider) {
            localStorage.setItem(
              "account_linked",
              JSON.stringify({
                provider,
                timestamp: Date.now(),
              })
            );
          }

          // Fetch user data to get role
          const userData = await api.getMe(token);
          const user = {
            email: userData.email,
            firstName: userData.firstName || "User",
            lastName: userData.lastName || "",
            role: userData.role || "member",
          };
          localStorage.setItem("user", JSON.stringify(user));

          // Redirect based on whether this is a new account and role
          if (isNew) {
            router.push("/onboarding");
          } else if (user.role === "admin" || user.role === "super_admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          router.push("/?error=Failed to fetch user data");
        }
      } else if (linkRequired) {
        // Account linking required
        router.push(`/?link_required=true&email=${email || ""}&provider=${provider || ""}`);
      } else if (error) {
        // Error occurred
        router.push(`/?error=${encodeURIComponent(error)}`);
      } else {
        // No parameters - redirect to home
        router.push("/");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#00a651] mx-auto" />
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#00a651] mx-auto" />
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

