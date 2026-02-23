// Brutalist/Geometric Design System for NSBE UCF Events
import { useState } from "react";
import { motion } from "framer-motion";
import { EventCard } from "./EventCard";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Plus, Calendar, Zap } from "lucide-react";
import { Bricolage_Grotesque, Sora } from "next/font/google";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";

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

interface EventsPageProps {
  events: any[];
  onViewDetails: (eventId: string) => void;
  onCheckIn?: (eventId: string) => void;
  onCreateEvent?: () => void;
  userRole?: "member" | "admin" | "super_admin";
}

export function EventsPage({
  events,
  onViewDetails,
  onCheckIn,
  onCreateEvent,
  userRole = "member",
}: EventsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const canCreateEvents = userRole === "admin" || userRole === "super_admin";

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || event.category === categoryFilter;

    let matchesTime = true;
    const filterNow = new Date();
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    if (timeFilter === "upcoming") {
      matchesTime = eventStart > filterNow;
    } else if (timeFilter === "today") {
      matchesTime = eventStart.toDateString() === filterNow.toDateString();
    } else if (timeFilter === "past") {
      matchesTime = eventEnd < filterNow;
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Group events by time
  const now = new Date();
  const upcomingEvents = filteredEvents
    .filter((e) => new Date(e.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const pastEvents = filteredEvents
    .filter((e) => new Date(e.endTime) < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const todayEvents = filteredEvents
    .filter((e) => new Date(e.startTime).toDateString() === now.toDateString())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div
      className={`${bricolage.variable} ${sora.variable} min-h-screen relative overflow-hidden font-sans`}
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Brutalist background with geometric shapes */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />
        <motion.div
          animate={{
            rotate: [0, 2, -2, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 -right-24 w-[600px] h-[600px] bg-[#ffb81c] opacity-15"
          style={{
            clipPath: "polygon(40% 0%, 100% 0%, 60% 100%, 0% 100%)",
            transform: "rotate(-15deg)",
          }}
        />
        <motion.div
          animate={{
            rotate: [0, -3, 3, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-[#ed1c24] opacity-12"
          style={{
            clipPath: "polygon(0% 0%, 60% 0%, 100% 100%, 40% 100%)",
            transform: "rotate(12deg)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2
                className={`text-4xl lg:text-5xl font-extrabold text-white ${bricolage.className} tracking-tight`}
              >
                Events
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ed1c24] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Zap className="w-4 h-4 text-black" />
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${bricolage.className} text-black`}
                >
                  Discover
                </span>
              </div>
            </div>
            <p
              className={`text-white/90 ${sora.className} text-lg`}
            >
              Browse and check in to NSBE events
            </p>
          </div>
          {canCreateEvents && onCreateEvent && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "8px 8px 0 0 rgba(0,0,0,1)",
                x: 4,
                y: 4,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateEvent}
              className="bg-[#00a651] text-white px-6 py-3 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              <Plus className="w-5 h-5" />
              Create Event
            </motion.button>
          )}
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontFamily: "var(--font-sora)" }}
                  className="pl-11 bg-black/5 border-2 border-black text-black placeholder:text-black/40 focus:border-[#00a651] focus:ring-0 h-12 hover:bg-black/10 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-black/5 border-2 border-black text-black h-12 hover:bg-black/10 transition-all font-medium" style={{ fontFamily: "var(--font-sora)" }}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="bg-black/5 border-2 border-black text-black h-12 hover:bg-black/10 transition-all font-medium" style={{ fontFamily: "var(--font-sora)" }}>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters */}
          {(searchQuery ||
            categoryFilter !== "all" ||
            timeFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm flex items-center gap-2"
                >
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
              {categoryFilter !== "all" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm flex items-center gap-2"
                >
                  Category: {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className="hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
              {timeFilter !== "all" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm flex items-center gap-2"
                >
                  Time: {timeFilter}
                  <button
                    onClick={() => setTimeFilter("all")}
                    className="hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </div>
          )}
          </div>
        </motion.div>

        {/* Events list */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-12 text-center">
              <Calendar className="w-16 h-16 text-black/30 mx-auto mb-4" />
              <h4
                className={`text-black text-xl font-extrabold mb-2 ${bricolage.className} uppercase`}
              >
                No events found
              </h4>
              <p
                className={`${sora.className} text-black/70 font-medium`}
              >
                Try adjusting your search or filters
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Today's events */}
            {timeFilter === "all" && todayEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-white text-xl font-bold">
                    Today&apos;s Events
                  </h3>
                  <div className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium border border-blue-400/30">
                    {todayEvents.length}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {todayEvents.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                      className="h-full"
                    >
                      <EventCard
                        event={event}
                        onViewDetails={onViewDetails}
                        onCheckIn={onCheckIn}
                                                showCheckIn={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Upcoming events */}
            {(timeFilter === "all" || timeFilter === "upcoming") &&
              upcomingEvents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-white text-xl font-bold">
                      Upcoming Events
                    </h3>
                    <div className="px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-green-100 text-sm font-medium border border-green-400/30">
                      {upcomingEvents.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5 }}
                        className="h-full"
                      >
                        <EventCard
                          event={event}
                          onViewDetails={onViewDetails}
                          onCheckIn={onCheckIn}
                                                    showCheckIn={true}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

            {/* Past events */}
            {(timeFilter === "all" || timeFilter === "past") &&
              pastEvents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-white text-xl font-bold">
                      Past Events
                    </h3>
                    <div className="px-3 py-1 bg-gray-500/20 backdrop-blur-sm rounded-full text-gray-100 text-sm font-medium border border-gray-400/30">
                      {pastEvents.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastEvents.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5 }}
                        className="h-full"
                      >
                        <EventCard
                          event={event}
                          onViewDetails={onViewDetails}
                          onCheckIn={onCheckIn}
                                                    showCheckIn={false}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
