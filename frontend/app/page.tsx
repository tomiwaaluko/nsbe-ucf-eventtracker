"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthFlow } from "@/components/AuthFlow";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <AuthFlow />
    </div>
  );
}
