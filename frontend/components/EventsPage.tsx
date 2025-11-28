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
import { Search, Plus, Calendar, Sparkles } from "lucide-react";

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
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    if (timeFilter === "upcoming") {
      matchesTime = eventStart > now;
    } else if (timeFilter === "today") {
      matchesTime = eventStart.toDateString() === now.toDateString();
    } else if (timeFilter === "past") {
      matchesTime = eventEnd < now;
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Group events by time
  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.startTime) > new Date()
  );
  const pastEvents = filteredEvents.filter(
    (e) => new Date(e.endTime) < new Date()
  );
  const todayEvents = filteredEvents.filter(
    (e) => new Date(e.startTime).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830]">
        {/* Animated orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-[#ffb81c] rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-[#ed1c24] rounded-full blur-3xl opacity-20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white">Events</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-[#ffb81c]" />
                <span className="text-sm font-medium text-white">Discover</span>
              </div>
            </div>
            <p className="text-white/80">Browse and check in to NSBE events</p>
          </div>
          {canCreateEvents && onCreateEvent && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateEvent}
              className="bg-white text-[#00a651] px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </motion.button>
          )}
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl h-12 hover:bg-white/15 transition-all"
                />
              </div>
            </div>

            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl hover:bg-white/15 transition-all">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="GBM">General Body Meetings</SelectItem>
                  <SelectItem value="SOCIAL_AEX">Workshops / Social</SelectItem>
                  <SelectItem value="COMMUNITY_SERVICE">
                    Community Service
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl hover:bg-white/15 transition-all">
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
        </motion.div>

        {/* Events list */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/20 shadow-2xl"
          >
            <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h4 className="text-white text-xl font-semibold mb-2">
              No events found
            </h4>
            <p className="text-white/70">
              Try adjusting your search or filters
            </p>
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
