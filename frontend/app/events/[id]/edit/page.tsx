"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { EditEventForm } from "@/components/EditEventForm";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

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
    } catch (error: any) {
      console.error("Failed to load event:", error);
      toast.error("Failed to load event");
      router.push("/admin/events");
    } finally {
      setIsLoading(false);
    }
  };

  const transformEventForForm = (eventData: any) => {
    // Parse ISO datetime strings to extract date and time
    // Use local time to avoid timezone issues
    const startDate = new Date(eventData.startTime);
    const endDate = new Date(eventData.endTime);
    
    // Format date as YYYY-MM-DD in local timezone
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Format time as HH:MM in local timezone
    const formatTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    return {
      ...eventData,
      date: formatDate(startDate), // YYYY-MM-DD format
      startTime: formatTime(startDate), // HH:MM format
      endTime: formatTime(endDate), // HH:MM format
      category: eventData.category,
      description: eventData.description || "",
      location: eventData.location || "",
    };
  };

  const handleSubmit = async (formData: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Transform form data to backend DTO format
      // Combine date + startTime into ISO datetime string
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      const eventData = {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        semester: formData.semester,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: formData.location || undefined,
      };

      await api.updateEvent(token, eventId, eventData);
      toast.success("Event updated successfully");
      router.push("/admin/events");
    } catch (error: any) {
      console.error("Failed to update event:", error);
      const errorMessage = error?.message || error?.error || "Failed to update event";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/events");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />
          <div className="relative z-10 text-lg text-white font-bold uppercase tracking-wider">Loading event...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />
          <div className="relative z-10 text-center">
            <p className="text-white/70 mb-4 font-medium">Event not found</p>
            <button
              onClick={() => router.push("/admin/events")}
              className="bg-white text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wide px-6 py-2 hover:bg-black/5"
            >
              Back to Events
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />
        <div className="relative z-10 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <EditEventForm
              event={transformEventForForm(event)}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
