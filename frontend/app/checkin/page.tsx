"use client";

import { CheckInPage } from "@/components/CheckInPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { api } from "@/lib/api";

console.log("🔴 [PAGE] Check-in page module loaded");

export default function CheckIn() {
  console.log("🔴 [PAGE] CheckIn component function called");
  
  const [isLoading, setIsLoading] = useState(false);
  
  console.log("🔴 [PAGE] Component state initialized");

  const handleCheckIn = async (
    eventId: string,
    qrSecret: string
  ): Promise<{ success: boolean; message: string; event?: any }> => {
    console.log("🚀 [CHECK-IN] handleCheckIn called");
    console.log("🚀 [CHECK-IN] eventId:", eventId);
    console.log("🚀 [CHECK-IN] qrSecret:", qrSecret ? "***" : undefined);
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("🚀 [CHECK-IN] Auth token:", token ? "***" : "NOT FOUND");
      
      if (!token) {
        console.error("❌ [CHECK-IN] No auth token found");
        return {
          success: false,
          message: "Please log in to check in to events.",
        };
      }

      console.log("🚀 [CHECK-IN] Calling api.checkIn...");
      console.log("🚀 [CHECK-IN] Request data:", { eventId, token: qrSecret ? "***" : undefined });
      
      const data = await api.checkIn(token, { eventId, token: qrSecret });
      console.log("✅ [CHECK-IN] API response received:", data);
      console.log("✅ [CHECK-IN] Response event:", data.event);

      // Backend returns attendance record with event included
      const result = {
        success: true,
        message: "Successfully checked in!",
        event: data.event,
      };
      console.log("✅ [CHECK-IN] Returning success result:", result);
      return result;
    } catch (error: any) {
      console.error("❌ [CHECK-IN] Error in handleCheckIn:", error);
      console.error("❌ [CHECK-IN] Error name:", error.name);
      console.error("❌ [CHECK-IN] Error message:", error.message);
      console.error("❌ [CHECK-IN] Error stack:", error.stack);
      
      const errorResult = {
        success: false,
        message: error.message || "Failed to check in. Please try again.",
      };
      console.log("❌ [CHECK-IN] Returning error result:", errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
      console.log("🚀 [CHECK-IN] Loading state set to false");
    }
  };

  console.log("🔴 [PAGE] About to render component");
  
  // Test if console works
  try {
    console.log("🔴 [PAGE] Console test - this should always print");
    console.warn("🔴 [PAGE] Console warn test");
    console.error("🔴 [PAGE] Console error test");
  } catch (e) {
    alert("Console error: " + e);
  }
  
  return (
    <DashboardLayout>
      <CheckInPage onCheckIn={handleCheckIn} />
    </DashboardLayout>
  );
}
