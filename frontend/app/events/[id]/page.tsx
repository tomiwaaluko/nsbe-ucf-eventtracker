"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { EventDetailPage } from "@/components/EventDetailPage";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Users, Check, CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"member" | "admin" | "super_admin">("member");

  // Planning state
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannedCount, setPlannedCount] = useState(0);
  const [friendsPlanning, setFriendsPlanning] = useState<any[]>([]);
  const [allPlanners, setAllPlanners] = useState<any[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user role first to determine if we should fetch attendance
        let role: "member" | "admin" | "super_admin" = "member";
        try {
          const userData = await api.getMe(token);
          role = userData.role;
          if (role === "admin" || role === "super_admin" || role === "member") {
            setUserRole(role);
          } else {
            setUserRole("member");
          }
        } catch (error) {
          // If getMe fails, try to get from localStorage
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            role = user.role;
            if (role === "admin" || role === "super_admin" || role === "member") {
              setUserRole(role);
            } else {
              setUserRole("member");
            }
          }
        }

        // Fetch event data
        const eventData = await api.getEvent(token, eventId);
        
        // If user is admin, fetch attendance data
        if (role === "admin" || role === "super_admin") {
          try {
            const attendanceData = await api.getEventAttendance(token, eventId);
            // Map attendance data to attendees format
            const attendees = attendanceData.map((record: any) => ({
              id: record.id,
              firstName: record.member?.firstName || null,
              lastName: record.member?.lastName || null,
              email: record.member?.email || "",
              checkedInAt: record.checkedInAt,
            }));
            eventData.attendees = attendees;
          } catch (error) {
            console.error("Failed to load attendance data:", error);
            // Don't fail the whole page if attendance fetch fails
            eventData.attendees = [];
          }
        } else {
          // Non-admins don't see attendees
          eventData.attendees = undefined;
        }
        
        setEvent(eventData);

        // Fetch planning data for this specific event
        try {
          const [planningCheck, planners] = await Promise.all([
            api.checkIfPlanning(token, eventId),
            api.getEventPlanners(token, eventId),
          ]);

          setIsPlanning(planningCheck.isPlanning);
          setPlannedCount(planners.totalPlanning || 0);
          setFriendsPlanning(planners.friendsPlanning || []);
          setAllPlanners(planners.allPlanners || []);
        } catch (error) {
          console.error("Failed to load planning data:", error);
          // Don't fail the whole page if planning data fails
          setIsPlanning(false);
          setPlannedCount(0);
          setFriendsPlanning([]);
          setAllPlanners([]);
        }
      } catch (error: any) {
        console.error("Failed to load event:", error);
        toast.error("Failed to load event");
        router.push("/events");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId, router]);

  const handleBack = () => {
    router.push("/events");
  };

  const handleCheckIn = (eventId: string) => {
    router.push("/attendance");
  };

  const handleEdit = (eventId: string) => {
    router.push(`/events/${eventId}/edit`);
  };

  const handleTogglePlan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setIsLoadingPlan(true);

      if (isPlanning) {
        await api.unmarkPlanToAttend(token, eventId);
        toast.success("Removed from your plans");
      } else {
        await api.markPlanToAttend(token, eventId);
        toast.success("Added to your plans!");
      }

      // Refresh planning data
      const [planningCheck, planners] = await Promise.all([
        api.checkIfPlanning(token, eventId),
        api.getEventPlanners(token, eventId),
      ]);

      setIsPlanning(planningCheck.isPlanning);
      setPlannedCount(planners.totalPlanning || 0);
      setFriendsPlanning(planners.friendsPlanning || []);
      setAllPlanners(planners.allPlanners || []);
    } catch (error: any) {
      console.error("Failed to update plan status:", error);
      toast.error(error.message || "Failed to update your plans");
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const getInitials = (
    firstName?: string,
    lastName?: string,
    email?: string
  ) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
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

  const isPast = new Date(event.endTime) < new Date();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <EventDetailPage
          event={event}
          onBack={handleBack}
          onCheckIn={handleCheckIn}
          onEdit={handleEdit}
          userRole={userRole}
        />

        {/* Plan to Attend Section */}
        {!isPast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Plan to Attend</h3>
              <Button
                variant={isPlanning ? "default" : "outline"}
                onClick={handleTogglePlan}
                disabled={isLoadingPlan}
                className={isPlanning ? "bg-[#00a651] hover:bg-[#008a44] text-white" : ""}
              >
                {isLoadingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isPlanning ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Planning to Attend
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Mark as Planning
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Users className="w-4 h-4 text-gray-400" />
              <span>
                {plannedCount} {plannedCount === 1 ? "person" : "people"} planning to attend
              </span>
            </div>

            {friendsPlanning.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mb-2">
                  {friendsPlanning.length} of your friends planning to attend
                </Badge>
                <div className="text-sm text-gray-700">
                  {friendsPlanning.slice(0, 5).map((friend, i) => (
                    <span key={i}>
                      {friend.firstName} {friend.lastName}
                      {i < Math.min(4, friendsPlanning.length - 1) ? ", " : ""}
                    </span>
                  ))}
                  {friendsPlanning.length > 5 && ` +${friendsPlanning.length - 5} more`}
                </div>
              </div>
            )}

            {/* Who's Planning List */}
            {allPlanners.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Who's Planning to Attend
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {allPlanners.map((planner) => (
                    <div
                      key={planner.memberId}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-[#00a651] text-white">
                          {getInitials(
                            planner.firstName,
                            planner.lastName,
                            planner.email
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {planner.firstName && planner.lastName
                            ? `${planner.firstName} ${planner.lastName}`
                            : planner.email}
                        </p>
                        {planner.isFriend && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 mt-1">
                            Friend
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
