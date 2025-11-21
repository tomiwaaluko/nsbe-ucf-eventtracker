"use client";

import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    membersWithOneOneOne: 0,
    membersWithThreeThreeThree: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const adminStats = await api.getAdminStats(token);
        setStats(adminStats);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        // Fallback to mock data if API fails
        setStats({
          totalMembers: 0,
          activeMembers: 0,
          totalEvents: 0,
          upcomingEvents: 0,
          totalAttendance: 0,
          averageAttendance: 0,
          membersWithOneOneOne: 0,
          membersWithThreeThreeThree: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleNavigate = (page: string) => {
    // For admin sub-pages with admin- prefix
    if (page.startsWith("admin-")) {
      const adminPage = page.replace("admin-", "");
      router.push(`/admin/${adminPage}`);
    } else if (["events", "members", "checkin", "attendance"].includes(page)) {
      // Legacy support for non-prefixed admin routes
      router.push(`/admin/${page}`);
    } else {
      router.push(`/${page}`);
    }
  };

  return (
    <DashboardLayout>
      <AdminDashboard stats={stats} onNavigate={handleNavigate} />
    </DashboardLayout>
  );
}
