import {
  Users,
  Calendar,
  UserCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AdminDashboardProps {
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalEvents: number;
    upcomingEvents: number;
    totalAttendance: number;
    averageAttendance: number;
    membersWithOneOneOne: number;
    membersWithThreeThreeThree: number;
  };
  attendanceRecords: any[];
  onNavigate: (page: string) => void;
}

export function AdminDashboard({
  stats,
  attendanceRecords,
  onNavigate,
}: AdminDashboardProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Growth data - empty, should come from real data
  const memberGrowthData: { month: string; members: number }[] = [];

  const eventAttendanceData: { month: string; attendance: number }[] = [];

  const eventTypeData: { name: string; value: number; color: string }[] = [];

  // Activity heatmap data - generate from actual attendance records across all members
  const months: string[] = [];

  // Generate all heatmap data once using useMemo
  const allHeatmapData = useMemo(() => {
    if (months.length === 0) {
      return [];
    }

    // Create a Set of dates when any member attended events
    const attendedDates = new Set(
      attendanceRecords.map((record) => {
        const date = new Date(record.checkedInAt);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      })
    );

    return months.map((month, monthIndex) => {
      const data = [];
      const date = new Date(month);
      const year = date.getFullYear();
      const monthNumber = date.getMonth() + 1;
      const numDays = new Date(year, monthNumber, 0).getDate();
      const monthName = month.split(' ')[0];

      for (let day = 1; day <= numDays; day++) {
        const dateKey = `${year}-${monthNumber}-${day}`;
        const hasEvent = attendedDates.has(dateKey) ? 1 : 0;
        data.push({
          day,
          hasEvent,
          date: `${monthName} ${day}`,
        });
      }
      return data;
    });
  }, [attendanceRecords, months]);

  const getHeatmapColor = (hasEvent: number) => {
    return hasEvent === 1 ? "#00a651" : "#e5e7eb";
  };

  const recentActivityData: {
    type: string;
    name: string;
    attendees: number;
    date: string;
  }[] = [];

  const progressStats = [
    {
      label: "1-1-1 Achievement",
      value: stats.membersWithOneOneOne,
      total: stats.activeMembers,
      percentage: (
        (stats.membersWithOneOneOne / stats.activeMembers) *
        100
      ).toFixed(1),
      color: "#00a651",
    },
    {
      label: "3-3-3 Achievement",
      value: stats.membersWithThreeThreeThree,
      total: stats.activeMembers,
      percentage: (
        (stats.membersWithThreeThreeThree / stats.activeMembers) *
        100
      ).toFixed(1),
      color: "#ffb81c",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/80">
            Monitor member engagement and event analytics
          </p>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Members"
            value={stats.totalMembers}
            icon={<Users className="w-6 h-6" />}
            color="#00a651"
            subtitle={`${stats.activeMembers} active`}
          />
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<Calendar className="w-6 h-6" />}
            color="#ffb81c"
            subtitle={`${stats.upcomingEvents} upcoming`}
          />
          <StatsCard
            title="Total Attendance"
            value={stats.totalAttendance}
            icon={<UserCheck className="w-6 h-6" />}
            color="#ed1c24"
            subtitle="This semester"
          />
          <StatsCard
            title="Avg. Attendance"
            value={stats.averageAttendance}
            icon={<Activity className="w-6 h-6" />}
            color="#00a651"
            subtitle="Per event"
          />
        </motion.div>

        {/* Achievement Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Member Achievement Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progressStats.map((stat, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/90">{stat.label}</span>
                  <span className="text-sm text-white font-semibold">
                    {stat.value} / {stat.total} ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                    className="h-3 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Growth Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
          >
            <h4 className="text-lg font-semibold text-white mb-4">
              Member Growth
            </h4>
            {memberGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={memberGrowthData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "1rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="#ffb81c"
                  strokeWidth={3}
                  dot={{ fill: "#ffb81c", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-white/70">
                No growth data available
              </div>
            )}
          </motion.div>

          {/* Event Attendance Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
          >
            <h4 className="text-lg font-semibold text-white mb-4">
              Event Attendance Trend
            </h4>
            {eventAttendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventAttendanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "1rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="attendance"
                  fill="#ffb81c"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-white/70">
                No attendance data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Event Distribution & Activity Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
          >
            <h4 className="text-lg font-semibold text-white mb-4">
              Event Distribution
            </h4>
            {eventTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.name || ""}: ${(
                      (entry.percent || 0) * 100
                    ).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "1rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-white/70">
                No event distribution data available
              </div>
            )}
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">
                Event Activity
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))
                  }
                  disabled={currentMonthIndex === 0 || months.length === 0}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-white/90 min-w-[120px] text-center">
                  {months.length > 0 ? months[currentMonthIndex] : "No data"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonthIndex(
                      Math.min(months.length - 1, currentMonthIndex + 1)
                    )
                  }
                  disabled={currentMonthIndex === months.length - 1 || months.length === 0}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Heatmap Grid */}
              {allHeatmapData.length > 0 && allHeatmapData[currentMonthIndex] ? (
                <div className="grid grid-cols-7 gap-x-0.5 gap-y-1">
                  {allHeatmapData[currentMonthIndex].map((item) => (
                  <motion.div
                    key={item.day}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + item.day * 0.005 }}
                    className="w-10 h-10 rounded-lg relative group cursor-pointer transition-all hover:ring-2 hover:ring-[#ffb81c] hover:scale-110"
                    style={{
                      backgroundColor: getHeatmapColor(item.hasEvent),
                    }}
                    title={`${item.date}: ${
                      item.hasEvent ? "Event attended" : "No event"
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {item.day}
                      </span>
                    </div>
                  </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/70">
                  No activity data available
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-gray-300" />
                  <span className="text-xs text-white/80">No event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#00a651]" />
                  <span className="text-xs text-white/80">Event attended</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Recent Events</h4>
            <Button
              variant="ghost"
              onClick={() => onNavigate("admin-events")}
              className="text-white hover:bg-white/20"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivityData.length > 0 ? (
              recentActivityData.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {activity.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{
                        backgroundColor:
                          activity.type === "Workshop"
                            ? "#ffb81c40"
                            : activity.type === "GBM"
                            ? "#00a65140"
                            : "#ed1c2440",
                        color: "white",
                      }}
                    >
                      {activity.type}
                    </span>
                    <span className="text-xs text-white/70">
                      {activity.date}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white font-semibold">
                      {activity.attendees}
                    </span>
                  </div>
                </div>
              </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-white/70">
                No recent events available
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <h4 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("admin-events")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-xl h-auto py-6 transition-all shadow-lg"
            >
              <div className="flex flex-col items-center gap-2">
                <Calendar className="w-6 h-6" />
                <span className="font-medium">Create Event</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("admin-checkin")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-xl h-auto py-6 transition-all shadow-lg"
            >
              <div className="flex flex-col items-center gap-2">
                <UserCheck className="w-6 h-6" />
                <span className="font-medium">Manual Check-In</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("admin-members")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-xl h-auto py-6 transition-all shadow-lg"
            >
              <div className="flex flex-col items-center gap-2">
                <Users className="w-6 h-6" />
                <span className="font-medium">Manage Members</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("admin-attendance")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-xl h-auto py-6 transition-all shadow-lg"
            >
              <div className="flex flex-col items-center gap-2">
                <Activity className="w-6 h-6" />
                <span className="font-medium">Attendance Logs</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
