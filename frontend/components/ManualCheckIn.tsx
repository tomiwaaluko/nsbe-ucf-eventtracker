import { useState } from "react";
import {
  Search,
  UserCheck,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface Member {
  id: string;
  name: string;
  email: string;
  hasAttended?: boolean;
}

interface Event {
  id: string;
  name: string;
  eventType: "WORKSHOP" | "GBM" | "COMMUNITY_SERVICE";
  date: string;
  location: string;
}

interface ManualCheckInProps {
  members: Member[];
  events: Event[];
  onCheckIn: (
    memberId: string,
    eventId: string,
    officerName: string
  ) => Promise<{ success: boolean; message: string }>;
}

export function ManualCheckIn({
  members,
  events,
  onCheckIn,
}: ManualCheckInProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [officerName, setOfficerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Filter members based on search
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Get selected event details
  const selectedEventData = events.find((e) => e.id === selectedEvent);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "WORKSHOP":
        return "#ffb81c";
      case "GBM":
        return "#00a651";
      case "COMMUNITY_SERVICE":
        return "#ed1c24";
      default:
        return "#6b7280";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "WORKSHOP":
        return "Workshop";
      case "GBM":
        return "GBM";
      case "COMMUNITY_SERVICE":
        return "Community Service";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent || !selectedMember || !officerName.trim()) {
      setResult({
        success: false,
        message: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await onCheckIn(
        selectedMember,
        selectedEvent,
        officerName
      );
      setResult(response);

      if (response.success) {
        // Reset form on success
        setSelectedMember("");
        setMemberSearch("");
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to check in member. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setMemberSearch(member.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-gray-900">Manual Check-In</h2>
            <p className="text-gray-600 mt-1">
              Check in members who cannot scan QR codes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Check-In Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Event */}
                <Card className="p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#00a651] bg-opacity-10 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#00a651]" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">Step 1: Select Event</h3>
                      <p className="text-sm text-gray-500">
                        Choose the event to check in to
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event">
                      Event <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedEvent}
                      onValueChange={setSelectedEvent}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getEventTypeColor(
                                    event.eventType
                                  ),
                                }}
                              />
                              <span className="text-gray-900">
                                {event.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                • {formatDate(event.date)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedEventData && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge
                            style={{
                              backgroundColor: `${getEventTypeColor(
                                selectedEventData.eventType
                              )}20`,
                              color: getEventTypeColor(
                                selectedEventData.eventType
                              ),
                            }}
                          >
                            {getEventTypeLabel(selectedEventData.eventType)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-900">
                          {selectedEventData.location}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Select Member */}
                <Card className="p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#ffb81c] bg-opacity-10 rounded-lg">
                      <Search className="w-5 h-5 text-[#ffb81c]" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">Step 2: Find Member</h3>
                      <p className="text-sm text-gray-500">
                        Search for the member to check in
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="member">
                      Search Member <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="member"
                        type="text"
                        placeholder="Search by name or email..."
                        value={memberSearch}
                        onChange={(e) => {
                          setMemberSearch(e.target.value);
                          setSelectedMember("");
                        }}
                        className="pl-10"
                      />
                    </div>

                    {/* Member Results */}
                    {memberSearch && (
                      <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredMembers.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {filteredMembers.slice(0, 5).map((member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => handleMemberSelect(member.id)}
                                className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                                  selectedMember === member.id
                                    ? "bg-[#00a651] bg-opacity-10"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-900">
                                      {member.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {member.email}
                                    </p>
                                  </div>
                                  {selectedMember === member.id && (
                                    <CheckCircle className="w-5 h-5 text-[#00a651]" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No members found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Officer Information */}
                <Card className="p-6 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#ed1c24] bg-opacity-10 rounded-lg">
                      <UserCheck className="w-5 h-5 text-[#ed1c24]" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">Step 3: Officer Info</h3>
                      <p className="text-sm text-gray-500">
                        Enter your name for verification
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="officer">
                      Officer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="officer"
                      type="text"
                      placeholder="Enter your full name"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    !selectedEvent ||
                    !selectedMember ||
                    !officerName ||
                    isSubmitting
                  }
                  className="w-full bg-[#00a651] hover:bg-[#008a44] text-white h-12"
                >
                  {isSubmitting ? (
                    "Checking In..."
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5 mr-2" />
                      Check In Member
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Information & Result Panel */}
            <div className="space-y-6">
              {/* Result */}
              {result && (
                <Card
                  className={`p-6 border-2 ${
                    result.success
                      ? "bg-green-50 border-green-200 dark:bg-green-50"
                      : "bg-red-50 border-red-200 dark:bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                    <div>
                      <h4
                        className={
                          result.success ? "text-green-900" : "text-red-900"
                        }
                      >
                        {result.success
                          ? "Check-In Successful!"
                          : "Check-In Failed"}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${
                          result.success ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {result.message}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Instructions */}
              <Card className="p-6 bg-white">
                <h4 className="text-gray-900 mb-4">Instructions</h4>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                      1
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Select the event from the dropdown list
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                      2
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Search for the member by name or email
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                      3
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Click on the member from the search results
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                      4
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Enter your name as the checking officer
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                      5
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Click "Check In Member" to complete
                    </p>
                  </li>
                </ol>
              </Card>

              {/* Tips */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h5 className="text-blue-900 mb-2">💡 Tips</h5>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Use manual check-in for members without phones</li>
                  <li>• Verify the member's identity before checking in</li>
                  <li>• Double-check you selected the correct event</li>
                  <li>• Members can only check in once per event</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
