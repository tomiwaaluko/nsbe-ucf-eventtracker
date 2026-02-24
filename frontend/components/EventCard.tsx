import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getEventCategoryLabel, EventCategory } from "@/lib/constants/event-categories";
import { Bricolage_Grotesque, Sora } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

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
}

interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
  onCheckIn?: (eventId: string) => void;
  showCheckIn?: boolean;
}

const categoryConfig: Record<string, { label: string; bgColor: string; badgeColor: string }> = {
  GBM: {
    label: "General Body Meeting",
    bgColor: "#00a651",
    badgeColor: "bg-[#00a651]",
  },
  SOCIAL: {
    label: "Social",
    bgColor: "#ffb81c",
    badgeColor: "bg-[#ffb81c]",
  },
  WORKSHOP: {
    label: "Workshop",
    bgColor: "#00a651",
    badgeColor: "bg-[#00a651]",
  },
  FUNDRAISER: {
    label: "Fundraiser",
    bgColor: "#ed1c24",
    badgeColor: "bg-[#ed1c24]",
  },
  COMMUNITY_SERVICE: {
    label: "Community Service",
    bgColor: "#ed1c24",
    badgeColor: "bg-[#ed1c24]",
  },
  COMMITTEE_PARTICIPATION: {
    label: "Committee Participation",
    bgColor: "#ffb81c",
    badgeColor: "bg-[#ffb81c]",
  },
};

export function EventCard({
  event,
  onViewDetails,
  onCheckIn,
  showCheckIn = false,
}: EventCardProps) {
  const config = categoryConfig[event.category] || {
    label: getEventCategoryLabel(event.category),
    bgColor: "#00a651",
    badgeColor: "bg-[#00a651]",
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

  const formatDateLarge = (date: Date) => {
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const dateDisplay = formatDateLarge(startDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4, y: -4, transition: { duration: 0.2 } }}
      className={`${bricolage.variable} ${sora.variable} relative h-full ${
        isPast ? "opacity-75" : ""
      }`}
    >
      {/* Brutalist shadow */}
      <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />

      {/* Card content */}
      <div className="relative bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] h-full flex flex-col">
        {/* Color bar and date stamp */}
        <div
          className="h-3 border-b-4 border-black"
          style={{ backgroundColor: config.bgColor }}
        />

        <div className="flex p-4 sm:p-5 flex-col h-full">
          {/* Date stamp and category */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Large date display */}
            <div className="flex-shrink-0">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-black flex flex-col items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                style={{ backgroundColor: config.bgColor }}
              >
                <span className={`text-xs font-bold text-white ${bricolage.className}`}>
                  {dateDisplay.month}
                </span>
                <span className={`text-2xl sm:text-3xl font-extrabold text-white ${bricolage.className} leading-none`}>
                  {dateDisplay.day}
                </span>
              </div>
            </div>

            {/* Category and status badges */}
            <div className="flex flex-col gap-2 items-end flex-shrink min-w-0">
              <div className={`${config.badgeColor} border-2 border-black px-3 py-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}>
                <span className={`text-xs font-bold uppercase text-white ${bricolage.className} whitespace-nowrap`}>
                  {config.label}
                </span>
              </div>
              {isToday && !isPast && (
                <div className="bg-[#ffb81c] border-2 border-black px-3 py-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-black" />
                  <span className={`text-xs font-bold uppercase text-black ${bricolage.className}`}>
                    Today
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Event name */}
          <h4 className={`text-black text-lg sm:text-xl font-extrabold mb-2 line-clamp-2 ${bricolage.className}`}>
            {event.name}
          </h4>

          {/* Description */}
          {event.description && (
            <p className={`text-sm text-black/70 mb-4 line-clamp-2 ${sora.className} font-medium`}>
              {event.description}
            </p>
          )}

          {/* Event details - More prominent */}
          <div className="space-y-3 mb-4 flex-1 mt-auto">
            {/* Time */}
            <div className="border-2 border-black bg-black/5 p-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs uppercase text-black/60 font-bold ${bricolage.className}`}>
                    Time
                  </p>
                  <p className={`text-sm font-bold text-black ${sora.className} truncate`}>
                    {formatTime(startDate)} - {formatTime(endDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="border-2 border-black bg-black/5 p-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs uppercase text-black/60 font-bold ${bricolage.className}`}>
                      Location
                    </p>
                    <p className={`text-sm font-bold text-black ${sora.className} truncate`}>
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Attendee count */}
            {event.attendeeCount !== undefined && (
              <div className="flex items-center gap-2 px-2">
                <Users className="w-4 h-4 text-black/60 flex-shrink-0" />
                <span className={`text-sm font-bold text-black/70 ${sora.className}`}>
                  {event.attendeeCount} attending
                </span>
              </div>
            )}
          </div>

          {/* Actions - Brutalist buttons */}
          <div className="flex gap-3 mt-4 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewDetails(event.id)}
              className={`flex-1 border-3 border-black bg-white text-black px-4 py-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all font-bold uppercase text-xs sm:text-sm ${bricolage.className} border-4`}
            >
              Details
            </motion.button>
            {showCheckIn && !isPast && event.isActive && onCheckIn && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCheckIn(event.id)}
                className={`flex-1 border-4 border-black bg-[#00a651] text-white px-4 py-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all font-bold uppercase text-xs sm:text-sm ${bricolage.className}`}
              >
                Check In
              </motion.button>
            )}
          </div>

          {isPast && (
            <div className="mt-3 pt-3 border-t-2 border-black/20 flex-shrink-0">
              <span className={`text-xs text-black/50 uppercase font-bold ${bricolage.className}`}>
                Event Ended
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
