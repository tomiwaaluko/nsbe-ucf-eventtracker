"use client";

import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setStats({
      totalMembers: 92,
      activeMembers: 78,
      totalEvents: 24,
      upcomingEvents: 6,
      totalAttendance: 856,
      averageAttendance: 36,
      membersWithOneOneOne: 45,
      membersWithThreeThreeThree: 28,
    });
  }, []);

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <DashboardLayout>
      <AdminDashboard stats={stats} onNavigate={handleNavigate} />
    </DashboardLayout>
  );
}
