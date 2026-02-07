"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateEventForm } from "@/components/CreateEventForm";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      await api.createEvent(token, eventData);
      toast.success("Event created successfully");
      router.push("/admin/events");
    } catch (error: any) {
      console.error("Failed to create event:", error);
      const errorMessage = error?.message || error?.error || "Failed to create event";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/events");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <CreateEventForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
