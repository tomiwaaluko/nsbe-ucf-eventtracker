"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [memberData, setMemberData] = useState({
    name: "Guest User",
    email: "",
    role: "member",
    totalEvents: 0,
    workshopsAttended: 0,
    gbmAttended: 0,
    communityServiceAttended: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    if (userStr) {
      const user = JSON.parse(userStr);
      setMemberData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }));
    }

    // TODO: Fetch real data from API
    // For now, using mock data
    setIsLoading(false);
  }, [router]);

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Dashboard
      memberData={memberData}
      upcomingEvents={upcomingEvents}
      onViewEvent={handleViewEvent}
      onNavigate={handleNavigate}
    />
  );
}
