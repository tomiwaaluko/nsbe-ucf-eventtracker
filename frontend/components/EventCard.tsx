import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Tag, Check, CalendarPlus, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getEventCategoryLabel, EventCategory } from "@/lib/constants/event-categories";
import { useState } from "react";

interface Event {
  id: string;
  name: string;
  description?: string;
  category: EventCategory | string;
  startTime: Date | string;
  endTime: Date | string;
  location?: string;
  attendeeCount?: number;
  isActive: boolean;
  isPlanning?: boolean;
  plannedCount?: number;
  friendsPlanning?: Array<{ firstName: string; lastName: string }>;
}

interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
  onCheckIn?: (eventId: string) => void;
  onTogglePlan?: (eventId: string, currentlyPlanning: boolean) => void;
  showCheckIn?: boolean;
}

const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  GBM: {
    label: "General Body Meeting",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "",
  },
  SOCIAL: {
    label: "Social",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: "",
  },
  WORKSHOP: {
    label: "Workshop",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "",
  },
  FUNDRAISER: {
    label: "Fundraiser",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "",
  },
  COMMUNITY_SERVICE: {
    label: "Community Service",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: "",
  },
  COMMITTEE_PARTICIPATION: {
    label: "Committee Participation",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: "",
  },
};

export function EventCard({
  event,
  onViewDetails,
  onCheckIn,
  onTogglePlan,
  showCheckIn = false,
}: EventCardProps) {
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const config = categoryConfig[event.category] || {
    label: getEventCategoryLabel(event.category),
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: "",
  };
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isPast = endDate < new Date();
  const isToday = startDate.toDateString() === new Date().toDateString();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all h-full flex flex-col ${
        isPast ? "opacity-75" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {config.icon && <span className="text-2xl">{config.icon}</span>}
            <Badge className={config.color} variant="outline">
              {config.label}
            </Badge>
            {isToday && !isPast && (
              <Badge
                className="bg-blue-100 text-blue-700 border-blue-200"
                variant="outline"
              >
                Today
              </Badge>
            )}
          </div>
          <h4 className="text-gray-900 mb-1 font-semibold line-clamp-2">{event.name}</h4>
          <div className="min-h-[2.5rem]">
            {event.description ? (
              <p className="text-sm text-gray-500 line-clamp-2">
                {event.description}
              </p>
            ) : (
              <div className="text-sm text-gray-400">&nbsp;</div>
            )}
          </div>
        </div>
      </div>

      {/* Event details */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{formatDate(startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {formatTime(startDate)} - {formatTime(endDate)}
          </span>
        </div>
        <div className="min-h-[1.25rem]">
          {event.location ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          ) : null}
        </div>
        {event.attendeeCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{event.attendeeCount} attending</span>
          </div>
        )}
      </div>

      {/* Plan to Attend Section */}
      {!isPast && onTogglePlan && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {event.plannedCount || 0} planning
              </span>
              {event.friendsPlanning && event.friendsPlanning.length > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  {event.friendsPlanning.length} friend{event.friendsPlanning.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button
              variant={event.isPlanning ? "default" : "outline"}
              size="sm"
              onClick={async () => {
                setIsLoadingPlan(true);
                try {
                  await onTogglePlan(event.id, event.isPlanning || false);
                } finally {
                  setIsLoadingPlan(false);
                }
              }}
              disabled={isLoadingPlan}
              className={event.isPlanning ? "bg-[#00a651] hover:bg-[#008a44] text-white" : ""}
            >
              {isLoadingPlan ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Loading...
                </>
              ) : event.isPlanning ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Planning
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3 h-3 mr-1" />
                  Plan to Go
                </>
              )}
            </Button>
          </div>
          {event.friendsPlanning && event.friendsPlanning.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {event.friendsPlanning.slice(0, 3).map((friend, i) => (
                <span key={i}>
                  {friend.firstName} {friend.lastName}
                  {i < Math.min(2, event.friendsPlanning!.length - 1) ? ", " : ""}
                </span>
              ))}
              {event.friendsPlanning.length > 3 && ` +${event.friendsPlanning.length - 3} more`}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 flex-shrink-0">
        <Button
          variant="outline"
          onClick={() => onViewDetails(event.id)}
          className="flex-1"
        >
          View Details
        </Button>
        {showCheckIn && !isPast && event.isActive && onCheckIn && (
          <Button
            onClick={() => onCheckIn(event.id)}
            className="flex-1 bg-[#00a651] hover:bg-[#008a44] text-white"
          >
            Check In
          </Button>
        )}
      </div>

      {isPast && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex-shrink-0">
          <span className="text-xs text-gray-500">Event ended</span>
        </div>
      )}
    </motion.div>
  );
}
