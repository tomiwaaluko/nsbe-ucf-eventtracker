import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Tag } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface Event {
  id: string;
  name: string;
  description?: string;
  category: "COMMUNITY_SERVICE" | "GBM" | "SOCIAL_AEX";
  startTime: Date;
  endTime: Date;
  location?: string;
  attendeeCount?: number;
  isActive: boolean;
}

interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
  onCheckIn?: (eventId: string) => void;
  showCheckIn?: boolean;
}

const categoryConfig = {
  COMMUNITY_SERVICE: {
    label: "Community Service",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "🤝",
  },
  GBM: {
    label: "General Body Meeting",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "📢",
  },
  SOCIAL_AEX: {
    label: "Workshop / Social",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: "🎓",
  },
};

export function EventCard({
  event,
  onViewDetails,
  onCheckIn,
  showCheckIn = false,
}: EventCardProps) {
  const config = categoryConfig[event.category];
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
      className={`bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all ${
        isPast ? "opacity-75" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{config.icon}</span>
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
          <h4 className="text-gray-900 mb-1">{event.name}</h4>
          {event.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Event details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            {formatTime(startDate)} - {formatTime(endDate)}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{event.location}</span>
          </div>
        )}
        {event.attendeeCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{event.attendeeCount} attending</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
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
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Event ended</span>
        </div>
      )}
    </motion.div>
  );
}
