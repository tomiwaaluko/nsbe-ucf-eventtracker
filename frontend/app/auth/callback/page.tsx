"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");
      const linkRequired = searchParams.get("link_required");
      const email = searchParams.get("email");
      const provider = searchParams.get("provider");

      if (token) {
        // Success - store token and redirect
        try {
          localStorage.setItem("token", token);

          // Fetch user data to get role
          const userData = await api.getMe(token);
          const user = {
            email: userData.email,
            firstName: userData.firstName || "User",
            lastName: userData.lastName || "",
            role: userData.role || "member",
          };
          localStorage.setItem("user", JSON.stringify(user));

          // Redirect based on role
          if (user.role === "admin" || user.role === "super_admin") {
            router.push("/admin/dashboard");
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

