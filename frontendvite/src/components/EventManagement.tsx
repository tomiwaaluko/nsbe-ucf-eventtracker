import { useState } from "react";
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
}

export function EventManagement({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEvent,
}: EventManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || event.eventType === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && event.isActive) ||
      (filterStatus === "inactive" && !event.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Event Management</h2>
          <p className="text-gray-600 mt-1">
            Manage all NSBE events and attendance
          </p>
        </div>
        <Button
          onClick={onCreateEvent}
          className="bg-[#00a651] hover:bg-[#008a44] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Event Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="WORKSHOP">Workshop</SelectItem>
              <SelectItem value="GBM">GBM</SelectItem>
              <SelectItem value="COMMUNITY_SERVICE">Community Service</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{event.name}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      style={{
                        backgroundColor: `${getEventTypeColor(event.eventType)}20`,
                        color: getEventTypeColor(event.eventType),
                      }}
                    >
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{formatDate(event.date)}</p>
                      <p className="text-gray-500">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {event.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {event.attendees} / {event.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={event.isActive ? "default" : "secondary"}
                      className={
                        event.isActive ? "bg-green-100 text-green-700" : ""
                      }
                    >
                      {event.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewEvent(event.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {paginatedEvents.map((event) => (
            <div key={event.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">{event.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewEvent(event.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
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
                    backgroundColor: `${getEventTypeColor(event.eventType)}20`,
                    color: getEventTypeColor(event.eventType),
                  }}
                >
                  {getEventTypeLabel(event.eventType)}
                </Badge>
                <Badge
                  variant={event.isActive ? "default" : "secondary"}
                  className={event.isActive ? "bg-green-100 text-green-700" : ""}
                >
                  {event.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(event.date)} • {formatTime(event.startTime)} -{" "}
                    {formatTime(event.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.attendees} / {event.capacity} attendees
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No events found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of{" "}
            {filteredEvents.length} events
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-[#00a651] hover:bg-[#008a44] text-white"
                      : ""
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}