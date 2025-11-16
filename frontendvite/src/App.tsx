import { useState } from "react";
import { toast } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { EventsPage } from "./components/EventsPage";
import { EventDetailPage } from "./components/EventDetailPage";
import { CheckInPage } from "./components/CheckInPage";
import { MemberProfile } from "./components/MemberProfile";
import { Settings } from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import { AuthFlow } from "./components/AuthFlow";
import { CreateEventForm } from "./components/CreateEventForm";
import { EditEventForm } from "./components/EditEventForm";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { ErrorStatesShowcase } from "./components/ErrorStatesShowcase";
import { AnimationsShowcase } from "./components/AnimationsShowcase";
import { InteractivePrototype } from "./components/InteractivePrototype";
import { EventDetailShowcase } from "./components/EventDetailShowcase";
import { AdminDashboard } from "./components/AdminDashboard";
import { EventManagement } from "./components/EventManagement";
import { AttendanceLogs } from "./components/AttendanceLogs";
import { ManualCheckIn } from "./components/ManualCheckIn";
import { MemberManagement } from "./components/MemberManagement";
import { AchievementsPage } from "./components/AchievementsPage";
import { AttendancePage } from "./components/AttendancePage";
import { Toaster } from "./components/ui/sonner";

// Mock data
const mockEvents = [
  {
    id: "event-1",
    name: "Fall GBM #4",
    description:
      "General Body Meeting to discuss upcoming events and initiatives for the semester.",
    category: "GBM" as const,
    eventType: "GBM" as const,
    date: "2024-11-20",
    startTime: "18:00",
    endTime: "19:30",
    location: "Student Union Room 220",
    isActive: true,
    attendeeCount: 45,
    attendees: 45,
    capacity: 100,
    qrSecret: "secret123",
    createdBy: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@ucf.edu",
    },
  },
  {
    id: "event-2",
    name: "Resume Review Workshop",
    description:
      "Get your resume reviewed by industry professionals and learn best practices for technical resumes.",
    category: "SOCIAL_AEX" as const,
    eventType: "WORKSHOP" as const,
    date: "2024-11-22",
    startTime: "17:00",
    endTime: "19:00",
    location: "Engineering Building Room 101",
    isActive: true,
    attendeeCount: 30,
    attendees: 30,
    capacity: 50,
    qrSecret: "secret456",
  },
  {
    id: "event-3",
    name: "Holiday Food Drive",
    description:
      "Join us in collecting and distributing food to families in need this holiday season.",
    category: "COMMUNITY_SERVICE" as const,
    eventType: "COMMUNITY_SERVICE" as const,
    date: "2024-12-05",
    startTime: "09:00",
    endTime: "13:00",
    location: "UCF Arena Parking Lot",
    isActive: true,
    attendeeCount: 25,
    attendees: 25,
    capacity: 75,
    qrSecret: "secret789",
  },
  {
    id: "event-4",
    name: "Networking Mixer",
    description:
      "Network with NSBE alumni and local engineering professionals.",
    category: "SOCIAL_AEX" as const,
    eventType: "WORKSHOP" as const,
    date: "2024-12-10",
    startTime: "18:30",
    endTime: "21:00",
    location: "UCF Downtown Campus",
    isActive: true,
    attendeeCount: 40,
    attendees: 40,
    capacity: 60,
    qrSecret: "secret101",
  },
  {
    id: "event-5",
    name: "Fall GBM #3",
    description: "Previous GBM - Event has ended",
    category: "GBM" as const,
    eventType: "GBM" as const,
    date: "2024-11-01",
    startTime: "18:00",
    endTime: "19:30",
    location: "Student Union Room 220",
    isActive: false,
    attendeeCount: 52,
    attendees: 52,
    capacity: 100,
    qrSecret: "secret202",
  },
];

