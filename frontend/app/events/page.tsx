"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventsPage } from "@/components/EventsPage";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Events() {
  const router = useRouter();
  const [events] = useState([]);

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleCheckIn = (eventId: string) => {
    console.log("Check in to event:", eventId);
  };

  const handleCreateEvent = () => {
    console.log("Create new event");
  };

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
