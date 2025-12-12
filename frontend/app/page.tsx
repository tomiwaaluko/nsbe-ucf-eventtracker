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
