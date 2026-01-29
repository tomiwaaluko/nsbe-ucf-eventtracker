import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowLeft,
  QrCode,
  Edit,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { EVENT_CATEGORIES, EventCategory, getEventCategoryLabel, getEventCategoryColor } from "@/lib/constants/event-categories";

interface EventDetailPageProps {
  event: {
    id: string;
    name: string;
    description?: string;
    category: EventCategory;
    startTime: Date | string;
    endTime: Date | string;
    location?: string;
    isActive: boolean;
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
      checkedInAt: Date | string;
    }>;
  };
  onBack: () => void;
  onCheckIn?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  userRole?: "member" | "admin" | "super_admin";
}

/**
 * Get category configuration for display
 */
const getCategoryConfig = (category: EventCategory) => {
  const categoryData = EVENT_CATEGORIES.find((cat) => cat.value === category);
  
  // Map categories to Tailwind classes and icons
  const configMap: Record<EventCategory, { gradient: string; color: string; icon: string }> = {
    [EventCategory.GBM]: {
      gradient: "from-green-500 to-green-600",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: "📢",
    },
    [EventCategory.SOCIAL]: {
      gradient: "from-yellow-500 to-yellow-600",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: "🎉",
    },
    [EventCategory.WORKSHOP]: {
      gradient: "from-blue-500 to-blue-600",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: "🎓",
    },
    [EventCategory.FUNDRAISER]: {
      gradient: "from-red-500 to-red-600",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: "💰",
    },
    [EventCategory.COMMUNITY_SERVICE]: {
      gradient: "from-amber-700 to-amber-800",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: "🤝",
    },
    [EventCategory.COMMITTEE_PARTICIPATION]: {
      gradient: "from-purple-500 to-purple-600",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: "👥",
    },
  };
  
  const config = configMap[category] || {
    gradient: "from-gray-500 to-gray-600",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: "📅",
  };
  
  return {
    label: getEventCategoryLabel(category),
    ...config,
  };
};

export function EventDetailPage({
  event,
  onBack,
  onCheckIn,
  onEdit,
  userRole = "member",
}: EventDetailPageProps) {
  const config = getCategoryConfig(event.category);
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isPast = endDate < new Date();
  const isToday = startDate.toDateString() === new Date().toDateString();
  const canEdit = userRole === "admin" || userRole === "super_admin";

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

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Button>

      {/* Hero section */}
      <div
        className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-8 text-white relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 text-9xl opacity-10">
          {config.icon}
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
              {config.label}
            </Badge>
            {isToday && !isPast && (
              <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                Today
              </Badge>
            )}
            {isPast && (
              <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                Past Event
              </Badge>
            )}
          </div>
          <h1 className="text-white mb-4">{event.name}</h1>
          {event.description && (
            <p className="text-white text-opacity-90 max-w-2xl text-lg">
              {event.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <h3 className="text-gray-900 mb-4">Event Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900">{formatDate(startDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-gray-900">
                    {formatTime(startDate)} - {formatTime(endDate)}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <Tag className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900">{config.label}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attendees - Only visible to admins */}
          {canEdit && event.attendees && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Attendee List</h3>
                <Badge>{event.attendees.length}</Badge>
              </div>
              {event.attendees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {event.attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-[#00a651] text-white">
                          {getInitials(
                            attendee.firstName,
                            attendee.lastName,
                            attendee.email
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No attendees yet</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <h4 className="text-gray-900 mb-4">Actions</h4>
            <div className="space-y-3">
              {!isPast && event.isActive && onCheckIn && (
                <Button
                  onClick={() => onCheckIn(event.id)}
                  className="w-full bg-[#00a651] hover:bg-[#008a44] text-white gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Check In
                </Button>
              )}
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(event.id)}
                  className="w-full gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Event
                </Button>
              )}
            </div>
          </motion.div>

          {/* Created by */}
          {event.createdBy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
            >
              <h4 className="text-gray-900 mb-4">Created By</h4>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-[#00a651] text-white">
                    {getInitials(
                      event.createdBy.firstName,
                      event.createdBy.lastName,
                      event.createdBy.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-900">
                    {event.createdBy.firstName && event.createdBy.lastName
                      ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
                      : event.createdBy.email}
                  </p>
                  <p className="text-xs text-gray-500">Event Organizer</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
