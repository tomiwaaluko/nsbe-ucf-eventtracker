"use client";

import { CheckInPage } from "@/components/CheckInPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";

export default function CheckIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async (
    eventId: string,
    qrSecret: string
  ): Promise<{ success: boolean; message: string; event?: any }> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/attendance/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ eventId, qrSecret }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: "Successfully checked in!",
          event: data.event,
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to check in. Please try again.",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to check in. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <CheckInPage onCheckIn={handleCheckIn} />
    </DashboardLayout>
  );
}
