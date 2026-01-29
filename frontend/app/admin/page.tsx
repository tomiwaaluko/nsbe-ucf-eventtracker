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
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        // Fetch all data needed for graphs
        const [adminStats, allAttendance, allEvents, allMembers] = await Promise.all([
          api.getAdminStats(token),
          api.getAllAttendance(token),
          api.getEvents(token),
          api.getAllMembers(token),
        ]);

        setStats(adminStats);
        setAttendanceRecords(Array.isArray(allAttendance) ? allAttendance : []);
        setEvents(Array.isArray(allEvents) ? allEvents : []);
        setMembers(Array.isArray(allMembers) ? allMembers : []);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        // Fallback to empty data if API fails
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
        setAttendanceRecords([]);
        setEvents([]);
        setMembers([]);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AdminDashboard
        stats={stats}
        attendanceRecords={attendanceRecords}
        events={events}
        members={members}
        onNavigate={handleNavigate}
      />
    </DashboardLayout>
  );
}
