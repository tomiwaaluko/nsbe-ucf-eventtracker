import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  QrCode,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Event {
  id: string;
  name: string;
  description: string;
  eventType: "WORKSHOP" | "GBM" | "COMMUNITY_SERVICE";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  attendees: number;
  qrSecret: string;
  isActive: boolean;
}

interface EventManagementProps {
  events: Event[];
  onCreateEvent: () => void;
  onEditEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEvent: (eventId: string) => void;
  onViewQRCode?: (eventId: string) => void;
}

export function EventManagement({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEvent,
  onViewQRCode,
}: EventManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter events
  const filteredEvents = Array.isArray(events)
    ? events.filter((event) => {
        const matchesSearch =
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
          filterType === "all" || event.eventType === filterType;
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "active" && event.isActive) ||
          (filterStatus === "inactive" && !event.isActive);
        return matchesSearch && matchesType && matchesStatus;
      })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // Assume timeString is in format "HH:MM"
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-white">Event Management</h2>
            <p className="text-white/80 mt-1">
              Manage all NSBE events and attendance
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateEvent}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-xl px-6 py-3 flex items-center gap-2 transition-all shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </motion.button>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  type="text"
                  placeholder="Search events by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                />
              </div>
            </div>

            {/* Event Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="WORKSHOP">Workshop</SelectItem>
                <SelectItem value="GBM">GBM</SelectItem>
                <SelectItem value="COMMUNITY_SERVICE">
                  Community Service
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Event Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Attendance
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedEvents.map((event, index) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="hover:bg-white/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {event.name}
                        </p>
                        <p className="text-xs text-white/60 mt-1 line-clamp-1">
                          {event.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        style={{
                          backgroundColor: `${getEventTypeColor(
                            event.eventType
                          )}40`,
                          color: "white",
                        }}
                        className="font-medium"
                      >
                        {getEventTypeLabel(event.eventType)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white font-medium">
                          {formatDate(event.date)}
                        </p>
                        <p className="text-white/70">
                          {formatTime(event.startTime)} -{" "}
                          {formatTime(event.endTime)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/90">
                          {event.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/90">
                          {event.attendees} / {event.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={event.isActive ? "default" : "secondary"}
                        className={
                          event.isActive
                            ? "bg-green-500/30 text-white border-green-500/50"
                            : "bg-white/20 text-white/70"
                        }
                      >
                        {event.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewEvent(event.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {onViewQRCode && (
                            <DropdownMenuItem
                              onClick={() => onViewQRCode(event.id)}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              View QR Code
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEditEvent(event.id)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteEvent(event.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-white/10">
            {paginatedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">
                      {event.name}
                    </h4>
                    <p className="text-xs text-white/60 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewEvent(event.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {onViewQRCode && (
                        <DropdownMenuItem onClick={() => onViewQRCode(event.id)}>
                          <QrCode className="w-4 h-4 mr-2" />
                          View QR Code
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEditEvent(event.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteEvent(event.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge
                    style={{
                      backgroundColor: `${getEventTypeColor(
                        event.eventType
                      )}40`,
                      color: "white",
                    }}
                  >
                    {getEventTypeLabel(event.eventType)}
                  </Badge>
                  <Badge
                    variant={event.isActive ? "default" : "secondary"}
                    className={
                      event.isActive
                        ? "bg-green-500/30 text-white border-green-500/50"
                        : "bg-white/20 text-white/70"
                    }
                  >
                    {event.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(event.date)} • {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.attendees} / {event.capacity} attendees
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/80">No events found</p>
              <p className="text-sm text-white/60 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between"
          >
            <p className="text-sm text-white/80">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredEvents.length)} of{" "}
              {filteredEvents.length} events
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-white/30 hover:bg-white/40 text-white border-white/20"
                          : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
