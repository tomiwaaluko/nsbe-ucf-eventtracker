import { useState } from "react";
import {
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
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

interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  eventId: string;
  eventName: string;
  eventType: "WORKSHOP" | "GBM" | "COMMUNITY_SERVICE";
  checkInTime: string;
  checkInMethod: "QR_CODE" | "MANUAL";
  checkedInBy?: string;
}

interface AttendanceLogsProps {
  attendanceRecords: AttendanceRecord[];
}

export function AttendanceLogs({ attendanceRecords }: AttendanceLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEventType, setFilterEventType] = useState<string>("all");
  const [filterCheckInMethod, setFilterCheckInMethod] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("checkInTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 15;

  // Filter records
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.memberEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.eventName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEventType =
      filterEventType === "all" || record.eventType === filterEventType;

    const matchesCheckInMethod =
      filterCheckInMethod === "all" ||
      record.checkInMethod === filterCheckInMethod;

    // Date range filtering (simplified - in production would use actual date ranges)
    const checkInDate = new Date(record.checkInTime);
    const now = new Date();
    let matchesDateRange = true;

    if (filterDateRange === "today") {
      matchesDateRange =
        checkInDate.toDateString() === now.toDateString();
    } else if (filterDateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDateRange = checkInDate >= weekAgo;
    } else if (filterDateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDateRange = checkInDate >= monthAgo;
    }

    return matchesSearch && matchesEventType && matchesCheckInMethod && matchesDateRange;
  });

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "checkInTime":
        compareValue =
          new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
        break;
      case "memberName":
        compareValue = a.memberName.localeCompare(b.memberName);
        break;
      case "eventName":
        compareValue = a.eventName.localeCompare(b.eventName);
        break;
      default:
        compareValue = 0;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = sortedRecords.slice(startIndex, endIndex);

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

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Member Name",
      "Member Email",
      "Event Name",
      "Event Type",
      "Check-In Time",
      "Check-In Method",
      "Checked In By",
    ];

    const csvData = filteredRecords.map((record) => [
      record.memberName,
      record.memberEmail,
      record.eventName,
      getEventTypeLabel(record.eventType),
      formatDateTime(record.checkInTime),
      record.checkInMethod === "QR_CODE" ? "QR Code" : "Manual",
      record.checkedInBy || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Attendance Logs</h2>
          <p className="text-gray-600 mt-1">
            View and export all check-in records
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          variant="outline"
          className="border-[#00a651] text-[#00a651] hover:bg-[#00a651] hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by member name, email, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Event Type Filter */}
          <Select value={filterEventType} onValueChange={setFilterEventType}>
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

          {/* Check-In Method Filter */}
          <Select
            value={filterCheckInMethod}
            onValueChange={setFilterCheckInMethod}
          >
            <SelectTrigger>
              <SelectValue placeholder="Check-In Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="QR_CODE">QR Code</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select value={filterDateRange} onValueChange={setFilterDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {sortedRecords.length} of {attendanceRecords.length} records
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("memberName")}
                >
                  <div className="flex items-center gap-2">
                    Member
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("eventName")}
                >
                  <div className="flex items-center gap-2">
                    Event
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th
                  className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("checkInTime")}
                >
                  <div className="flex items-center gap-2">
                    Check-In Time
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Officer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{record.memberName}</p>
                      <p className="text-xs text-gray-500">{record.memberEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{record.eventName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      style={{
                        backgroundColor: `${getEventTypeColor(record.eventType)}20`,
                        color: getEventTypeColor(record.eventType),
                      }}
                    >
                      {getEventTypeLabel(record.eventType)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDateTime(record.checkInTime)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        record.checkInMethod === "QR_CODE" ? "default" : "secondary"
                      }
                    >
                      {record.checkInMethod === "QR_CODE" ? "QR Code" : "Manual"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {record.checkedInBy || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {paginatedRecords.map((record) => (
            <div key={record.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-900">{record.memberName}</p>
                  <p className="text-xs text-gray-500">{record.memberEmail}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{record.eventName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    style={{
                      backgroundColor: `${getEventTypeColor(record.eventType)}20`,
                      color: getEventTypeColor(record.eventType),
                    }}
                  >
                    {getEventTypeLabel(record.eventType)}
                  </Badge>
                  <Badge
                    variant={
                      record.checkInMethod === "QR_CODE" ? "default" : "secondary"
                    }
                  >
                    {record.checkInMethod === "QR_CODE" ? "QR Code" : "Manual"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDateTime(record.checkInTime)}
                  </span>
                </div>
                {record.checkedInBy && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Officer: {record.checkedInBy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedRecords.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No attendance records found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedRecords.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedRecords.length)}{" "}
            of {sortedRecords.length} records
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
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
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
                );
              })}
              {totalPages > 5 && <span className="text-gray-500">...</span>}
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
