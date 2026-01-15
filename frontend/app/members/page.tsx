"use client";

import { useState, useEffect } from "react";
import { MemberManagement } from "@/components/MemberManagement";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "OFFICER" | "ADMIN";
  isActive: boolean;
  workshopsAttended: number;
  gbmAttended: number;
  communityServiceAttended: number;
  totalEvents: number;
  joinedDate: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    // TODO: Fetch real members data from API
    // For now, using empty array
    setMembers([]);
  }, []);

  const handleEditMember = (memberId: string, data: Partial<Member>) => {
    // TODO: Implement API call to update member
  };

  const handleViewMember = (memberId: string) => {
    // TODO: Navigate to member profile or show details
  };

  const handleToggleStatus = (memberId: string, isActive: boolean) => {
    // TODO: Implement API call to toggle member status
  };

  return (
    <DashboardLayout>
      <MemberManagement
        members={members}
        onEditMember={handleEditMember}
        onViewMember={handleViewMember}
        onToggleStatus={handleToggleStatus}
      />
    </DashboardLayout>
  );
}
