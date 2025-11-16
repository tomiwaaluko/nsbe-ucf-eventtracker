"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "@/components/Settings";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function SettingsPage() {
  const router = useRouter();
  const [memberData, setMemberData] = useState({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    major: "",
    graduationYear: undefined,
    profilePhoto: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setMemberData((prev) => ({
        ...prev,
        id: user.id || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      }));
    }
  }, []);

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <DashboardLayout>
      <Settings memberData={memberData} onBack={handleBack} />
    </DashboardLayout>
  );
}
