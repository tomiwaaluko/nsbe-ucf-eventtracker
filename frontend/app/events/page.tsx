"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventsPage } from "@/components/EventsPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";

export default function Events() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const eventData = await api.getEvents(token, true);

      // For each event, fetch planning data
      const eventsWithPlanning = await Promise.all(
        eventData.map(async (event: any) => {
          try {
            const [planningCheck, planners] = await Promise.all([
              api.checkIfPlanning(token, event.id),
              api.getEventPlanners(token, event.id),
            ]);

            return {
              id: event.id,
              name: event.name,
              description: event.description || undefined,
              category: event.category,
              startTime: event.startTime,
              endTime: event.endTime,
              location: event.location || undefined,
              isActive: event.isActive ?? true,
              isPlanning: planningCheck.isPlanning,
              plannedCount: planners.totalPlanning || 0,
              friendsPlanning: planners.friendsPlanning || [],
            };
          } catch (error) {
            // If planning data fails, just return event without it
            console.error(`Failed to fetch planning data for event ${event.id}:`, error);
            return {
              id: event.id,
              name: event.name,
              description: event.description || undefined,
              category: event.category,
              startTime: event.startTime,
              endTime: event.endTime,
              location: event.location || undefined,
              isActive: event.isActive ?? true,
              isPlanning: false,
              plannedCount: 0,
            };
          }
        })
      );

      setEvents(eventsWithPlanning);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleCheckIn = (eventId: string) => {
    // Navigate to check-in page or show QR scanner
    router.push("/attendance");
  };

  const handleCreateEvent = () => {
    // Only admins can create events, but this shouldn't be called for regular users
    router.push("/admin/events");
  };

  const handleTogglePlan = async (eventId: string, currentlyPlanning: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (currentlyPlanning) {
        await api.unmarkPlanToAttend(token, eventId);
      } else {
        await api.markPlanToAttend(token, eventId);
      }

      // Refresh events to update planning status
      await fetchEvents();
    } catch (error: any) {
      console.error("Failed to update plan status:", error);
      alert(error.message || "Failed to update your plans");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading events...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <EventsPage
        events={events}
        onViewDetails={handleViewDetails}
        onCheckIn={handleCheckIn}
        onTogglePlan={handleTogglePlan}
        onCreateEvent={handleCreateEvent}
        userRole="member"
      />
    </DashboardLayout>
  );
}
