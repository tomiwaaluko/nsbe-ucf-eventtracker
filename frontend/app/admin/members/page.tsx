"use client";

import { MemberManagement } from "@/components/MemberManagement";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function MemberManagementPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const memberData = await api.getAllMembers(token);
      setMembers(memberData);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Failed to load members");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = async (memberId: string, data: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (data.role) {
        await api.updateMemberRole(token, memberId, data.role);
        toast.success("Member role updated successfully");
        fetchMembers();
      }
    } catch (error) {
      console.error("Failed to edit member:", error);
      toast.error("Failed to update member");
    }
  };

  const handleViewMember = (memberId: string) => {
    router.push(`/members/${memberId}`);
  };

  const handleToggleStatus = async (memberId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Note: This would need a corresponding API endpoint
      // For now, just show a message
      toast.info("Member status toggle not yet implemented in API");
    } catch (error) {
      console.error("Failed to toggle member status:", error);
      toast.error("Failed to update member status");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading members...</p>
        </div>
      </DashboardLayout>
    );
  }

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
