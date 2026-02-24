"use client";

import { useRouter } from "next/navigation";
import { ResetPassword } from "@/components/ResetPassword";

export default function ResetPasswordPage() {
  const router = useRouter();

  const handleNavigate = (page: "login") => {
    router.push("/");
  };

  return <ResetPassword onNavigate={handleNavigate} />;
}