const mockAttendanceRecords = [
  {
    id: "att-log-1",
    memberId: "member-1",
    memberName: "John Doe",
    memberEmail: "john.doe@ucf.edu",
    eventId: "event-5",
    eventName: "Fall GBM #3",
    eventType: "GBM" as const,
    checkInTime: "2024-11-01T18:05:00",
    checkInMethod: "QR_CODE" as const,
  },
  {
    id: "att-log-2",
    memberId: "member-2",
    memberName: "Sarah Johnson",
    memberEmail: "sarah.johnson@ucf.edu",
    eventId: "event-5",
    eventName: "Fall GBM #3",
    eventType: "GBM" as const,
    checkInTime: "2024-11-01T18:02:00",
    checkInMethod: "QR_CODE" as const,
  },
  {
    id: "att-log-3",
    memberId: "member-3",
    memberName: "Michael Chen",
    memberEmail: "michael.chen@ucf.edu",
    eventId: "event-5",
    eventName: "Fall GBM #3",
    eventType: "GBM" as const,
    checkInTime: "2024-11-01T18:10:00",
    checkInMethod: "MANUAL" as const,
    checkedInBy: "Sarah Johnson",
  },
  {
    id: "att-log-4",
    memberId: "member-1",
    memberName: "John Doe",
    memberEmail: "john.doe@ucf.edu",
    eventId: "event-2",
    eventName: "Resume Review Workshop",
    eventType: "WORKSHOP" as const,
    checkInTime: "2024-11-22T17:05:00",
    checkInMethod: "QR_CODE" as const,
  },
  {
    id: "att-log-5",
    memberId: "member-4",
    memberName: "Emily Rodriguez",
    memberEmail: "emily.rodriguez@ucf.edu",
    eventId: "event-2",
    eventName: "Resume Review Workshop",
    eventType: "WORKSHOP" as const,
    checkInTime: "2024-11-22T17:15:00",
    checkInMethod: "QR_CODE" as const,
  },
  {
    id: "att-log-6",
    memberId: "member-6",
    memberName: "Jessica Williams",
    memberEmail: "jessica.williams@ucf.edu",
    eventId: "event-3",
    eventName: "Holiday Food Drive",
    eventType: "COMMUNITY_SERVICE" as const,
    checkInTime: "2024-12-05T09:10:00",
    checkInMethod: "QR_CODE" as const,
  },
  {
    id: "att-log-7",
    memberId: "member-7",
    memberName: "Marcus Davis",
    memberEmail: "marcus.davis@ucf.edu",
    eventId: "event-3",
    eventName: "Holiday Food Drive",
    eventType: "COMMUNITY_SERVICE" as const,
    checkInTime: "2024-12-05T09:05:00",
    checkInMethod: "QR_CODE" as const,
  },
  {
    id: "att-log-8",
    memberId: "member-8",
    memberName: "Ashley Martinez",
    memberEmail: "ashley.martinez@ucf.edu",
    eventId: "event-1",
    eventName: "Fall GBM #4",
    eventType: "GBM" as const,
    checkInTime: "2024-11-20T18:00:00",
    checkInMethod: "QR_CODE" as const,
  },
  {
    id: "att-log-9",
    memberId: "member-2",
    memberName: "Sarah Johnson",
    memberEmail: "sarah.johnson@ucf.edu",
    eventId: "event-1",
    eventName: "Fall GBM #4",
    eventType: "GBM" as const,
    checkInTime: "2024-11-20T18:03:00",
    checkInMethod: "MANUAL" as const,
    checkedInBy: "John Doe",
  },
  {
    id: "att-log-10",
    memberId: "member-5",
    memberName: "David Thompson",
    memberEmail: "david.thompson@ucf.edu",
    eventId: "event-5",
    eventName: "Fall GBM #3",
    eventType: "GBM" as const,
    checkInTime: "2024-11-01T18:30:00",
    checkInMethod: "MANUAL" as const,
    checkedInBy: "Sarah Johnson",
  },
];

