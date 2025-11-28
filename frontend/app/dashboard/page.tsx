"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [memberData, setMemberData] = useState({
    name: "Guest User",
    email: "",
    role: "member",
    totalEvents: 0,
    workshopsAttended: 0,
    gbmAttended: 0,
    communityServiceAttended: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    if (userStr) {
      const user = JSON.parse(userStr);
      setMemberData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }));
    }

    // Fetch attendance records
    const fetchData = async () => {
      try {
        const records = await api.getMyAttendance(token);
        setAttendanceRecords(Array.isArray(records) ? records : []);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendanceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Dashboard
        memberData={memberData}
        attendanceRecords={attendanceRecords}
        upcomingEvents={upcomingEvents}
        onViewEvent={handleViewEvent}
        onNavigate={handleNavigate}
      />
    </DashboardLayout>
  );
}
