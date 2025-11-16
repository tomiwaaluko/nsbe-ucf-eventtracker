"use client";

import { MemberManagement } from "@/components/MemberManagement";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function MembersPage() {
  return (
    <DashboardLayout>
      <MemberManagement />
    </DashboardLayout>
  );
}
