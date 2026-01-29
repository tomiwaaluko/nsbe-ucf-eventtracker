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
        const eventData = await api.getEvent(token, eventId);
        setEvent(eventData);

        // Get user role for edit button visibility
        try {
          const userData = await api.getMe(token);
          const role = userData.role;
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
            const role = user.role;
            if (role === "admin" || role === "super_admin" || role === "member") {
              setUserRole(role);
            } else {
              setUserRole("member");
            }
          }
        }
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
