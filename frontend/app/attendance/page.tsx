"use client";

import { useState } from "react";
import { AttendancePage } from "@/components/AttendancePage";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Attendance() {
  const [upcomingEvents] = useState([]);

  const handleCheckIn = (eventId: string) => {
    console.log("Check in to event:", eventId);
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
