import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { EnhancedEventDetailPage } from "./EnhancedEventDetailPage";
import { toast } from "sonner";

interface EventDetailShowcaseProps {
  onBack: () => void;
}

export function EventDetailShowcase({ onBack }: EventDetailShowcaseProps) {
  const [selectedDemo, setSelectedDemo] = useState<"gbm" | "workshop" | "service">("gbm");
  const [userStatus, setUserStatus] = useState<"not_registered" | "registered" | "checked_in">("not_registered");

  // Demo events with full data
  const demoEvents = {
    gbm: {
      id: "event-gbm-demo",
      name: "Fall General Body Meeting #5",
      description:
        "Join us for our final GBM of the semester! We'll discuss upcoming events, review accomplishments from this semester, and plan for the Spring semester. Pizza and refreshments will be provided. This is a great opportunity to network with other members and learn about leadership opportunities.",
      category: "GBM" as const,
      startTime: new Date("2024-12-15T18:00:00"),
      endTime: new Date("2024-12-15T19:30:00"),
      location: "Student Union Room 220, UCF",
      isActive: true,
      capacity: 100,
      attendeeCount: 67,
      locationUrl: "https://maps.google.com/?q=Student+Union+UCF",
      isRecurring: true,
      recurringSchedule: "Every other Wednesday at 6:00 PM",
      pastAttendance: [
        { date: "2024-11-20", attendeeCount: 72 },
        { date: "2024-11-06", attendeeCount: 68 },
        { date: "2024-10-23", attendeeCount: 65 },
        { date: "2024-10-09", attendeeCount: 71 },
      ],
      tags: ["networking", "chapter-meeting", "pizza", "mandatory"],
      requirements: {
        countsFor111: true,
        countsFor333: true,
        requirementType: "gbm" as const,
      },
      createdBy: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@ucf.edu",
      },
      attendees: [
        {
          id: "att-1",
          firstName: "Michael",
          lastName: "Brown",
          email: "michael.brown@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:05:00"),
        },
        {
          id: "att-2",
          firstName: "Emily",
          lastName: "Davis",
          email: "emily.davis@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:02:00"),
        },
        {
          id: "att-3",
          firstName: "James",
          lastName: "Wilson",
          email: "james.wilson@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:10:00"),
        },
        {
          id: "att-4",
          firstName: "Jessica",
          lastName: "Martinez",
          email: "jessica.martinez@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:03:00"),
        },
        {
          id: "att-5",
          firstName: "David",
          lastName: "Anderson",
          email: "david.anderson@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:07:00"),
        },
        {
          id: "att-6",
          firstName: "Ashley",
          lastName: "Taylor",
          email: "ashley.taylor@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:01:00"),
        },
        {
          id: "att-7",
          firstName: "Christopher",
          lastName: "Thomas",
          email: "christopher.thomas@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:15:00"),
        },
        {
          id: "att-8",
          firstName: "Amanda",
          lastName: "Jackson",
          email: "amanda.jackson@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:08:00"),
        },
        {
          id: "att-9",
          firstName: "Matthew",
          lastName: "White",
          email: "matthew.white@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:12:00"),
        },
        {
          id: "att-10",
          firstName: "Lauren",
          lastName: "Harris",
          email: "lauren.harris@ucf.edu",
          checkedInAt: new Date("2024-12-15T18:06:00"),
        },
      ],
    },
    workshop: {
      id: "event-workshop-demo",
      name: "Resume Review & Technical Interview Prep Workshop",
      description:
        "Get your resume reviewed by industry professionals from top tech companies including Microsoft, Amazon, and Google. Learn proven strategies for acing technical interviews, including data structures, algorithms, and behavioral questions. Bring printed copies of your resume and dress business casual. Light refreshments provided.",
      category: "SOCIAL_AEX" as const,
      startTime: new Date("2024-12-18T17:00:00"),
      endTime: new Date("2024-12-18T19:30:00"),
      location: "Engineering Building Room 381",
      isActive: true,
      capacity: 50,
      attendeeCount: 42,
      tags: ["career", "resume", "technical-interview", "professional-development"],
      requirements: {
        countsFor111: true,
        countsFor333: true,
        requirementType: "workshop" as const,
      },
      createdBy: {
        firstName: "Marcus",
        lastName: "Thompson",
        email: "marcus.thompson@ucf.edu",
      },
      attendees: [
        {
          id: "att-w1",
          firstName: "Olivia",
          lastName: "Garcia",
          email: "olivia.garcia@ucf.edu",
          checkedInAt: new Date("2024-12-18T17:05:00"),
        },
        {
          id: "att-w2",
          firstName: "Daniel",
          lastName: "Rodriguez",
          email: "daniel.rodriguez@ucf.edu",
          checkedInAt: new Date("2024-12-18T17:02:00"),
        },
        {
          id: "att-w3",
          firstName: "Sophia",
          lastName: "Lee",
          email: "sophia.lee@ucf.edu",
          checkedInAt: new Date("2024-12-18T17:10:00"),
        },
        {
          id: "att-w4",
          firstName: "Ethan",
          lastName: "Martinez",
          email: "ethan.martinez@ucf.edu",
          checkedInAt: new Date("2024-12-18T17:03:00"),
        },
        {
          id: "att-w5",
          firstName: "Isabella",
          lastName: "Hernandez",
          email: "isabella.hernandez@ucf.edu",
          checkedInAt: new Date("2024-12-18T17:07:00"),
        },
      ],
    },
    service: {
      id: "event-service-demo",
      name: "Holiday Food Drive & Community Outreach",
      description:
        "Join NSBE UCF in giving back to the community this holiday season! We'll be collecting, sorting, and distributing food to local families in need. All donated items will go to the Second Harvest Food Bank of Central Florida. Volunteers will receive community service hours. Please wear closed-toe shoes and bring water. Parking is free in the UCF Arena lot.",
      category: "COMMUNITY_SERVICE" as const,
      startTime: new Date("2024-12-20T09:00:00"),
      endTime: new Date("2024-12-20T13:00:00"),
      location: "UCF Arena Parking Lot",
      isActive: true,
      capacity: 75,
      attendeeCount: 58,
      tags: ["community-service", "volunteering", "food-drive", "holidays"],
      requirements: {
        countsFor111: true,
        countsFor333: true,
        requirementType: "service" as const,
      },
      createdBy: {
        firstName: "Alicia",
        lastName: "Williams",
        email: "alicia.williams@ucf.edu",
      },
      attendees: [
        {
          id: "att-s1",
          firstName: "Noah",
          lastName: "Lopez",
          email: "noah.lopez@ucf.edu",
          checkedInAt: new Date("2024-12-20T09:05:00"),
        },
        {
          id: "att-s2",
          firstName: "Ava",
          lastName: "Gonzalez",
          email: "ava.gonzalez@ucf.edu",
          checkedInAt: new Date("2024-12-20T09:02:00"),
        },
        {
          id: "att-s3",
          firstName: "William",
          lastName: "Wilson",
          email: "william.wilson@ucf.edu",
          checkedInAt: new Date("2024-12-20T09:10:00"),
        },
        {
          id: "att-s4",
          firstName: "Mia",
          lastName: "Anderson",
          email: "mia.anderson@ucf.edu",
          checkedInAt: new Date("2024-12-20T09:03:00"),
        },
        {
          id: "att-s5",
          firstName: "Benjamin",
          lastName: "Thomas",
          email: "benjamin.thomas@ucf.edu",
          checkedInAt: new Date("2024-12-20T09:07:00"),
        },
        {
          id: "att-s6",
          firstName: "Charlotte",
          lastName: "Taylor",
          email: "charlotte.taylor@ucf.edu",
          checkedInAt: new Date("2024-12-20T09:01:00"),
        },
      ],
    },
  };

  const currentEvent = demoEvents[selectedDemo];

  const handleCheckIn = (eventId: string) => {
    setUserStatus("checked_in");
    toast.success("Check-in successful!", {
      description: `You've been checked in to ${currentEvent.name}`,
    });
  };

  const handleRSVP = (eventId: string) => {
    setUserStatus("registered");
    toast.success("RSVP confirmed!", {
      description: `You're registered for ${currentEvent.name}`,
    });
  };

  const handleEdit = (eventId: string) => {
    toast.info("Edit mode", {
      description: "This would open the edit event form",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Event Detail Page Showcase
                </h1>
                <p className="text-sm text-gray-600">
                  Complete, responsive event detail page
                </p>
              </div>
            </div>
          </div>

          {/* Demo Selector */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700">Event Type:</span>
              <button
                onClick={() => setSelectedDemo("gbm")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedDemo === "gbm"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                GBM (Recurring)
              </button>
              <button
                onClick={() => setSelectedDemo("workshop")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedDemo === "workshop"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Workshop
              </button>
              <button
                onClick={() => setSelectedDemo("service")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedDemo === "service"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Service
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">User Status:</span>
              <button
                onClick={() => setUserStatus("not_registered")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  userStatus === "not_registered"
                    ? "bg-[#00843D] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Not Registered
              </button>
              <button
                onClick={() => setUserStatus("registered")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  userStatus === "registered"
                    ? "bg-[#00843D] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Registered
              </button>
              <button
                onClick={() => setUserStatus("checked_in")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  userStatus === "checked_in"
                    ? "bg-[#00843D] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Checked In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Page */}
      <EnhancedEventDetailPage
        event={currentEvent}
        onBack={onBack}
        onCheckIn={handleCheckIn}
        onRSVP={handleRSVP}
        onEdit={handleEdit}
        userRole="admin"
        userAttendanceStatus={userStatus}
      />

      {/* Features List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-[#00843D] to-[#006830] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">
            Complete Event Detail Page Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">✨ Core Features</h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li>• Responsive hero header with gradient and badges</li>
                <li>• Event status indicators (Today, Tomorrow, Full, etc.)</li>
                <li>• Full event description and details</li>
                <li>• Date, time, and location information</li>
                <li>• Real-time capacity tracking with progress bar</li>
                <li>• Map/location preview with directions link</li>
                <li>• User attendance status display</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🎯 Interactive Elements</h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li>• RSVP and Check-In buttons (status-aware)</li>
                <li>• Share menu with copy link & add to calendar</li>
                <li>• Expandable attendee list (show more/less)</li>
                <li>• Requirements badges (1-1-1, 3-3-3)</li>
                <li>• Past attendance history (recurring events)</li>
                <li>• Quick stats sidebar</li>
                <li>• Event organizer information</li>
                <li>• Tags and categorization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
