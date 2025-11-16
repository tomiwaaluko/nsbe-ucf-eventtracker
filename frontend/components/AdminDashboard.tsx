import { useState } from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  Award,
  UserCheck,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Button } from "./ui/button";
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
  Legend,
} from "recharts";
import { Card } from "./ui/card";

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
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ stats, onNavigate }: AdminDashboardProps) {
  // Growth data (mock - would come from real data)
  const memberGrowthData = [
    { month: "Aug", members: 45 },
    { month: "Sep", members: 62 },
    { month: "Oct", members: 78 },
    { month: "Nov", members: 85 },
    { month: "Dec", members: 92 },
  ];

  const eventAttendanceData = [
    { month: "Aug", attendance: 120 },
    { month: "Sep", attendance: 185 },
    { month: "Oct", attendance: 210 },
    { month: "Nov", attendance: 245 },
    { month: "Dec", attendance: 280 },
  ];

  const eventTypeData = [
    { name: "Workshops", value: 45, color: "#ffb81c" },
    { name: "GBMs", value: 38, color: "#00a651" },
    { name: "Community Service", value: 32, color: "#ed1c24" },
  ];

  const recentActivityData = [
    {
      type: "Workshop",
      name: "Resume Building Workshop",
      attendees: 42,
      date: "2024-12-14",
    },
    {
      type: "GBM",
      name: "December General Body Meeting",
      attendees: 56,
      date: "2024-12-12",
    },
    {
      type: "Community Service",
      name: "Food Drive Volunteer Day",
      attendees: 28,
      date: "2024-12-10",
    },
    {
      type: "Workshop",
      name: "Technical Interview Prep",
      attendees: 35,
      date: "2024-12-08",
    },
  ];

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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00a651] to-[#008a44] rounded-2xl p-8 text-white">
        <h1 className="text-white mb-2">Admin Dashboard</h1>
        <p className="text-green-100">
          Monitor member engagement and event analytics
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Members"
          value={stats.totalMembers}
          icon={<Users className="w-6 h-6" />}
          color="#00a651"
          subtitle={`${stats.activeMembers} active`}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={<Calendar className="w-6 h-6" />}
          color="#ffb81c"
          subtitle={`${stats.upcomingEvents} upcoming`}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Attendance"
          value={stats.totalAttendance}
          icon={<UserCheck className="w-6 h-6" />}
          color="#ed1c24"
          subtitle="This semester"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Avg. Attendance"
          value={stats.averageAttendance}
          icon={<Activity className="w-6 h-6" />}
          color="#00a651"
          subtitle="Per event"
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Achievement Progress */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-gray-900 mb-6">Member Achievement Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progressStats.map((stat, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{stat.label}</span>
                <span className="text-sm" style={{ color: stat.color }}>
                  {stat.value} / {stat.total} ({stat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h4 className="text-gray-900 mb-4">Member Growth</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="members"
                stroke="#00a651"
                strokeWidth={3}
                dot={{ fill: "#00a651", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Attendance Trend */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h4 className="text-gray-900 mb-4">Event Attendance Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="attendance" fill="#00a651" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Type Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Type Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h4 className="text-gray-900 mb-4">Event Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-gray-900">Recent Events</h4>
            <Button variant="ghost" onClick={() => onNavigate("events")}>
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivityData.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor:
                          activity.type === "Workshop"
                            ? "#ffb81c20"
                            : activity.type === "GBM"
                            ? "#00a65120"
                            : "#ed1c2420",
                        color:
                          activity.type === "Workshop"
                            ? "#ffb81c"
                            : activity.type === "GBM"
                            ? "#00a651"
                            : "#ed1c24",
                      }}
                    >
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {activity.date}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {activity.attendees}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h4 className="text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => onNavigate("create-event")}
            className="bg-[#00a651] hover:bg-[#008a44] text-white h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Create Event</span>
            </div>
          </Button>
          <Button
            onClick={() => onNavigate("manual-checkin")}
            className="bg-[#ffb81c] hover:bg-[#e5a619] text-white h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <UserCheck className="w-6 h-6" />
              <span>Manual Check-In</span>
            </div>
          </Button>
          <Button
            onClick={() => onNavigate("member-management")}
            className="bg-[#ed1c24] hover:bg-[#d41920] text-white h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <Users className="w-6 h-6" />
              <span>Manage Members</span>
            </div>
          </Button>
          <Button
            onClick={() => onNavigate("attendance-logs")}
            className="bg-black hover:bg-gray-800 text-white h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <Activity className="w-6 h-6" />
              <span>Attendance Logs</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
