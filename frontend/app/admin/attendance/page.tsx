"use client";

import { AttendanceLogs } from "@/components/AttendanceLogs";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  eventId: string;
  eventName: string;
  eventType: "WORKSHOP" | "GBM" | "COMMUNITY_SERVICE";
  checkInTime: string;
  checkInMethod: "QR_CODE" | "MANUAL";
  checkedInBy?: string;
}

export default function AttendanceLogsPage() {
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const records = await api.getAllAttendance(token);
        // Ensure we always set an array
        setAttendanceRecords(Array.isArray(records) ? records : []);
      } catch (error) {
        console.error("Failed to fetch attendance records:", error);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading attendance records...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AttendanceLogs attendanceRecords={attendanceRecords} />
    </DashboardLayout>
  );
}
