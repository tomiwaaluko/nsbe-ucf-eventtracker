"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { EventDetailPage } from "@/components/EventDetailPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"member" | "admin" | "super_admin">("member");

  useEffect(() => {
    const loadEvent = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user role first to determine if we should fetch attendance
        let role: "member" | "admin" | "super_admin" = "member";
        try {
          const userData = await api.getMe(token);
          role = userData.role;
          if (role === "admin" || role === "super_admin" || role === "member") {
            setUserRole(role);
          } else {
            setUserRole("member");
          }
        } catch (error) {
          // If getMe fails, try to get from localStorage
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            role = user.role;
            if (role === "admin" || role === "super_admin" || role === "member") {
              setUserRole(role);
            } else {
              setUserRole("member");
            }
          }
        }

        // Fetch event data
        const eventData = await api.getEvent(token, eventId);
        
        // If user is admin, fetch attendance data
        if (role === "admin" || role === "super_admin") {
          try {
            const attendanceData = await api.getEventAttendance(token, eventId);
            // Map attendance data to attendees format
            const attendees = attendanceData.map((record: any) => ({
              id: record.id,
              firstName: record.member?.firstName || null,
              lastName: record.member?.lastName || null,
              email: record.member?.email || "",
              checkedInAt: record.checkedInAt,
            }));
            eventData.attendees = attendees;
          } catch (error) {
            console.error("Failed to load attendance data:", error);
            // Don't fail the whole page if attendance fetch fails
            eventData.attendees = [];
          }
        } else {
          // Non-admins don't see attendees
          eventData.attendees = undefined;
        }
        
        setEvent(eventData);
      } catch (error: any) {
        console.error("Failed to load event:", error);
        toast.error("Failed to load event");
        router.push("/events");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId, router]);

  const handleBack = () => {
    router.push("/events");
  };

  const handleCheckIn = (eventId: string) => {
    router.push("/checkin");
  };

  const handleEdit = (eventId: string) => {
    router.push(`/events/${eventId}/edit`);
  };

  if (isLoading || !event) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <EventDetailPage
        event={event}
        onBack={handleBack}
        onCheckIn={handleCheckIn}
        onEdit={handleEdit}
        userRole={userRole}
      />
    </DashboardLayout>
  );
}