const mockMemberData = {
  id: "member-1",
  email: "john.doe@ucf.edu",
  firstName: "John",
  lastName: "Doe",
  role: "admin" as const,
  major: "Computer Science",
  graduationYear: 2025,
  totalEvents: 8,
  workshopsAttended: 2,
  gbmAttended: 3,
  communityServiceAttended: 3,
  createdAt: new Date("2024-08-15"),
  attendanceHistory: [
    {
      id: "att-1",
      eventName: "Fall GBM #1",
      eventCategory: "GBM" as const,
      checkedInAt: new Date("2024-09-05T18:00:00"),
      checkInMethod: "qr" as const,
    },
    {
      id: "att-2",
      eventName: "Career Workshop",
      eventCategory: "SOCIAL_AEX" as const,
      checkedInAt: new Date("2024-09-12T17:30:00"),
      checkInMethod: "qr" as const,
    },
    {
      id: "att-3",
      eventName: "Community Garden Cleanup",
      eventCategory: "COMMUNITY_SERVICE" as const,
      checkedInAt: new Date("2024-09-20T09:00:00"),
      checkInMethod: "manual" as const,
    },
    {
      id: "att-4",
      eventName: "Fall GBM #2",
      eventCategory: "GBM" as const,
      checkedInAt: new Date("2024-10-03T18:00:00"),
      checkInMethod: "qr" as const,
    },
    {
      id: "att-5",
      eventName: "Technical Interview Prep",
      eventCategory: "SOCIAL_AEX" as const,
      checkedInAt: new Date("2024-10-10T19:00:00"),
      checkInMethod: "qr" as const,
    },
    {
      id: "att-6",
      eventName: "Food Drive",
      eventCategory: "COMMUNITY_SERVICE" as const,
      checkedInAt: new Date("2024-10-15T10:00:00"),
      checkInMethod: "qr" as const,
    },
    {
      id: "att-7",
      eventName: "Fall GBM #3",
      eventCategory: "GBM" as const,
      checkedInAt: new Date("2024-11-01T18:00:00"),
      checkInMethod: "qr" as const,
    },
    {
      id: "att-8",
      eventName: "Beach Cleanup",
      eventCategory: "COMMUNITY_SERVICE" as const,
      checkedInAt: new Date("2024-11-08T08:00:00"),
      checkInMethod: "qr" as const,
    },
  ],
};

const mockMembers = [
  {
    id: "member-1",
    name: "John Doe",
    email: "john.doe@ucf.edu",
    role: "ADMIN" as const,
    isActive: true,
    workshopsAttended: 2,
    gbmAttended: 3,
    communityServiceAttended: 3,
    totalEvents: 8,
    joinedDate: "2024-08-15",
  },
  {
    id: "member-2",
    name: "Sarah Johnson",
    email: "sarah.johnson@ucf.edu",
    role: "OFFICER" as const,
    isActive: true,
    workshopsAttended: 5,
    gbmAttended: 4,
    communityServiceAttended: 3,
    totalEvents: 12,
    joinedDate: "2024-08-10",
  },
  {
    id: "member-3",
    name: "Michael Chen",
    email: "michael.chen@ucf.edu",
    role: "MEMBER" as const,
    isActive: true,
    workshopsAttended: 3,
    gbmAttended: 3,
    communityServiceAttended: 3,
    totalEvents: 9,
    joinedDate: "2024-09-01",
  },
  {
    id: "member-4",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@ucf.edu",
    role: "MEMBER" as const,
    isActive: true,
    workshopsAttended: 1,
    gbmAttended: 2,
    communityServiceAttended: 2,
    totalEvents: 5,
    joinedDate: "2024-09-15",
  },
  {
    id: "member-5",
    name: "David Thompson",
    email: "david.thompson@ucf.edu",
    role: "MEMBER" as const,
    isActive: false,
    workshopsAttended: 0,
    gbmAttended: 1,
    communityServiceAttended: 0,
    totalEvents: 1,
    joinedDate: "2024-10-01",
  },
  {
    id: "member-6",
    name: "Jessica Williams",
    email: "jessica.williams@ucf.edu",
    role: "MEMBER" as const,
    isActive: true,
    workshopsAttended: 4,
    gbmAttended: 5,
    communityServiceAttended: 4,
    totalEvents: 13,
    joinedDate: "2024-08-20",
  },
  {
    id: "member-7",
    name: "Marcus Davis",
    email: "marcus.davis@ucf.edu",
    role: "OFFICER" as const,
    isActive: true,
    workshopsAttended: 6,
    gbmAttended: 6,
    communityServiceAttended: 5,
    totalEvents: 17,
    joinedDate: "2024-08-05",
  },
  {
    id: "member-8",
    name: "Ashley Martinez",
    email: "ashley.martinez@ucf.edu",
    role: "MEMBER" as const,
    isActive: true,
    workshopsAttended: 2,
    gbmAttended: 3,
    communityServiceAttended: 1,
    totalEvents: 6,
    joinedDate: "2024-09-20",
  },
];

