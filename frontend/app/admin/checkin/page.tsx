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

        // Map backend member data to frontend format
        const mappedMembers = memberData.map((member: any) => {
          const name = [member.firstName, member.lastName]
            .filter(Boolean)
            .join(" ") || "Unknown Member";
          
          return {
            id: member.id,
            name: name,
            email: member.email,
            hasAttended: false, // This would need to be checked against attendance records
          };
        });

        // Map backend event data to frontend format
        // Filter to only show active events (or events that haven't ended yet)
        const now = new Date();
        const mappedEvents = eventData
          .filter((event: any) => {
            // Only show active events or events that haven't ended
            if (event.isActive === false) return false;
            const endTime = new Date(event.endTime);
            // Optionally filter out past events (uncomment if needed):
            // return endTime >= now;
            return true; // Show all active events for now
          })
          .map((event: any) => {
            // Map category to eventType
            let eventType: "WORKSHOP" | "GBM" | "COMMUNITY_SERVICE" = "WORKSHOP";
            if (event.category === "GBM") {
              eventType = "GBM";
            } else if (event.category === "COMMUNITY_SERVICE") {
              eventType = "COMMUNITY_SERVICE";
            } else if (event.category === "WORKSHOP" || event.category === "SOCIAL") {
              eventType = "WORKSHOP";
            }
            
            return {
              id: event.id,
              name: event.name,
              eventType: eventType,
              date: event.startTime, // Use startTime as the date
              location: event.location || "TBD",
            };
          });

        setMembers(mappedMembers);
        setEvents(mappedEvents);
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
