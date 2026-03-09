"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Onboarding } from "@/components/Onboarding";

interface StoredUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Member");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/");
      return;
    }

    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (storedUser) {
      try {
        const parsed: StoredUser = JSON.parse(storedUser);
        setUserName(parsed.firstName || "Member");
      } catch {
        setUserName("Member");
      }
    }
  }, [router]);

  const handleOnboardingComplete = () => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (storedUser) {
      try {
        const parsed: StoredUser = JSON.parse(storedUser);
        const role = parsed.role || "member";

        if (role === "admin" || role === "super_admin") {
          router.push("/admin");
          return;
        }
      } catch {
        // fall through to member dashboard
      }
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Onboarding onComplete={handleOnboardingComplete} userName={userName} />
    </div>
  );
}

