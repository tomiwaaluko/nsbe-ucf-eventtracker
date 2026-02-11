"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckInRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/attendance");
  }, [router]);

  return null;
}
