"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "@/components/Settings";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";

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
    hasPassword: true,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
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
    if (token) {
      api.getMe(token).then((data) => {
        setMemberData((prev) => ({
          ...prev,
          id: data.id ?? prev.id,
          email: data.email ?? prev.email,
          firstName: data.firstName ?? prev.firstName,
          lastName: data.lastName ?? prev.lastName,
          major: data.major ?? prev.major,
          graduationYear: data.graduationYear ?? prev.graduationYear,
          profilePhoto: data.photoUrl ?? prev.profilePhoto,
          hasPassword: data.hasPassword ?? true,
        }));
      }).catch(() => {});
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
