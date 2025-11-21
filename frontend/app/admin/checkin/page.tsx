"use client";

import { ManualCheckIn } from "@/components/ManualCheckIn";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ManualCheckInPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const [memberData, eventData] = await Promise.all([
          api.getAllMembers(token),
          api.getEvents(token),
        ]);

        setMembers(memberData);
        setEvents(eventData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data");
        setMembers([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCheckIn = async (
    memberId: string,
    eventId: string,
    officerName: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      const result = await api.manualCheckIn(token, { eventId, memberId });

      if (result.success || result.id) {
        return { success: true, message: "Check-in successful" };
      } else {
        return { success: false, message: result.message || "Check-in failed" };
      }
    } catch (error: any) {
      console.error("Manual check-in failed:", error);
      return {
        success: false,
        message: error.message || "Check-in failed. Please try again.",
      };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ManualCheckIn
        members={members}
        events={events}
        onCheckIn={handleCheckIn}
      />
    </DashboardLayout>
  );
}
