"use client";

import { EventManagement } from "@/components/EventManagement";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function EventManagementPage() {
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

      const eventData = await api.getEvents(token);
      setEvents(eventData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    router.push("/events/create");
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.deleteEvent(token, eventId);
      toast.success("Event deleted successfully");
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleViewQRCode = (eventId: string) => {
    router.push(`/admin/events/${eventId}/qr`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading events...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <EventManagement
        events={events}
        onCreateEvent={handleCreateEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onViewEvent={handleViewEvent}
        onViewQRCode={handleViewQRCode}
      />
    </DashboardLayout>
  );
}