type Page =
  | "dashboard"
  | "events"
  | "event-detail"
  | "check-in"
  | "profile"
  | "settings"
  | "component-library"
  | "error-states-showcase"
  | "animations-showcase"
  | "interactive-prototype"
  | "event-detail-showcase"
  | "admin-dashboard"
  | "event-management"
  | "attendance-logs"
  | "manual-check-in"
  | "member-management"
  | "achievements"
  | "attendance";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Mock admin stats
  const adminStats = {
    totalMembers: 92,
    activeMembers: 78,
    totalEvents: 24,
    upcomingEvents: 8,
    totalAttendance: 1245,
    averageAttendance: 52,
    membersWithOneOneOne: 45,
    membersWithThreeThreeThree: 28,
  };

  const handleAuthComplete = (userData: {
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    setIsAuthenticated(true);
    toast.success(`Welcome, ${userData.firstName}!`, {
      description: "You're now signed in to NSBE UCF Event Tracker.",
    });
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setShowCreateEvent(false);
  };

  const handleViewEvent = (eventId: string) => {
    const event = mockEvents.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setCurrentPage("event-detail");
    }
  };

  const handleCheckIn = (eventId: string) => {
    setCurrentPage("check-in");
    const event = mockEvents.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleCreateEvent = (eventData: any) => {
    toast.success("Event created successfully!", {
      description: `${eventData.name} has been added to the event calendar.`,
    });
    setShowCreateEvent(false);
    handleNavigate("event-management");
  };

  const handleUpdateEvent = (eventData: any) => {
    toast.success("Event updated successfully!", {
      description: `${eventData.name} has been updated.`,
    });
    setShowEditEvent(false);
    handleNavigate("event-management");
  };

  // Show auth flow if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <AuthFlow onAuthComplete={handleAuthComplete} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show main application
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userRole={mockMemberData.role}
      />

      <main className="flex-1 overflow-y-auto lg:ml-72">
        {/* Create Event Modal */}
        {showCreateEvent && (
          <CreateEventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateEvent(false)}
          />
        )}

        {/* Edit Event Modal */}
        {showEditEvent && selectedEvent && (
          <EditEventForm
            event={{
              ...selectedEvent,
              startTime: new Date(
                `${selectedEvent.date}T${selectedEvent.startTime}:00`
              ),
              endTime: new Date(
                `${selectedEvent.date}T${selectedEvent.endTime}:00`
              ),
            }}
            onSubmit={handleUpdateEvent}
            onCancel={() => setShowEditEvent(false)}
          />
        )}

        {/* Page Content */}
        {currentPage === "dashboard" && (
          <Dashboard
            memberData={mockMemberData}
            upcomingEvents={mockEvents
              .filter((e) => new Date(e.date) > new Date())
              .map((e) => ({
                ...e,
                startTime: new Date(`${e.date}T${e.startTime}:00`),
                endTime: new Date(`${e.date}T${e.endTime}:00`),
              }))}
            onViewEvent={handleViewEvent}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "events" && (
          <EventsPage
            events={mockEvents.map((e) => ({
              ...e,
              startTime: new Date(`${e.date}T${e.startTime}:00`),
              endTime: new Date(`${e.date}T${e.endTime}:00`),
            }))}
            onViewDetails={handleViewEvent}
            onCheckIn={handleCheckIn}
            onCreateEvent={() => setShowCreateEvent(true)}
            userRole={mockMemberData.role}
          />
        )}

        {currentPage === "event-detail" && selectedEvent && (
          <EventDetailPage
            event={{
              ...selectedEvent,
              startTime: new Date(
                `${selectedEvent.date}T${selectedEvent.startTime}:00`
              ),
              endTime: new Date(
                `${selectedEvent.date}T${selectedEvent.endTime}:00`
              ),
            }}
            onBack={() => handleNavigate("events")}
            onCheckIn={handleCheckIn}
            onEdit={() => setShowEditEvent(true)}
            userRole={mockMemberData.role}
          />
        )}

        {currentPage === "check-in" && selectedEvent && (
          <CheckInPage
            eventId={selectedEvent.id}
            eventName={selectedEvent.name}
            onBack={() => handleNavigate("events")}
          />
        )}

        {currentPage === "profile" && (
          <MemberProfile
            memberData={mockMemberData}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "settings" && (
          <Settings
            onBack={() => handleNavigate("dashboard")}
            memberData={mockMemberData}
          />
        )}

        {currentPage === "component-library" && <ComponentLibrary />}

        {currentPage === "admin-dashboard" && (
          <AdminDashboard stats={adminStats} onNavigate={handleNavigate} />
        )}

        {currentPage === "event-management" && (
          <EventManagement
            events={mockEvents}
            onCreateEvent={() => setShowCreateEvent(true)}
            onEditEvent={(eventId) => {
              const event = mockEvents.find((e) => e.id === eventId);
              if (event) {
                setSelectedEvent(event);
                setShowEditEvent(true);
              }
            }}
            onDeleteEvent={(eventId) => {
              toast.success("Event deleted successfully!", {
                description: "The event has been removed from the system.",
              });
            }}
            onViewEvent={handleViewEvent}
          />
        )}

        {currentPage === "attendance-logs" && (
          <AttendanceLogs attendanceRecords={mockAttendanceRecords} />
        )}

        {currentPage === "manual-check-in" && (
          <ManualCheckIn
            members={mockMembers.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
            }))}
            events={mockEvents.map((e) => ({
              id: e.id,
              name: e.name,
              eventType: e.eventType,
              date: e.date,
              location: e.location,
            }))}
            onCheckIn={async (memberId, eventId, officerName) => {
              const member = mockMembers.find((m) => m.id === memberId);
              const event = mockEvents.find((e) => e.id === eventId);

              if (member && event) {
                toast.success("Check-in successful!", {
                  description: `${member.name} has been checked into ${event.name}`,
                });
                return {
                  success: true,
                  message: `Successfully checked in ${member.name}`,
                };
              }

              return {
                success: false,
                message: "Failed to check in member",
              };
            }}
          />
        )}

        {currentPage === "member-management" && (
          <MemberManagement
            members={mockMembers}
            onEditMember={(memberId, data) => {
              toast.success("Member updated successfully!", {
                description: "The member information has been updated.",
              });
            }}
            onViewMember={(memberId) => {
              toast.info("View member details", {
                description: `Viewing details for member ID: ${memberId}`,
              });
            }}
            onToggleStatus={(memberId, isActive) => {
              toast.success(
                `Member ${isActive ? "activated" : "deactivated"}!`,
                {
                  description: "The member status has been updated.",
                }
              );
            }}
          />
        )}

        {currentPage === "error-states-showcase" && (
          <ErrorStatesShowcase onBack={() => handleNavigate("settings")} />
        )}

        {currentPage === "animations-showcase" && (
          <AnimationsShowcase onBack={() => handleNavigate("settings")} />
        )}

        {currentPage === "interactive-prototype" && (
          <InteractivePrototype onBack={() => handleNavigate("settings")} />
        )}

        {currentPage === "event-detail-showcase" && (
          <EventDetailShowcase onBack={() => handleNavigate("settings")} />
        )}

        {currentPage === "achievements" && (
          <AchievementsPage memberData={mockMemberData} />
        )}

        {currentPage === "attendance" && (
          <AttendancePage
            upcomingEvents={mockEvents
              .filter((e) => new Date(e.date) >= new Date())
              .map((e) => ({
                ...e,
                startTime: new Date(`${e.date}T${e.startTime}:00`),
                endTime: new Date(`${e.date}T${e.endTime}:00`),
              }))}
            onCheckIn={(eventId) => {
              toast.success("Checked in successfully!", {
                description: "You've been checked into the event.",
              });
            }}
          />
        )}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
