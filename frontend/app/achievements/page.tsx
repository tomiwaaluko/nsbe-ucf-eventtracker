"use client";

import { useState, useEffect } from "react";
import { AchievementsPage } from "@/components/AchievementsPage";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Achievements() {
  const [memberData, setMemberData] = useState({
    workshopsAttended: 0,
    gbmAttended: 0,
    communityServiceAttended: 0,
    totalEvents: 0,
    attendanceHistory: [],
  });

  useEffect(() => {
    // TODO: Fetch real member data from API
  }, []);

  return (
    <DashboardLayout>
      <AchievementsPage memberData={memberData} />
    </DashboardLayout>
  );
}
