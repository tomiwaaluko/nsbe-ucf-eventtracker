"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { EventDetailPage } from "@/components/EventDetailPage";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real event data from API
    // For now, using mock data
    const mockEvent = {
      id: eventId,
      name: "Sample Event",
      description: "This is a sample event description.",
      category: "GBM" as const,
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      location: "Student Union",
      isActive: true,
      createdBy: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      },
      attendees: [],
    };
    setEvent(mockEvent);
    setIsLoading(false);
  }, [eventId]);

  const handleBack = () => {
    router.push("/events");
  };

  const handleCheckIn = (eventId: string) => {
    router.push("/checkin");
  };

  const handleEdit = (eventId: string) => {
    console.log("Edit event:", eventId);
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
        userRole="member"
      />
    </DashboardLayout>
  );
}
