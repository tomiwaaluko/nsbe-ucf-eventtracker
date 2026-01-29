import { useState } from "react";
import { motion } from "framer-motion";
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
  eventType: "GBM" | "SOCIAL" | "WORKSHOP" | "FUNDRAISER" | "COMMUNITY_SERVICE" | "COMMITTEE_PARTICIPATION";
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
  const filteredMembers = Array.isArray(members)
    ? members.filter(
        (member) => {
          const name = member.name || "";
          const email = member.email || "";
          const searchLower = memberSearch.toLowerCase();
          return (
            name.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower)
          );
        }
      )
    : [];

  // Get selected event details
  const selectedEventData = Array.isArray(events)
    ? events.find((e) => e.id === selectedEvent)
    : undefined;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "GBM":
        return "#00a651"; // NSBE Green
      case "SOCIAL":
        return "#ffb81c"; // NSBE Gold
      case "WORKSHOP":
        return "#0066cc"; // Blue
      case "FUNDRAISER":
        return "#ed1c24"; // NSBE Red
      case "COMMUNITY_SERVICE":
        return "#8b4513"; // Brown
      case "COMMITTEE_PARTICIPATION":
        return "#9932cc"; // Purple
      default:
        return "#6b7280";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "GBM":
        return "General Body Meeting";
      case "SOCIAL":
        return "Social";
      case "WORKSHOP":
        return "Workshop";
      case "FUNDRAISER":
        return "Fundraiser";
      case "COMMUNITY_SERVICE":
        return "Community Service";
      case "COMMITTEE_PARTICIPATION":
        return "Committee Participation";
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
    <div className="min-h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-bold text-white">Manual Check-In</h2>
            <p className="text-white/80 mt-1">
              Check in members who cannot scan QR codes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Check-In Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Event */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          Step 1: Select Event
                        </h3>
                        <p className="text-sm text-white/70">
                          Choose the event to check in to
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="event" className="text-white/90">
                        Event <span className="text-red-300">*</span>
                      </Label>
                      <Select
                        value={selectedEvent}
                        onValueChange={setSelectedEvent}
                      >
                        <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(events) &&
                            events.map((event) => (
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
                                  <span>{event.name}</span>
                                  <span className="text-xs text-gray-500">
                                    • {formatDate(event.date)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {selectedEventData && (
                        <div className="mt-3 p-3 bg-white/10 rounded-lg">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge
                              style={{
                                backgroundColor: `${getEventTypeColor(
                                  selectedEventData.eventType
                                )}40`,
                                color: "white",
                              }}
                            >
                              {getEventTypeLabel(selectedEventData.eventType)}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/90">
                            {selectedEventData.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>

                {/* Select Member */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          Step 2: Find Member
                        </h3>
                        <p className="text-sm text-white/70">
                          Search for the member to check in
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="member" className="text-white/90">
                        Search Member <span className="text-red-300">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                        <Input
                          id="member"
                          type="text"
                          placeholder="Search by name or email..."
                          value={memberSearch}
                          onChange={(e) => {
                            setMemberSearch(e.target.value);
                            setSelectedMember("");
                          }}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>

                      {/* Member Results */}
                      {memberSearch && (
                        <div className="mt-2 max-h-60 overflow-y-auto border border-white/20 rounded-lg bg-white/5">
                          {filteredMembers.length > 0 ? (
                            <div className="divide-y divide-white/10">
                              {filteredMembers.slice(0, 5).map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => handleMemberSelect(member.id)}
                                  className={`w-full p-3 text-left hover:bg-white/10 transition-colors ${
                                    selectedMember === member.id
                                      ? "bg-white/20"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-white font-medium">
                                        {member.name}
                                      </p>
                                      <p className="text-xs text-white/60">
                                        {member.email}
                                      </p>
                                    </div>
                                    {selectedMember === member.id && (
                                      <CheckCircle className="w-5 h-5 text-green-400" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-white/60">
                              No members found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>

                {/* Officer Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          Step 3: Officer Info
                        </h3>
                        <p className="text-sm text-white/70">
                          Enter your name for verification
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="officer" className="text-white/90">
                        Officer Name <span className="text-red-300">*</span>
                      </Label>
                      <Input
                        id="officer"
                        type="text"
                        placeholder="Enter your full name"
                        value={officerName}
                        onChange={(e) => setOfficerName(e.target.value)}
                        className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </Card>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    disabled={
                      !selectedEvent ||
                      !selectedMember ||
                      !officerName ||
                      isSubmitting
                    }
                    className="w-full bg-white/20 hover:bg-white/30 border border-white/20 backdrop-blur-sm text-white h-12 font-semibold disabled:opacity-50"
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
                </motion.div>
              </form>
            </div>

            {/* Information & Result Panel */}
            <div className="space-y-6">
              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <Card
                    className={`p-6 border-2 ${
                      result.success
                        ? "bg-green-500/20 border-green-400/50 backdrop-blur-md"
                        : "bg-red-500/20 border-red-400/50 backdrop-blur-md"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <div className="p-2 bg-green-400/30 rounded-full">
                          <CheckCircle className="w-6 h-6 text-green-200" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-400/30 rounded-full">
                          <AlertCircle className="w-6 h-6 text-red-200" />
                        </div>
                      )}
                      <div>
                        <h4
                          className={
                            result.success
                              ? "text-green-100 font-semibold"
                              : "text-red-100 font-semibold"
                          }
                        >
                          {result.success
                            ? "Check-In Successful!"
                            : "Check-In Failed"}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            result.success
                              ? "text-green-200/90"
                              : "text-red-200/90"
                          }`}
                        >
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                  <h4 className="text-white font-semibold mb-4">
                    Instructions
                  </h4>
                  <ol className="space-y-3">
                    <li className="flex gap-3">
                      <Badge className="bg-white/20 text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                        1
                      </Badge>
                      <p className="text-sm text-white/80">
                        Select the event from the dropdown list
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <Badge className="bg-white/20 text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                        2
                      </Badge>
                      <p className="text-sm text-white/80">
                        Search for the member by name or email
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <Badge className="bg-white/20 text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                        3
                      </Badge>
                      <p className="text-sm text-white/80">
                        Click on the member from the search results
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <Badge className="bg-white/20 text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                        4
                      </Badge>
                      <p className="text-sm text-white/80">
                        Enter your name as the checking officer
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <Badge className="bg-white/20 text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                        5
                      </Badge>
                      <p className="text-sm text-white/80">
                        Click "Check In Member" to complete
                      </p>
                    </li>
                  </ol>
                </Card>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-blue-500/20 border-blue-400/50 backdrop-blur-md">
                  <h5 className="text-blue-100 font-semibold mb-2">💡 Tips</h5>
                  <ul className="space-y-1 text-sm text-blue-200/90">
                    <li>• Use manual check-in for members without phones</li>
                    <li>• Verify the member's identity before checking in</li>
                    <li>• Double-check you selected the correct event</li>
                    <li>• Members can only check in once per event</li>
                  </ul>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
