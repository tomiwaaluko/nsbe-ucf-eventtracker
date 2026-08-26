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
      
      // Map backend data to frontend interface
      const mappedMembers = memberData.map((member: any) => {
        // Combine firstName and lastName into name
        const name = [member.firstName, member.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown Member";
        
        // Map role: member -> MEMBER, admin -> OFFICER, super_admin -> ADMIN
        let role: "MEMBER" | "OFFICER" | "ADMIN" = "MEMBER";
        if (member.role === "admin") {
          role = "OFFICER";
        } else if (member.role === "super_admin") {
          role = "ADMIN";
        }
        
        return {
          id: member.id,
          name: name,
          email: member.email,
          role: role,
          isActive: member.isActive ?? true,
          chapterMembershipActive: member.chapterMembershipActive ?? false,
          workshopsAttended: member.workshopsAttended ?? 0,
          gbmAttended: member.gbmAttended ?? 0,
          communityServiceAttended: member.communityServiceAttended ?? 0,
          totalEvents: member.totalEvents ?? 0,
          joinedDate: member.createdAt || new Date().toISOString(),
          chapterDuesSelfReported: member.chapterDuesSelfReported ?? false,
          nationalDuesSelfReported: member.nationalDuesSelfReported ?? false,
        };
      });
      
      setMembers(mappedMembers);
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

      // Map frontend role to backend role if needed
      if (data.role) {
        // Map: MEMBER -> member, OFFICER -> admin, ADMIN -> super_admin
        let backendRole = "member";
        if (data.role === "OFFICER") {
          backendRole = "admin";
        } else if (data.role === "ADMIN") {
          backendRole = "super_admin";
        } else if (data.role === "MEMBER") {
          backendRole = "member";
        } else {
          // If it's already in backend format, use it as-is
          backendRole = data.role;
        }
        
        await api.updateMemberRole(token, memberId, backendRole);
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

      await api.updateMemberStatus(token, memberId, isActive);
      toast.success(`Member ${isActive ? "activated" : "deactivated"} successfully`);
      fetchMembers(); // Refresh the member list
    } catch (error) {
      console.error("Failed to toggle member status:", error);
      toast.error("Failed to update member status");
    }
  };

  const handleUpdateDues = async (
    memberId: string,
    data: {
      chapterDuesSelfReported?: boolean;
      nationalDuesSelfReported?: boolean;
    }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.updateMemberDues(token, memberId, data);
      toast.success("Self-reported dues updated");
      fetchMembers();
    } catch (error) {
      console.error("Failed to update member dues:", error);
      toast.error("Failed to update self-reported dues");
    }
  };

  const handleToggleMembership = async (
    memberId: string,
    chapterMembershipActive: boolean,
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.updateMemberMembership(token, memberId, chapterMembershipActive);
      toast.success(
        `Chapter membership marked ${chapterMembershipActive ? "paid" : "unpaid"}`,
      );
      fetchMembers();
    } catch (error) {
      console.error("Failed to toggle chapter membership:", error);
      toast.error("Failed to update chapter membership");
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
        onUpdateDues={handleUpdateDues}
        onToggleMembership={handleToggleMembership}
      />
    </DashboardLayout>
  );
}
