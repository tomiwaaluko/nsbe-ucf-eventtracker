"use client";

import { useState } from "react";
import { AttendancePage } from "@/components/AttendancePage";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Attendance() {
  const [upcomingEvents] = useState([]);

  const handleCheckIn = (eventId: string) => {
    // TODO: Implement check-in functionality
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
