import { useState } from "react";
import { EventCard } from "./EventCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Filter, Plus, Calendar } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Events</h2>
          <p className="text-gray-600 mt-1">
            Browse and check in to NSBE events
          </p>
        </div>
        {canCreateEvents && onCreateEvent && (
          <Button
            onClick={onCreateEvent}
            className="bg-[#00a651] hover:bg-[#008a44] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
        <div className="flex flex-wrap gap-2 mt-4">
          {searchQuery && (
            <Badge variant="secondary" className="gap-2">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery("")}>×</button>
            </Badge>
          )}
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="gap-2">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter("all")}>×</button>
            </Badge>
          )}
          {timeFilter !== "all" && (
            <Badge variant="secondary" className="gap-2">
              Time: {timeFilter}
              <button onClick={() => setTimeFilter("all")}>×</button>
            </Badge>
          )}
        </div>
      </div>

      {/* Events list */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-gray-900 mb-2">No events found</h4>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Today's events */}
          {timeFilter === "all" && todayEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-gray-900">Today's Events</h3>
                <Badge className="bg-blue-100 text-blue-700">
                  {todayEvents.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={onViewDetails}
                    onCheckIn={onCheckIn}
                    showCheckIn={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming events */}
          {(timeFilter === "all" || timeFilter === "upcoming") &&
            upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-gray-900">Upcoming Events</h3>
                  <Badge className="bg-green-100 text-green-700">
                    {upcomingEvents.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewDetails={onViewDetails}
                      onCheckIn={onCheckIn}
                      showCheckIn={true}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Past events */}
          {(timeFilter === "all" || timeFilter === "past") &&
            pastEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-gray-900">Past Events</h3>
                  <Badge className="bg-gray-100 text-gray-700">
                    {pastEvents.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewDetails={onViewDetails}
                      onCheckIn={onCheckIn}
                      showCheckIn={false}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
