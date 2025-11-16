import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowLeft,
  QrCode,
  Edit,
  Share2,
  Link as LinkIcon,
  Download,
  MapPinned,
  TrendingUp,
  Award,
  CheckCircle2,
  UserPlus,
  UserCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { AnimatedButton } from "./animations/AnimatedButton";
import { AnimatedCard } from "./animations/AnimatedCard";

interface EnhancedEventDetailPageProps {
  event: {
    id: string;
    name: string;
    description?: string;
    category: "COMMUNITY_SERVICE" | "GBM" | "SOCIAL_AEX";
    startTime: Date;
    endTime: Date;
    location?: string;
    isActive: boolean;
    capacity?: number;
    attendeeCount?: number;
    createdBy?: {
      firstName?: string;
      lastName?: string;
      email: string;
    };
    attendees?: Array<{
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
      checkedInAt: Date;
    }>;
    // New fields for enhanced features
    locationUrl?: string; // Google Maps URL
    imageUrl?: string;
    isRecurring?: boolean;
    recurringSchedule?: string;
    pastAttendance?: Array<{
      date: string;
      attendeeCount: number;
    }>;
    tags?: string[];
    requirements?: {
      countsFor111?: boolean;
      countsFor333?: boolean;
      requirementType?: "workshop" | "gbm" | "service";
    };
  };
  onBack: () => void;
  onCheckIn?: (eventId: string) => void;
  onRSVP?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  userRole?: "member" | "admin" | "super_admin";
  userAttendanceStatus?: "not_registered" | "registered" | "checked_in";
}

const categoryConfig = {
  COMMUNITY_SERVICE: {
    label: "Community Service",
    shortLabel: "Service",
    color: "bg-red-100 text-red-700 border-red-200",
    gradient: "from-red-500 to-red-600",
    icon: "🤝",
    iconComponent: Users,
    hex: "#ed1c24",
  },
  GBM: {
    label: "General Body Meeting",
    shortLabel: "GBM",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    gradient: "from-blue-500 to-blue-600",
    icon: "📢",
    iconComponent: Users,
    hex: "#0066cc",
  },
  SOCIAL_AEX: {
    label: "Workshop / Social",
    shortLabel: "Workshop",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    gradient: "from-purple-500 to-purple-600",
    icon: "🎓",
    iconComponent: Award,
    hex: "#9b51e0",
  },
};

