"use client";

import { useState } from "react";
import { AttendancePage } from "@/components/AttendancePage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";

export default function Attendance() {
  const [upcomingEvents] = useState([]);

  const handleCheckIn = async (
    eventId: string,
    qrSecret: string
  ): Promise<{ success: boolean; message: string; event?: any }> => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return {
          success: false,
          message: "Please log in to check in to events.",
        };
      }

      const data = await api.checkIn(token, { eventId, token: qrSecret });

      // Backend returns attendance record with event included
      const result = {
        success: true,
        message: "Successfully checked in!",
        event: data.event,
      };
      return result;
    } catch (error: any) {
      const errorResult = {
        success: false,
        message: error.message || "Failed to check in. Please try again.",
      };
      return errorResult;
    }
  };

  return (
    <DashboardLayout>
      <AttendancePage
        upcomingEvents={upcomingEvents}
        onCheckIn={handleCheckIn}
      />
    </DashboardLayout>
  );
}
