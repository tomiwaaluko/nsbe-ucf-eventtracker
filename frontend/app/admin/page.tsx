"use client";

import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminDashboard />
    </DashboardLayout>
  );
}