export function EnhancedEventDetailPage({
  event,
  onBack,
  onCheckIn,
  onRSVP,
  onEdit,
  userRole = "member",
  userAttendanceStatus = "not_registered",
}: EnhancedEventDetailPageProps) {
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const config = categoryConfig[event.category];
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isPast = endDate < new Date();
  const isToday = startDate.toDateString() === new Date().toDateString();
  const isTomorrow =
    startDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
  const canEdit = userRole === "admin" || userRole === "super_admin";

  // Calculate capacity percentage
  const capacityPercentage = event.capacity
    ? ((event.attendeeCount || 0) / event.capacity) * 100
    : 0;
  const isNearCapacity = capacityPercentage >= 80;
  const isFullCapacity = capacityPercentage >= 100;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

  const copyEventLink = () => {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!", {
      description: "Share this link with others to view this event.",
    });
    setShowShareMenu(false);
  };

  const addToCalendar = () => {
    // Create ICS format
    const title = encodeURIComponent(event.name);
    const description = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");
    const startTimeFormatted = startDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const endTimeFormatted = endDate
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTimeFormatted}/${endTimeFormatted}&details=${description}&location=${location}`;

    window.open(googleCalendarUrl, "_blank");
    toast.success("Opening Google Calendar...");
    setShowShareMenu(false);
  };

  const openDirections = () => {
    if (event.location) {
      const query = encodeURIComponent(event.location);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        "_blank"
      );
    }
  };

  const displayedAttendees = showAllAttendees
    ? event.attendees
    : event.attendees?.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Events</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-8 md:p-12 text-white relative overflow-hidden mb-8`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 text-[200px] leading-none">
              {config.icon}
            </div>
          </div>

          <div className="relative z-10">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {config.label}
              </Badge>
              {isToday && !isPast && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  🔴 Today
                </Badge>
              )}
              {isTomorrow && !isPast && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Tomorrow
                </Badge>
              )}
              {isPast && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Past Event
                </Badge>
              )}
              {event.isRecurring && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  🔄 Recurring
                </Badge>
              )}
              {isFullCapacity && (
                <Badge className="bg-red-500/80 text-white border-red-400/50 backdrop-blur-sm">
                  Full
                </Badge>
              )}
              {isNearCapacity && !isFullCapacity && (
                <Badge className="bg-orange-500/80 text-white border-orange-400/50 backdrop-blur-sm">
                  Almost Full
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {event.name}
            </h1>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 md:gap-6 text-white/90 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{formatDate(startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {formatTime(startDate)} - {formatTime(endDate)}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-lg text-white/90 max-w-3xl leading-relaxed">
                {event.description}
              </p>
            )}

            {/* User Status Indicator */}
            {userAttendanceStatus === "checked_in" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 inline-flex items-center gap-2 bg-green-500/20 text-white px-4 py-2 rounded-lg border border-white/30 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">You're checked in</span>
              </motion.div>
            )}
            {userAttendanceStatus === "registered" && !isPast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg border border-white/30 backdrop-blur-sm"
              >
                <UserCheck className="w-5 h-5" />
                <span className="font-medium">You're registered</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Requirements Fulfilled */}
            {event.requirements && (
              <AnimatedCard delay={0.1}>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-[#00843D]" />
                    <h3 className="font-semibold text-gray-900">
                      Requirements Fulfilled
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.requirements.countsFor111 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">1️⃣</span>
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900">
                            1-1-1 Achievement
                          </p>
                          <p className="text-sm text-purple-700">
                            Counts as {event.requirements.requirementType}
                          </p>
                        </div>
                      </div>
                    )}
                    {event.requirements.countsFor333 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/40 rounded-lg border border-[#FFD700]/50">
                        <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">3️⃣</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            3-3-3 Achievement
                          </p>
                          <p className="text-sm text-gray-700">
                            Counts as {event.requirements.requirementType}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Event Details Card */}
            <AnimatedCard delay={0.2}>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6">
                  Event Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(startDate)}
                      </p>
                      <p className="text-gray-700">
                        {formatTime(startDate)} - {formatTime(endDate)}
                      </p>
                      {event.isRecurring && event.recurringSchedule && (
                        <p className="text-sm text-gray-600 mt-1">
                          🔄 {event.recurringSchedule}
                        </p>
                      )}
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <p className="font-medium text-gray-900">
                          {event.location}
                        </p>
                        <button
                          onClick={openDirections}
                          className="text-sm text-[#00843D] hover:text-[#006830] font-medium mt-1 flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Get Directions
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {config.label}
                        </span>
                        <Badge className={config.color}>
                          {config.shortLabel}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {event.capacity && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">Capacity</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className={`h-full ${
                                  isFullCapacity
                                    ? "bg-red-500"
                                    : isNearCapacity
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${capacityPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                          <span className="font-medium text-gray-900 text-sm whitespace-nowrap">
                            {event.attendeeCount || 0} / {event.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>

            {/* Map Preview */}
            {event.location && (
              <AnimatedCard delay={0.3}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPinned className="w-5 h-5 text-[#00843D]" />
                      <h3 className="font-semibold text-gray-900">Location</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openDirections}
                      className="text-[#00843D] hover:text-[#006830]"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                  </div>
                  {/* Placeholder map - would be replaced with actual map component */}
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border border-gray-200 overflow-hidden">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">
                        {event.location}
                      </p>
                      <button
                        onClick={openDirections}
                        className="text-sm text-[#00843D] hover:text-[#006830] mt-2"
                      >
                        View on Google Maps →
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Past Attendance (for recurring events) */}
            {event.isRecurring && event.pastAttendance && (
              <AnimatedCard delay={0.4}>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#00843D]" />
                    <h3 className="font-semibold text-gray-900">
                      Attendance History
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {event.pastAttendance.map((attendance, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">
                          {new Date(attendance.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {attendance.attendeeCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <AnimatedCard delay={0.5}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#00843D]" />
                      <h3 className="font-semibold text-gray-900">Attendees</h3>
                    </div>
                    <Badge variant="secondary">{event.attendees.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayedAttendees?.map((attendee, index) => (
                      <motion.div
                        key={attendee.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar>
                          <AvatarFallback className="bg-[#00843D] text-white">
                            {getInitials(
                              attendee.firstName,
                              attendee.lastName,
                              attendee.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attendee.firstName && attendee.lastName
                              ? `${attendee.firstName} ${attendee.lastName}`
                              : attendee.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Checked in at{" "}
                            {new Date(attendee.checkedInAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {event.attendees.length > 8 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllAttendees(!showAllAttendees)}
                      className="w-full mt-4"
                    >
                      {showAllAttendees ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show All {event.attendees.length} Attendees
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </AnimatedCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <AnimatedCard delay={0.1} variant="hover-glow">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Actions</h4>
                <div className="space-y-3">
                  {/* Check-in or RSVP Button */}
                  {!isPast && event.isActive && (
                    <>
                      {userAttendanceStatus === "not_registered" &&
                        !isFullCapacity &&
                        onRSVP && (
                          <AnimatedButton
                            variant="secondary"
                            onClick={() => onRSVP(event.id)}
                            className="w-full"
                            animationType="scale"
                            icon={<UserPlus className="w-4 h-4" />}
                            iconPosition="left"
                          >
                            RSVP
                          </AnimatedButton>
                        )}
                      {(userAttendanceStatus === "registered" ||
                        userAttendanceStatus === "not_registered") &&
                        onCheckIn && (
                          <AnimatedButton
                            variant="primary"
                            onClick={() => onCheckIn(event.id)}
                            className="w-full bg-[#00843D] hover:bg-[#006830]"
                            animationType="glow"
                            icon={<QrCode className="w-4 h-4" />}
                            iconPosition="left"
                          >
                            Check In Now
                          </AnimatedButton>
                        )}
                    </>
                  )}

                  {/* Share Button */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-full"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Event
                    </Button>

                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20"
                        >
                          <button
                            onClick={copyEventLink}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <LinkIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">
                              Copy Link
                            </span>
                          </button>
                          <button
                            onClick={addToCalendar}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">
                              Add to Calendar
                            </span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Edit Button (Admin) */}
                  {canEdit && onEdit && (
                    <Button
                      variant="outline"
                      onClick={() => onEdit(event.id)}
                      className="w-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </Button>
                  )}
                </div>
              </div>
            </AnimatedCard>

            {/* Quick Stats */}
            <AnimatedCard delay={0.2}>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-900">
                      Current Attendees
                    </span>
                    <span className="font-bold text-blue-900">
                      {event.attendeeCount || 0}
                    </span>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-purple-900">
                        Spots Available
                      </span>
                      <span className="font-bold text-purple-900">
                        {Math.max(
                          0,
                          event.capacity - (event.attendeeCount || 0)
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-900">Status</span>
                    <Badge
                      className={
                        isPast
                          ? "bg-gray-500 text-white"
                          : event.isActive
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 text-white"
                      }
                    >
                      {isPast
                        ? "Completed"
                        : event.isActive
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Created By */}
            {event.createdBy && (
              <AnimatedCard delay={0.3}>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Event Organizer
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#00843D] text-white">
                        {getInitials(
                          event.createdBy.firstName,
                          event.createdBy.lastName,
                          event.createdBy.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.createdBy.firstName && event.createdBy.lastName
                          ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
                          : event.createdBy.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.createdBy.email}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <AnimatedCard delay={0.4}>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
