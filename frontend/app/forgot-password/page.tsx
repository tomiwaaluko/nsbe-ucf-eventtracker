"use client";

import { useRouter } from "next/navigation";
import { ForgotPassword } from "@/components/ForgotPassword";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleNavigate = (page: "login") => {
    router.push("/");
  };

  return <ForgotPassword onNavigate={handleNavigate} />;
}
