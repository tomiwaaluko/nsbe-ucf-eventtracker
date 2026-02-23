"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [plannedEvents, setPlannedEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    // Fetch fresh user data from backend and update localStorage
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [userData, records, eventsData, myPlans] = await Promise.all([
          api.getMe(token),
          api.getMyAttendance(token),
          api.getEvents(token, true),
          api.getMyPlannedEvents(token),
        ]);

        // Update localStorage with fresh data
        const updatedUser = {
          email: userData.email,
          firstName: userData.firstName || "User",
          lastName: userData.lastName || "",
          role: userData.role || "member",
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Process attendance records
        const attendanceArray = Array.isArray(records) ? records : [];
        setAttendanceRecords(attendanceArray);

        // Calculate statistics from attendance records using backend bucket logic
        // Bucket 1: WORKSHOP + SOCIAL (Workshops & Socials)
        // Bucket 2: FUNDRAISER + COMMUNITY_SERVICE (Fundraiser & Community Service)
        // Bucket 3: GBM (General Body Meeting)
        // COMMITTEE_PARTICIPATION doesn't count toward achievements
        let workshopsSocialsAttended = 0; // Bucket 1
        let fundraiserCommunityServiceAttended = 0; // Bucket 2
        let gbmAttended = 0; // Bucket 3
        let totalEvents = 0;

        attendanceArray.forEach((record: any) => {
          if (record.event) {
            const category = record.event.category;
            
            // Only count categories that are part of achievement buckets
            // COMMITTEE_PARTICIPATION is excluded
            if (category !== "COMMITTEE_PARTICIPATION") {
              totalEvents++;
            }
            
            // Map to buckets (matching backend logic)
            if (category === "WORKSHOP" || category === "SOCIAL") {
              workshopsSocialsAttended++;
            } else if (category === "GBM") {
              gbmAttended++;
            } else if (category === "COMMUNITY_SERVICE" || category === "FUNDRAISER") {
              fundraiserCommunityServiceAttended++;
            }
            // COMMITTEE_PARTICIPATION is skipped (doesn't count)
          }
        });

        // Process upcoming events - filter to only active, upcoming events
        const now = new Date();
        const upcoming = (Array.isArray(eventsData) ? eventsData : [])
          .filter((event: any) => {
            if (!event.isActive) return false;
            const startTime = new Date(event.startTime);
            return startTime > now;
          })
          .sort((a: any, b: any) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          })
          .slice(0, 6) // Limit to 6 upcoming events
          .map((event: any) => ({
            id: event.id,
            name: event.name,
            description: event.description || undefined,
            category: event.category,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location || undefined,
            isActive: event.isActive ?? true,
          }));

        setUpcomingEvents(upcoming);

        // Process planned events
        const planned = (Array.isArray(myPlans) ? myPlans : []).map((plan: any) => ({
          id: plan.event.id,
          name: plan.event.name,
          description: plan.event.description || undefined,
          category: plan.event.category,
          startTime: plan.event.startTime,
          endTime: plan.event.endTime,
          location: plan.event.location || undefined,
          isActive: plan.event.isActive ?? true,
          isPlanning: true,
          plannedCount: plan.plannedCount || 0,
        }));
        setPlannedEvents(planned);

        // Update component state with calculated statistics (using bucket names)
        setMemberData({
          name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim() || "User",
          email: updatedUser.email,
          role: updatedUser.role,
          totalEvents,
          workshopsAttended: workshopsSocialsAttended, // Bucket 1: WORKSHOP + SOCIAL
          gbmAttended, // Bucket 3: GBM
          communityServiceAttended: fundraiserCommunityServiceAttended, // Bucket 2: FUNDRAISER + COMMUNITY_SERVICE
        });
      } catch (error: any) {
        console.error("Failed to fetch data:", error);

        // If token is invalid (401), redirect to login
        if (error.message && error.message.includes("401")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
          return;
        }

        // For other errors, try to load from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setMemberData((prev) => ({
            ...prev,
            name: `${user.firstName} ${user.lastName}`.trim() || "User",
            email: user.email,
            role: user.role || "member",
          }));
        }

        setAttendanceRecords([]);
        setUpcomingEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  if (isLoading) {
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
      <Dashboard
        memberData={memberData}
        attendanceRecords={attendanceRecords}
        upcomingEvents={upcomingEvents}
        plannedEvents={plannedEvents}
        onViewEvent={handleViewEvent}
        onNavigate={handleNavigate}
      />
    </DashboardLayout>
  );
}
