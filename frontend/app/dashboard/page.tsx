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
        // Fetch fresh user data from API
        const userData = await api.getMe(token);

        // Update localStorage with fresh data
        const updatedUser = {
          email: userData.email,
          firstName: userData.firstName || "User",
          lastName: userData.lastName || "",
          role: userData.role || "member",
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update component state
        setMemberData((prev) => ({
          ...prev,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          email: updatedUser.email,
          role: updatedUser.role,
        }));

        // Check for account linking notification
        const accountLinkedStr = localStorage.getItem("account_linked");
        if (accountLinkedStr) {
          try {
            const accountLinkedData = JSON.parse(accountLinkedStr);
            const { provider, timestamp } = accountLinkedData;

            // Only show notification if recent (within 10 seconds)
            const isRecent = Date.now() - timestamp < 10000;

            if (isRecent && provider) {
              // Generate notification message based on auth methods
              const providerName =
                provider === "google" ? "Google" : "Discord";
              const hasPassword = userData.hasPassword;
              const oauthProviders = userData.oauthProviders || [];

              let description = "";
              if (hasPassword) {
                description = `You can now sign in with ${providerName} or your email and password.`;
              } else {
                const providers = oauthProviders
                  .map((p: string) => (p === "google" ? "Google" : "Discord"))
                  .join(" or ");
                description = `You can now sign in with ${providers}.`;
              }

              toast.success("Account linked successfully!", {
                description,
              });
            }

            // Clear the flag
            localStorage.removeItem("account_linked");
          } catch (err) {
            // Invalid JSON, just remove it
            localStorage.removeItem("account_linked");
          }
        }

        // Fetch attendance records
        const records = await api.getMyAttendance(token);
        setAttendanceRecords(Array.isArray(records) ? records : []);
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
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role || "member",
          }));
        }

        setAttendanceRecords([]);
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
        onViewEvent={handleViewEvent}
        onNavigate={handleNavigate}
      />
    </DashboardLayout>
  );
}
