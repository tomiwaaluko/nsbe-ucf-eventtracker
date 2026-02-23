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

      // Map events to simplified format (no planning data)
      const simplifiedEvents = eventData.map((event: any) => ({
        id: event.id,
        name: event.name,
        description: event.description || undefined,
        category: event.category,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || undefined,
        isActive: event.isActive ?? true,
      }));

      setEvents(simplifiedEvents);
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
        onCreateEvent={handleCreateEvent}
        userRole="member"
      />
    </DashboardLayout>
  );
}
